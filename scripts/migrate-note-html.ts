import { createClient } from '@supabase/supabase-js'
import { htmlToMarkdown } from '../src/lib/html'
import { saveNoteInline } from '../src/app/actions'

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('notes')
    .select('id, body')
    .or('body.ilike.%<%,body.ilike.%data-type=%')

  if (error) {
    throw error
  }

  for (const note of data ?? []) {
    const body = note.body ?? ''
    if (/<[a-z][\s\S]*>/i.test(body) || body.includes('data-type')) {
      const markdown = htmlToMarkdown(body)
      await saveNoteInline(String(note.id), markdown, { revalidate: false })
      console.log('Migrated note', note.id)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
