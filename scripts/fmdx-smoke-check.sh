#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [smoke] $*"
}

fail() {
    log "ERROR: $*"
    exit 1
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

check_file() {
    local file="$1"
    [[ -f "$file" ]] || fail "Missing file: $file"
}

check_contains() {
    local pattern="$1"
    local file="$2"
    grep -q "$pattern" "$file" || fail "Pattern '$pattern' not found in $file"
}

cd "$REPO_DIR"

require_cmd node
require_cmd grep

check_file server/chat.js
check_file server/endpoints.js
check_file web/index.ejs
check_file web/js/chat.js
check_file web/js/settings.js

node --check server/chat.js
node --check server/endpoints.js
node --check web/js/chat.js
node --check web/js/settings.js

check_contains "router.post('/chat/settings'" server/endpoints.js
check_contains "router.post('/chat/clear'" server/endpoints.js
check_contains "chatHistoryLimit" server/endpoints.js
check_contains "chatHistoryCount" server/endpoints.js
check_contains "chat-screen-reader-announcements" web/index.ejs
check_contains "chat-history-count" web/index.ejs
check_contains "setChatHistoryUsage" web/js/settings.js
check_contains "handleChatCleared" web/js/chat.js

if command -v curl >/dev/null 2>&1; then
    payload="$(curl -fsS --max-time 5 http://127.0.0.1:8080/static_data || true)"
    if [[ -n "$payload" ]]; then
        echo "$payload" | grep -q '"chatHistoryLimit"' || fail "Runtime /static_data missing chatHistoryLimit"
        echo "$payload" | grep -q '"chatHistoryCount"' || fail "Runtime /static_data missing chatHistoryCount"
        log "Runtime endpoint check passed."
    else
        log "Runtime endpoint check skipped (service not responding)."
    fi
fi

log "Smoke checks passed."
