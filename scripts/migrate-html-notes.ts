import { createClient } from '@supabase/supabase-js'
import { htmlToMarkdown } from '../src/lib/html'

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

  const updated: string[] = []

  for (const note of data ?? []) {
    const html = note.body ?? ''
    const markdown = htmlToMarkdown(html)
    const { error: updateErr } = await supabase
      .from('notes')
      .update({ body: markdown })
      .eq('id', note.id)

    if (updateErr) {
      console.error('Failed to update note', note.id, updateErr.message)
    } else {
      updated.push(String(note.id))
      console.log('Updated note', note.id)
    }
  }

  console.log('Migrated notes:', updated.join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
