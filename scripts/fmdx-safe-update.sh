#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-origin}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
LOCAL_BRANCH="${LOCAL_BRANCH:-main}"
PUSH_REMOTE="${PUSH_REMOTE:-kazek}"
PUSH_BRANCH="${PUSH_BRANCH:-$LOCAL_BRANCH}"
SNAPSHOT_ROOT="${SNAPSHOT_ROOT:-$REPO_DIR/.update-snapshots}"

AUTO_COMMIT=0
AUTO_PUSH=0
RUN_SMOKE=1

usage() {
    cat <<'USAGE'
Usage: ./scripts/fmdx-safe-update.sh [options]

Safely update local branch from upstream while preserving local customizations.

Options:
  --auto-commit   Create commit after update if working tree changed
  --auto-push     Push LOCAL_BRANCH to PUSH_REMOTE/PUSH_BRANCH after success
  --skip-smoke    Skip smoke checks
  -h, --help      Show help

Environment overrides:
  UPSTREAM_REMOTE (default: origin)
  UPSTREAM_BRANCH (default: main)
  LOCAL_BRANCH    (default: main)
  PUSH_REMOTE     (default: kazek)
  PUSH_BRANCH     (default: LOCAL_BRANCH)
  SNAPSHOT_ROOT   (default: <repo>/.update-snapshots)
USAGE
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [safe-update] $*"
}

fail() {
    log "ERROR: $*"
    exit 1
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

check_git_permissions() {
    local current_use
    local current_group
    local non_owned

    current_user="$(id -un)"
    current_group="$(id -gn)"
    non_owned="$(find .git -not -user "$current_user" -print -quit 2>/dev/null || true)"

    if [[ -n "$non_owned" ]]; then
        fail "Found root-owned/non-$current_user files in .git. Run: sudo chown -R $current_user:$current_group $REPO_DIR/.git $REPO_DIR"
    fi
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --auto-commit)
            AUTO_COMMIT=1
            shift
            ;;
        --auto-push)
            AUTO_PUSH=1
            shift
            ;;
        --skip-smoke)
            RUN_SMOKE=0
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            fail "Unknown argument: $1"
            ;;
    esac
done

require_cmd git
require_cmd date
if (( RUN_SMOKE )); then
    require_cmd node
fi

mkdir -p "$SNAPSHOT_ROOT"

cd "$REPO_DIR"
[[ -d .git ]] || fail "Not a git repository: $REPO_DIR"
check_git_permissions

git config rerere.enabled true
git config rerere.autoupdate true

timestamp="$(date '+%Y%m%d_%H%M%S')"
snapshot_dir="$SNAPSHOT_ROOT/$timestamp"
mkdir -p "$snapshot_dir"

current_rev="$(git rev-parse HEAD)"
log "Current revision: $current_rev"

git status --porcelain > "$snapshot_dir/status.before.txt"
git diff > "$snapshot_dir/working_tree.patch" || true
git diff --cached > "$snapshot_dir/index.patch" || true
git ls-files --others --exclude-standard > "$snapshot_dir/untracked.list"

if [[ -s "$snapshot_dir/untracked.list" ]]; then
    tar -czf "$snapshot_dir/untracked.tgz" -T "$snapshot_dir/untracked.list" 2>/dev/null || true
fi

echo "$current_rev" > "$snapshot_dir/revision.before.txt"

restore_tag="backup/pre-update-$timestamp"
git tag -f "$restore_tag" "$current_rev" >/dev/null
log "Restore tag: $restore_tag"

has_local_changes=0
if ! git diff --quiet || ! git diff --cached --quiet || [[ -s "$snapshot_dir/untracked.list" ]]; then
    has_local_changes=1
fi

stash_name="safe-update-$timestamp"
if (( has_local_changes )); then
    log "Working tree dirty, creating stash ($stash_name)."
    git stash push -u -m "$stash_name" >/dev/null
fi

log "Fetching $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
git fetch --prune "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH"

log "Checking out $LOCAL_BRANCH"
git checkout "$LOCAL_BRANCH" >/dev/null

if git merge-base --is-ancestor "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" HEAD; then
    log "Upstream is already merged into $LOCAL_BRANCH."
else
    log "Merging $UPSTREAM_REMOTE/$UPSTREAM_BRANCH into $LOCAL_BRANCH"
    git merge --no-edit "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
fi

if (( has_local_changes )); then
    log "Restoring stashed local changes."
    if ! git stash pop --index >/dev/null; then
        log "Conflict while applying stashed changes."
        log "Snapshot: $snapshot_dir"
        log "Resolve conflicts manually, then continue with normal git workflow."
        exit 20
    fi
fi

if (( RUN_SMOKE )); then
    log "Running smoke checks."
    "$REPO_DIR/scripts/fmdx-smoke-check.sh"
fi

if (( AUTO_COMMIT )); then
    if ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
        git add -A
        git commit -m "sync: update from $UPSTREAM_REMOTE/$UPSTREAM_BRANCH and preserve local customizations ($timestamp)"
        log "Auto-commit created."
    else
        log "No changes to commit."
    fi
fi

if (( AUTO_PUSH )); then
    log "Pushing $LOCAL_BRANCH to $PUSH_REMOTE/$PUSH_BRANCH"
    git push "$PUSH_REMOTE" "$LOCAL_BRANCH:$PUSH_BRANCH"
fi

new_rev="$(git rev-parse HEAD)"
echo "$new_rev" > "$snapshot_dir/revision.after.txt"
git status --porcelain > "$snapshot_dir/status.after.txt"

log "Completed. New revision: $new_rev"
log "Snapshot stored at: $snapshot_dir"
