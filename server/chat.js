const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { serverConfig } = require('./server_config');
const { logChat, logInfo, logWarn } = require('./console');
const helpers = require('./helpers');

const CHAT_HISTORY_DEFAULT = 50;
const CHAT_HISTORY_MIN = 10;
const CHAT_HISTORY_MAX = 500;
const CHAT_HISTORY_FILE = path.join(__dirname, '..', 'data', 'chat_history.json');

function normalizeChatHistoryLimit(value) {
    const parsedValue = Number.parseInt(value, 10);
    if (!Number.isFinite(parsedValue)) {
        return CHAT_HISTORY_DEFAULT;
    }
    return Math.min(CHAT_HISTORY_MAX, Math.max(CHAT_HISTORY_MIN, parsedValue));
}

function getChatHistoryLimit() {
    const limit = normalizeChatHistoryLimit(serverConfig.webserver.chatHistoryLimit);
    serverConfig.webserver.chatHistoryLimit = limit;
    return limit;
}

function saveChatHistory(storage) {
    const historyLimit = getChatHistoryLimit();
    try {
        fs.mkdirSync(path.dirname(CHAT_HISTORY_FILE), { recursive: true });
        fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(storage.chatHistory.slice(-historyLimit), null, 2), 'utf8');
    } catch (error) {
        logWarn(`Unable to save chat history: ${error.message}`);
    }
}

function loadChatHistory(storage) {
    const historyLimit = getChatHistoryLimit();
    if (!fs.existsSync(CHAT_HISTORY_FILE)) return;

    try {
        const parsed = JSON.parse(fs.readFileSync(CHAT_HISTORY_FILE, 'utf8'));
        if (!Array.isArray(parsed)) return;

        const loadedMessages = parsed
            .filter((entry) => entry && typeof entry === 'object')
            .map((entry) => ({
                nickname: String(entry.nickname || '').substring(0, 32),
                message: String(entry.message || '').substring(0, 255),
                time: String(entry.time || ''),
                ip: String(entry.ip || ''),
                admin: Boolean(entry.admin)
            }))
            .filter((entry) => entry.nickname && entry.message)
            .slice(-historyLimit);

        storage.chatHistory.length = 0;
        storage.chatHistory.push(...loadedMessages);

        if (loadedMessages.length > 0) {
            logInfo(`Loaded ${loadedMessages.length} chat messages from disk.`);
        }
    } catch (error) {
        logWarn(`Unable to load chat history: ${error.message}`);
    }
}

function heartbeat() { // WebSocket heartbeat helpe
    this.isAlive = true;
}

function createChatServer(storage) {
    if (!serverConfig.webserver.chatEnabled) {
        return null;
    }

    loadChatHistory(storage);

    const chatWss = new WebSocket.Server({ noServer: true });

    chatWss.getHistoryLimit = () => getChatHistoryLimit();
    chatWss.getHistoryCount = () => storage.chatHistory.length;

    chatWss.setHistoryLimit = (nextLimit) => {
        const normalizedLimit = normalizeChatHistoryLimit(nextLimit);
        serverConfig.webserver.chatHistoryLimit = normalizedLimit;

        if (storage.chatHistory.length > normalizedLimit) {
            storage.chatHistory.splice(0, storage.chatHistory.length - normalizedLimit);
        }

        saveChatHistory(storage);
        return normalizedLimit;
    };

    chatWss.clearHistory = () => {
        const clearedMessages = storage.chatHistory.length;
        storage.chatHistory.length = 0;
        saveChatHistory(storage);

        chatWss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'chatCleared' }));
            }
        });

        return clearedMessages;
    };

    chatWss.on('connection', (ws, request) => {
        ws.isAlive = true;
        ws.on('pong', heartbeat);

        const clientIp =
            request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress;

        const userCommandHistory = {};

        if (serverConfig.webserver.banlist?.includes(clientIp)) {
            ws.close(1008, 'Banned IP');
            return;
        }

        // Send chat history safely
        storage.chatHistory.forEach((message) => {
            const historyMessage = { ...message, history: true };

            if (!request.session?.isAdminAuthenticated) {
                delete historyMessage.ip;
            }

            ws.send(JSON.stringify(historyMessage));
        });

        ws.send(JSON.stringify({
            type: 'clientIp',
            ip: clientIp,
            admin: request.session?.isAdminAuthenticated
        }));

        const userCommands = {};
        let lastWarn = { time: 0 };

        ws.on('message', (message) => {
            message = helpers.antispamProtection(
                message,
                clientIp,
                ws,
                userCommands,
                lastWarn,
                userCommandHistory,
                '5',
                'chat',
                512
            );

            if (!message) return;

            let messageData;

            try {
                messageData = JSON.parse(message);
            } catch {
                ws.send(JSON.stringify({ error: "Invalid message format" }));
                return;
            }

            delete messageData.admin;
            delete messageData.ip;
            delete messageData.time;

            if (messageData.nickname != null) {
                messageData.nickname = helpers.escapeHtml(String(messageData.nickname));
            } else {
                return;
            }

            messageData.ip = clientIp;

            const now = new Date();
            messageData.time =
                String(now.getHours()).padStart(2, '0') +
                ":" +
                String(now.getMinutes()).padStart(2, '0');

            if (serverConfig.webserver.banlist?.includes(clientIp)) return;

            if (request.session?.isAdminAuthenticated === true) {
                messageData.admin = true;
            }

            if (messageData.nickname?.length > 32) {
                messageData.nickname = messageData.nickname.substring(0, 32);
            }

            if (messageData.message?.length > 255) {
                messageData.message = messageData.message.substring(0, 255);
            }

            storage.chatHistory.push(messageData);

            if (storage.chatHistory.length > getChatHistoryLimit()) {
                storage.chatHistory.shift();
            }
            saveChatHistory(storage);

            logChat(messageData);

            chatWss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    const responseMessage = { ...messageData };

                    if (!request.session?.isAdminAuthenticated) {
                        delete responseMessage.ip;
                    }

                    client.send(JSON.stringify(responseMessage));
                }
            });
        });

        ws.on('close', () => {
            ws.isAlive = false;
        });
    });

    /**
     * We will not always be receiving data, so some proxies may terminate the connection, this prevents it.
     */
    const interval = setInterval(() => {
        chatWss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    chatWss.on('close', () => {
        clearInterval(interval);
    });

    return chatWss;
}

module.exports = { createChatServer };
