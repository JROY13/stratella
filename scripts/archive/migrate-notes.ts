import { createClient } from '@supabase/supabase-js';

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !(SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function migrate() {
  const { data: notes, error } = await supabase.from('notes').select('id, title, body');
  if (error) {
    console.error('Failed to fetch notes', error);
    return;
  }

  for (const note of notes ?? []) {
    const body = (note.body as string | null)?.trim();
    const title = note.title as string | null;
    if (!body || !title) continue;
    if (!/^<h[1-6]/i.test(body)) {
      const updatedBody = `<h1>${title}</h1>${body}`;
      await supabase.from('notes').update({ body: updatedBody }).eq('id', note.id);
      console.log(`Updated note ${note.id}`);
    }
  }
}

migrate()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
