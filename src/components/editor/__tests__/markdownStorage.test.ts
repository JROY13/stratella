import { Editor } from '@tiptap/core'
import { createInlineEditorExtensions } from '../InlineEditor'
import { describe, expect, it } from 'vitest'

function createEditor() {
  const extensions = createInlineEditorExtensions().filter(
    (ext) => ext.name !== 'dragHandle',
  )
  return new Editor({ extensions })
}

describe('markdown storage', () => {
  it('produces markdown for inserted content', () => {
    const editor = createEditor()
    editor.commands.insertContent({
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Heading' }],
    })
    editor.commands.insertContent({
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Bullet' }] },
          ],
        },
      ],
    })
    editor.commands.insertContent({
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          ],
        },
      ],
    })
    editor.commands.insertContent({
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Todo' }] },
          ],
        },
      ],
    })
    const md = editor.storage.markdown.getMarkdown()
    expect(md).toContain('# Heading')
    expect(md).toContain('- Bullet')
    expect(md).toContain('1. First')
    expect(md).toContain('- [ ] Todo')
    expect(md).not.toMatch(/</)
    editor.destroy()
  })
})

