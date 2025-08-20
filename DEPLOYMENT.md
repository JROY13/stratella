# Deployment Notes

## HTML Notes Migration

To convert existing HTML notes to Markdown in production:

1. Set the Supabase credentials:
   ```bash
   export SUPABASE_URL="https://your-project-ref.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   export NODE_ENV=production
   ```
2. Run the migration script:
   ```bash
   node --import tsx scripts/migrate-html-notes.ts
   ```
   The script logs each updated note ID and prints a summary line:
   ```
   Migrated notes: id1, id2, ...
   ```
3. Verify no notes still contain HTML markers:
   ```sql
   select id from notes where body ilike '%<%' or body ilike '%data-type=%';
   ```
   The query should return zero rows.

