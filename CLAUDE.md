# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands should be run from the `web/` directory.

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
- `npm test` - Run Vitest unit tests
- `npm run test:e2e` - Run Playwright end-to-end tests
  - E2E tests are located in `web/e2e/`
  - Unit tests are co-located with components in `__tests__/` directories

### Migrations
- `npm run migrate:legacy-html` - Migrate legacy HTML format notes

## Architecture

**Stratella** is a task-focused note-taking app built with Next.js 15, React 19, Supabase, and TipTap editor.

### Core Concept
Notes contain markdown-style task lists (`- [ ] task` or `- [x] done`). Tasks are parsed from note HTML and synced to a `note_tasks` table for unified task views. The app extracts task metadata like `due:2024-01-15`, `#tags`, and completion status.

### Key Data Flow
1. **Notes → Tasks**: When notes are saved via `saveNoteInline()` or `upsertNoteWithClientId()` in `src/app/actions.ts`, the `syncNoteTasks()` function parses tasks from HTML using `extractTasksFromHtml()` (in `src/lib/taskparse.ts`) and syncs them to the `note_tasks` database table.

2. **Task Parsing**: `src/lib/taskparse.ts` is the central parser. It extracts tasks from both markdown and HTML (via JSDOM), pulling out text, checked state, due dates, tags, and status. It supports both string HTML and ProseMirror JSON structures.

3. **Authentication**: Server actions use `requireUser()` to ensure authenticated access. Supabase client is created via `await supabaseServer()` (async) for server components and `supabaseClient` for client components. Note: `supabaseServer()` returns a Promise as of the 2025-10-06 update to `@supabase/ssr`.

### Component Structure
- **`src/app/`** - Next.js App Router pages and layouts
  - `actions.ts` - Server actions for CRUD operations and task syncing
  - `notes/` - Notes list and individual note pages
  - `tasks/` - Unified task view across all notes
  - `(auth)/` - Login and authentication pages

- **`src/components/editor/`** - TipTap-based editor
  - `InlineEditor.tsx` - Main editor with autosave, retry logic, task support
  - `FloatingToolbar.tsx` - Text formatting toolbar
  - `MobileToolbar.tsx` - Mobile-specific toolbar
  - `extensions/task-list.ts` - Custom TipTap task extensions with metadata (due dates, tags)

- **`src/lib/`** - Shared utilities
  - `taskparse.ts` - Task extraction and filtering logic
  - `note.ts` - Note title extraction
  - `supabase-client.ts` - Browser client using `@supabase/ssr`
  - `supabase-server.ts` - Async server client using `@supabase/ssr` (returns Promise)

### Important Patterns
- **React Server Components**: Most pages use RSC by default. Components using hooks or browser APIs must have `"use client"` directive.
- **Server Actions**: All mutations go through server actions in `src/app/actions.ts` and call `revalidatePath()` to update cached data.
- **Autosave**: `InlineEditor` throttles saves (700ms) and implements exponential backoff retry on failure.
- **Task Metadata**: Tasks support `due:YYYY-MM-DD`, `#hashtags`, `tag:value`, and `status:value` syntax parsed from task text.

## Development Workflow

### Pull Request Workflow (REQUIRED)
**All changes must go through pull requests for code review.**

1. **Create a feature branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   # Make changes
   npm test && npm run build  # Verify locally
   git add .
   git commit -m "feat: your feature description"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   gh pr create --title "feat: your feature" --body "Description of changes"
   ```

4. **Wait for CI checks to pass:**
   - Tests must pass (63/63)
   - Build must succeed
   - Linter must pass

5. **Review and merge:**
   - Review the changes in GitHub
   - Merge via GitHub UI or `gh pr merge`

### Branch Naming Convention
- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `chore/<description>` - Maintenance tasks
- `docs/<description>` - Documentation updates

### Pre-Commit Checklist
- Run `npm test` - All 63 tests must pass
- Run `npm run build` - Must complete without errors
- Run `npm run lint` - No warnings or errors
- Components with React hooks or browser APIs need `"use client"`
- Database changes require migrations in `supabase/migrations/`
