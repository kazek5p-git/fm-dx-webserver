# Local Safe Update Workflow

This repository contains custom production changes (chat, accessibility, UI, plugins).
To avoid losing them during upstream updates, use the safe update script instead of manual
`git pull` + file overwrites.

## One command update

```bash
cd /home/kazek/build/fm-dx-webserve
./scripts/fmdx-safe-update.sh --auto-commit
```

If script reports root-owned `.git` files, fix once:

```bash
sudo chown -R kazek:kazek /home/kazek/build/fm-dx-webserver/.git /home/kazek/build/fm-dx-webserve
```

Optional push to your fork branch:

```bash
./scripts/fmdx-safe-update.sh --auto-commit --auto-push
```

## What the script does

1. Creates restore snapshot in `.update-snapshots/<timestamp>`:
   - status before update
   - tracked diffs (`working_tree.patch`, `index.patch`)
   - untracked file list and archive
   - revision before/afte
2. Creates restore tag `backup/pre-update-<timestamp>`.
3. Stashes dirty working tree (including untracked files) if needed.
4. Fetches upstream and merges `origin/main` into local `main`.
5. Restores local stash.
6. Runs smoke checks for chat/accessibility critical paths.
7. Optionally commits and pushes updated state.

## Smoke checks

```bash
./scripts/fmdx-smoke-check.sh
```

Checks include:
- JS syntax (`node --check`) for critical files
- chat endpoints and settings hooks in code
- runtime `/static_data` response contains chat limit + count

## Recovery

If update fails/conflicts:
- use snapshot under `.update-snapshots/<timestamp>`
- restore by checkout/tag:

```bash
git checkout main
git reset --hard backup/pre-update-YYYYMMDD_HHMMSS
```

(Use hard reset only if you really want full rollback.)
