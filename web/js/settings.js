/**
* Themes
* @param main colo
* @param main-bright colo
* @param text colo
* @param background filter colo
*/
const themes = {
    theme1: [ 'rgb(32, 34, 40)', 'rgb(88, 219, 171)', 'rgb(255, 255, 255)', 'rgb(11, 12, 14)' ], // Mint
    theme2: [ 'rgb(21, 32, 33)', 'rgb(203, 202, 165)', 'rgb(255, 255, 255)', 'rgb(7, 11, 12)' ], // Cappuccino
    theme3: [ 'rgb(18, 18, 12)', 'rgb(169, 255, 112)', 'rgb(255, 255, 255)', 'rgb(6, 6, 4)' ], // Nature
    theme4: [ 'rgb(12, 28, 27)', 'rgb(104, 247, 238)', 'rgb(255, 255, 255)', 'rgb(4, 10, 9)' ], // Ocean
    theme5: [ 'rgb(23, 17, 6)', 'rgb(245, 182, 66)', 'rgb(255, 255, 255)', 'rgb(8, 6, 2)' ], // Terminal
    theme6: [ 'rgb(33, 9, 29)', 'rgb(250, 82, 141)', 'rgb(255, 255, 255)', 'rgb(12, 3, 10)' ], // Nightlife
    theme7: [ 'rgb(13, 11, 26)', 'rgb(128, 105, 250)', 'rgb(255, 255, 255)', 'rgb(5, 4, 7)' ], // Blurple
    theme8: [ 'rgb(252, 186, 3)', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'rgb(252, 186, 3)' ], // Construction
    theme9: [ 'rgb(0, 0, 0)', 'rgb(204, 204, 204)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)' ], // AMOLED
};

// Signal Units
const signalUnits = {
    dbf: ['dBf'],
    dbuv: ['dBµV'],
    dbm: ['dBm'],
};
const CHAT_SR_ANNOUNCEMENTS_KEY = "chatScreenReaderAnnouncements";
const CHAT_ENABLED_KEY = "chatEnabled";
const CHAT_HISTORY_LIMIT_KEY = "chatHistoryLimit";
const CHAT_HISTORY_COUNT_KEY = "chatHistoryCount";
const CHAT_HISTORY_LIMIT_DEFAULT = 50;
const A11Y_AUTO_TUNER_ANNOUNCEMENTS_KEY = "a11yAutoTunerAnnouncements";
const A11Y_STEREO_ANNOUNCEMENTS_KEY = "a11yStereoAnnouncements";

