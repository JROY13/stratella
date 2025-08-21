import { createClient } from '@supabase/supabase-js'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { marked } from 'marked'

async function toTiptapHTML(markdown: string) {
  const editor = new Editor({ extensions: [StarterKit, TaskList, TaskItem] })
  const html = marked(markdown)
  editor.commands.setContent(html, { parseOptions: { preserveWhitespace: true } })
  const out = editor.getHTML()
  editor.destroy()
  return out
}

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
  const { data, error } = await supabase.from('notes').select('id, body')
  if (error) throw error

  for (const note of data ?? []) {
    const body = note.body ?? ''
    const htmlRegex = /<[a-z][\s\S]*>/i
    if (!htmlRegex.test(body) && !body.includes('data-type')) {
      const html = await toTiptapHTML(body)
      const { error: updateErr } = await supabase
        .from('notes')
        .update({ body: html })
        .eq('id', note.id)
      if (updateErr) {
        console.error('Failed to update note', note.id, updateErr.message)
      } else {
        console.log('Updated note', note.id)
      }
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
