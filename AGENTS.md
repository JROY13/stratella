# Agents (Stratella)

This file defines how Codex Agents should operate in this repository.

---

## Branch Hygiene / Rebase Policy

- Fetch and rebase the local `main` on `origin/main`.
- Create a fresh `task/<slug>` branch.
- Implement changes, run tests/linters, and commit.
- Rebase again before pushing.
- Push with `--force-with-lease` and open a PR.
- Rebase after `main` updates, force-pushing each time.

---

## Agent Roles

### Code Quality Agent

- Purpose: Identify lint errors, dead code, and inconsistent styles.
- Actions: Run `eslint`, `prettier`, and suggest codemods.
- Branch strategy: open PRs against `main`.

### Test Agent

- Purpose: Ensure adequate test coverage for new code.
- Actions: Create or modify unit tests in `__tests__/` directories.
- Constraint: Must not modify production logic.

### Documentation Agent

- Purpose: Keep documentation updated.
- Actions: Update `README.md`, inline code comments, and developer guides.

---

## Rules of Engagement

- Each task = one branch.
- Never modify `main` directly.
- Always rebase on `main` before opening a PR.
- Report conflicts clearly instead of guessing a resolution.
- Do not auto-resolve conflicts unless explicitly instructed.
- Use small, focused PRs.

---

## Build & Verification

- Run `npm run build` locally before committing to catch server/client boundary errors.
- Ensure any component using React hooks or browser APIs begins with `"use client"`.
- Verify `npm run lint`, `npm test`, and (if available) `npm run typecheck` all pass.
- Rebase on `main` and resolve conflicts locally before pushing.