$(document).ready(() => {
    
    getInitialSettings();
    
    $('#login-form').submit(function (event) {
        event.preventDefault();
        
        $.ajax({
            type: 'POST',
            url: './login',
            data: $(this).serialize(),
            success: function (data) {
                sendToast('success', 'Login success!', data.message, false, true);
                setTimeout(function () {
                    location.reload(true);
                }, 1750);
            },
            error: function (xhr, status, error) {
                if (xhr.status === 403) {
                    sendToast('error', 'Login failed!', xhr.responseJSON.message, false, true);
                }
            }
        });
    });    
    
    $('.logout-link').click(function (event) {
        event.preventDefault();
        
        $.ajax({
            type: 'GET',  // Assuming the logout is a GET request, adjust accordingly
            url: './logout',
            success: function (data) {
                sendToast('success', 'Logout success!', data.message, false, true);
                setTimeout(function () {
                    location.reload(true);
                }, 1000);
            },
            error: function (xhr, status, error) {
                if (xhr.status === 403) {
                    sendToast('error', 'Logout failed!', xhr.responseJSON.message, false, true);
                }
            }
        });
    });
});

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateFavicon(color) {
    function rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);

        return "#" + result.slice(0, 3).map(x =>(+x).toString(16).padStart(2, "0")).join("");
    }

    const hex = rgbToHex(color);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="54" fill="none" stroke="${hex}" stroke-width="20"/>
        <circle cx="64" cy="64" r="22" fill="none" stroke="white" stroke-width="18"/>
    </svg>`;

    const base64 = btoa(svg);

    $('#favicon').attr(
        'href',
        `data:image/svg+xml;base64,${base64}`
    );
}

function setTheme(themeName) {
    const themeColors = themes[themeName];
    if (themeColors) {
        // Extracting the RGBA components from themeColors[2] for --color-text-2
        const rgbaComponentsText = themeColors[2].match(/(\d+(\.\d+)?)/g);
        const opacityText = parseFloat(rgbaComponentsText[3]);
        const newOpacityText = opacityText * 0.75;
        const textColor2 = `rgba(${rgbaComponentsText[0]}, ${rgbaComponentsText[1]}, ${rgbaComponentsText[2]})`;

        // Extracting the RGBA components from themeColors[0] for background colo
        const rgbaComponentsBackground = themeColors[3].match(/(\d+(\.\d+)?)/g);
        const backgroundOpacity = 0.75;
        const backgroundColorWithOpacity = `rgba(${rgbaComponentsBackground[0]}, ${rgbaComponentsBackground[1]}, ${rgbaComponentsBackground[2]}, ${backgroundOpacity})`;

        $(':root').css('--color-main', themeColors[0]);
        $(':root').css('--color-main-bright', themeColors[1]);
        $(':root').css('--color-text', themeColors[2]);
        $(':root').css('--color-text-2', textColor2);
        $('.wrapper-outer').css('background-color', backgroundColorWithOpacity);
        updateFavicon(themeColors[1]);
    }
}

function setBg() {
    const disableBackgroundParameter = getQueryParameter('disableBackground');
    if(localStorage.getItem('bgImage').length > 5 && localStorage.getItem('theme') != 'theme9' && disableBackgroundParameter != 'true') {
        $('body').css('background', 'url(' + localStorage.getItem('bgImage') + ') top center / cover fixed no-repeat var(--color-main)');
    } else {
        $('body').css('background', 'var(--color-main)');
    }
}

function getInitialSettings() {
    $.ajax({
        url: './static_data',
        dataType: 'json',
        success: function (data) {

            ['qthLatitude', 'qthLongitude', 'defaultTheme', 'bgImage', 'rdsMode', 'rdsTimeout', CHAT_ENABLED_KEY, CHAT_HISTORY_LIMIT_KEY, CHAT_HISTORY_COUNT_KEY].forEach(key => {
                if (data[key] !== undefined) {
                    localStorage.setItem(key, data[key]);
                }
            });
            
            data.presets.forEach((preset, index) => {
                localStorage.setItem(`preset${index + 1}`, preset);
            });

            loadInitialSettings();
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
}

function loadInitialSettings() {
    const themeSelector = $('#theme-selector');
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = localStorage.getItem('defaultTheme');
    const savedUnit = localStorage.getItem('signalUnit');

    themeSelector.find('input').val(themeSelector.find('.option[data-value="' + defaultTheme + '"]').text());
    
    if(defaultTheme && themes[defaultTheme]) {
        setTheme(defaultTheme);
    }

    const themeParameter = getQueryParameter('theme');
    if(themeParameter && themes[themeParameter]) {
        setTheme(themeParameter);
        themeSelector.find('input').val(themeSelector.find('.option[data-value="' + themeParameter + '"]').text());
    }
    
    if (savedTheme && themes[savedTheme]) {
        setTheme(savedTheme);
        themeSelector.find('input').val(themeSelector.find('.option[data-value="' + savedTheme + '"]').text());
    }
    
    themeSelector.on('click', '.option', (event) => {
        const selectedTheme = $(event.target).data('value');
        setTheme(selectedTheme);
        themeSelector.find('input').val($(event.target).text()); // Set the text of the clicked option to the input
        localStorage.setItem('theme', selectedTheme);
        setBg();
    });
    
    const signalSelector = $('#signal-selector');
    
    const signalParameter = getQueryParameter('signalUnits');
    if(signalParameter && !localStorage.getItem('signalUnit')) {
        signalSelector.find('input').val(signalSelector.find('.option[data-value="' + signalParameter + '"]').text());
        localStorage.setItem('signalUnit', signalParameter);
    } else {
        signalSelector.find('input').val(signalSelector.find('.option[data-value="' + savedUnit + '"]').text());
    }
    
    signalSelector.on('click', '.option', (event) => {
        const selectedSignalUnit = $(event.target).data('value');
        signalSelector.find('input').val($(event.target).text()); // Set the text of the clicked option to the input
        localStorage.setItem('signalUnit', selectedSignalUnit);
    });

    var extendedFreqRange = localStorage.getItem("extendedFreqRange");
    if (extendedFreqRange === "true") {
        $("#extended-frequency-range").prop("checked", true);
    }
    
    $("#extended-frequency-range").change(function() {
        var isChecked = $(this).is(":checked");
        localStorage.setItem("extendedFreqRange", isChecked);
    });
    
    const psUnderscoreParameter = getQueryParameter('psUnderscores');
    if(psUnderscoreParameter) {
        $("#ps-underscores").prop("checked", JSON.parse(psUnderscoreParameter));
    }
    
    var psUnderscores = localStorage.getItem("psUnderscores");
    if (psUnderscores) {
        $("#ps-underscores").prop("checked", JSON.parse(psUnderscores));
        localStorage.setItem("psUnderscores", psUnderscores);
    }
    
    $("#ps-underscores").change(function() {
        var isChecked = $(this).is(":checked");
        localStorage.setItem("psUnderscores", isChecked);
    });

    var imperialUnits = localStorage.getItem("imperialUnits");
    if (imperialUnits) {
        $("#imperial-units").prop("checked", JSON.parse(imperialUnits));
        localStorage.setItem("imperialUnits", imperialUnits);
    }
    
    $("#imperial-units").change(function() {
        var isChecked = $(this).is(":checked");
        localStorage.setItem("imperialUnits", isChecked);
    });

    const bindAccessibilityCheckbox = ($checkbox, storageKey, defaultValue) => {
        if (!$checkbox.length) return;

        const storedValue = localStorage.getItem(storageKey);
        if (storedValue === null) {
            localStorage.setItem(storageKey, defaultValue ? "true" : "false");
            $checkbox.prop("checked", defaultValue);
        } else {
            $checkbox.prop("checked", storedValue === "true");
        }

        $checkbox.change(function() {
            const isChecked = $(this).is(":checked");
            localStorage.setItem(storageKey, isChecked);
            if (typeof window.applyAccessibilitySettings === "function") {
                window.applyAccessibilitySettings();
            }
        });
    };

    bindAccessibilityCheckbox($("#a11y-auto-tuner-announcements"), A11Y_AUTO_TUNER_ANNOUNCEMENTS_KEY, false);
    bindAccessibilityCheckbox($("#a11y-stereo-announcements"), A11Y_STEREO_ANNOUNCEMENTS_KEY, true);
    bindAccessibilityCheckbox($("#chat-screen-reader-announcements"), CHAT_SR_ANNOUNCEMENTS_KEY, false);

    const chatEnabledToggle = $("#chat-enabled-toggle");
    const chatHistoryLimitSelector = $("#chat-history-limit-selector");
    const chatHistoryLimitInput = $("#chat-history-limit");
    const chatHistoryCountLabel = $("#chat-history-count");

    const normalizeChatHistoryLimit = (rawValue) => {
        const parsedValue = Number.parseInt(rawValue, 10);
        if (!Number.isFinite(parsedValue)) {
            return CHAT_HISTORY_LIMIT_DEFAULT;
        }
        return Math.max(10, Math.min(500, parsedValue));
    };

    const normalizeChatHistoryCount = (rawValue) => {
        const parsedValue = Number.parseInt(rawValue, 10);
        if (!Number.isFinite(parsedValue) || parsedValue < 0) {
            return 0;
        }
        return parsedValue;
    };

    const setChatHistoryLimitInput = (limitValue) => {
        const limit = normalizeChatHistoryLimit(limitValue);
        const matchingOption = chatHistoryLimitSelector.find('.option[data-value="' + limit + '"]');

        if (matchingOption.length) {
            chatHistoryLimitInput
                .val(matchingOption.text())
                .attr('data-value', String(limit));
        } else {
            chatHistoryLimitInput
                .val(limit + ' messages')
                .attr('data-value', String(limit));
        }
    };

    const getSelectedChatHistoryLimit = () => {
        const selectedValue = chatHistoryLimitInput.attr('data-value') || localStorage.getItem(CHAT_HISTORY_LIMIT_KEY);
        return normalizeChatHistoryLimit(selectedValue);
    };

    const setChatHistoryUsage = (countValue, limitValue) => {
        if (!chatHistoryCountLabel.length) {
            return;
        }

        const limit = normalizeChatHistoryLimit(limitValue ?? getSelectedChatHistoryLimit());
        const count = Math.min(normalizeChatHistoryCount(countValue), limit);
        chatHistoryCountLabel
            .text(count + ' / ' + limit)
            .attr('aria-label', 'Wiadomości w historii ' + count + ' z ' + limit);
    };

    const persistChatHistoryCount = (countValue) => {
        const count = normalizeChatHistoryCount(countValue);
        localStorage.setItem(CHAT_HISTORY_COUNT_KEY, count);
        return count;
    };

    const clearChatHistoryButton = $("#clear-chat-history");
    if (clearChatHistoryButton.length) {
        clearChatHistoryButton.on("click", function() {
            const confirmed = window.confirm("Clear chat history for all users?");
            if (!confirmed) return;

            const button = $(this);
            button.prop("disabled", true);

            $.ajax({
                type: 'POST',
                url: './chat/clear',
                success: function(response) {
                    const historyCount = response.historyCount !== undefined
                        ? persistChatHistoryCount(response.historyCount)
                        : persistChatHistoryCount(0);

                    setChatHistoryUsage(historyCount);
                    sendToast('success', 'Chat', response.message || 'Chat history cleared.', false, true);
                    if (typeof window.handleChatCleared === 'function') {
                        window.handleChatCleared();
                    }
                },
                error: function(xhr) {
                    const message = xhr?.responseJSON?.message || 'Unable to clear chat history.';
                    sendToast('error', 'Chat', message, false, true);
                },
                complete: function() {
                    button.prop("disabled", false);
                }
            });
        });
    }

    const saveChatAdminSettings = () => {
        const chatEnabled = chatEnabledToggle.is(":checked");
        const historyLimit = getSelectedChatHistoryLimit();

        $.ajax({
            type: 'POST',
            url: './chat/settings',
            contentType: 'application/json',
            data: JSON.stringify({
                enabled: chatEnabled,
                historyLimit: historyLimit
            }),
            success: function(response) {
                localStorage.setItem(CHAT_ENABLED_KEY, response.chatEnabled);
                localStorage.setItem(CHAT_HISTORY_LIMIT_KEY, response.historyLimit);
                const historyCount = response.historyCount !== undefined
                    ? persistChatHistoryCount(response.historyCount)
                    : normalizeChatHistoryCount(localStorage.getItem(CHAT_HISTORY_COUNT_KEY));
                setChatHistoryLimitInput(response.historyLimit);
                setChatHistoryUsage(historyCount, response.historyLimit);

                if (response.chatEnabled === false && typeof window.handleChatCleared === 'function') {
                    window.handleChatCleared();
                }

                if (response.restartRequired) {
                    sendToast('info', 'Chat', response.message || 'Chat settings saved. Restart required.', false, true);
                } else {
                    sendToast('success', 'Chat', response.message || 'Chat settings saved.', false, true);
                }
            },
            error: function(xhr) {
                const message = xhr?.responseJSON?.message || 'Unable to save chat settings.';
                sendToast('error', 'Chat', message, false, true);

                const savedChatEnabled = localStorage.getItem(CHAT_ENABLED_KEY);
                if (savedChatEnabled !== null) {
                    chatEnabledToggle.prop("checked", savedChatEnabled === "true");
                }

                setChatHistoryLimitInput(localStorage.getItem(CHAT_HISTORY_LIMIT_KEY));
                setChatHistoryUsage(localStorage.getItem(CHAT_HISTORY_COUNT_KEY));
            }
        });
    };

    if (chatEnabledToggle.length && chatHistoryLimitSelector.length && chatHistoryLimitInput.length) {
        const savedChatEnabled = localStorage.getItem(CHAT_ENABLED_KEY);
        if (savedChatEnabled !== null) {
            chatEnabledToggle.prop("checked", savedChatEnabled === "true");
        }

        setChatHistoryLimitInput(localStorage.getItem(CHAT_HISTORY_LIMIT_KEY));
        setChatHistoryUsage(localStorage.getItem(CHAT_HISTORY_COUNT_KEY));

        chatEnabledToggle.change(function() {
            saveChatAdminSettings();
        });

        chatHistoryLimitSelector.on("click", ".option", function() {
            setTimeout(saveChatAdminSettings, 0);
        });
    }

    if (typeof window.applyAccessibilitySettings === "function") {
        window.applyAccessibilitySettings();
    }
    
    $('.version-string').text(currentVersion);
    
    setBg();
}
