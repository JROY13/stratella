
## `Agents.md`

````markdown
# Agents

This file defines how Codex Agents should operate in the **Stratella** repository.

---

## Branch Hygiene / Rebase Policy

**Goal:** Ensure every task branch is created fresh from the latest `main`, stays up to date, and avoids merge conflicts.

### Procedure (full)

```bash
# 0) Ensure remote is configured
git remote -v || true
git remote get-url origin >/dev/null 2>&1 || git remote add origin https://github.com/JROY13/stratella.git

# 1) Make sure we have the latest main
git fetch origin
git show-ref --verify --quiet refs/heads/main || git checkout -B main origin/main
git checkout main
git pull --rebase origin main

# 2) Create or switch to the task branch
git checkout -B task/<slug>

# 3) Rebase task branch onto latest main
git fetch origin
git rebase origin/main || REBASE_FAILED=1

# 4) If conflicts, stop and report
if [ "${REBASE_FAILED}" = "1" ]; then
  echo "::CONFLICTS::"
  git diff --name-only --diff-filter=U
  git rebase --abort
  exit 2
fi

# 5) Push safely
git push --force-with-lease -u origin task/<slug>
````

* Never modify `main` directly.
* Do not auto-resolve conflicts unless explicitly instructed.
* Always rebase before opening a PR.

### Quick Ask Template

If you need to trigger a rebase manually, you can ask:

> **“Rebase this task branch on the latest `main` so it’s up to date and won’t cause merge conflicts.”**

---

## Agent Roles

### Code Quality Agent

* Purpose: Identify lint errors, dead code, and inconsistent styles.
* Actions: Run `eslint`, `prettier`, suggest codemods.
* Branch strategy: open PRs against `main`.

### Test Agent

* Purpose: Ensure adequate test coverage for new code.
* Actions: Create/modify unit tests in `__tests__/` directories.
* Must not modify production logic.

### Documentation Agent

* Purpose: Keep documentation updated.
* Actions: Update `README.md`, inline code comments, and developer guides.

---

## Rules of Engagement

* Each Task = one branch.
* Always rebase on `main` before PR.
* Report conflicts clearly instead of trying to guess a resolution.
* Use small, focused PRs.

````

---

## `.github/workflows/require-up-to-date.yml`

```yaml
name: Require Up-To-Date
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Ensure branch is up to date with base
        run: |
          if [ "${{ github.event.pull_request.mergeable_state }}" = "behind" ]; then
            echo "Branch is behind base; update or rebase required.";
            exit 1;
          fi
````

