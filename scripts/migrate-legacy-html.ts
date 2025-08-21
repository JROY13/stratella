import { createClient } from '@supabase/supabase-js';
import { generateJSON, generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { JSDOM } from 'jsdom';

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !(SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Provide a DOM environment for TipTap's HTML utilities
const { window } = new JSDOM('');
(global as any).window = window;
(global as any).document = window.document;
(global as any).DOMParser = window.DOMParser;

const extensions = [StarterKit.configure({ history: {} }), TaskList, TaskItem];

async function migrate() {
  const { data: notes, error } = await supabase.from('notes').select('id, body');
  if (error) {
    console.error('Failed to fetch notes', error);
    return;
  }

  for (const note of notes ?? []) {
    const body = note.body as string | null;
    if (body && body.includes('<')) {
      try {
        const json = generateJSON(body, extensions);
        const html = generateHTML(json, extensions);
        await supabase.from('notes').update({ body: html }).eq('id', note.id);
        console.log(`Migrated note ${note.id}`);
      } catch (err) {
        console.error(`Failed to migrate note ${note.id}`, err);
      }
    }
  }
}

migrate().then(() => {
  console.log('Migration complete');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
