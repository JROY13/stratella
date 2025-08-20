import { Editor } from '@tiptap/core'
import { createInlineEditorExtensions } from '../InlineEditor'
import { describe, expect, it } from 'vitest'

function createEditor() {
  const extensions = createInlineEditorExtensions().filter(
    (ext) => ext.name !== 'dragHandle',
  )
  return new Editor({ extensions })
}

describe('getMarkdown serialization', () => {
  it('serializes headings and lists to markdown without HTML tags', () => {
    const editor = createEditor()
    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Heading' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Bullet' }],
                },
              ],
            },
          ],
        },
        {
          type: 'orderedList',
          attrs: { start: 1 },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'First' }],
                },
              ],
            },
          ],
        },
      ],
    })

    const md = editor.storage.markdown.getMarkdown()
    expect(md).toContain('# Heading')
    expect(md).toContain('- Bullet')
    expect(md).toContain('1. First')
    expect(md).not.toMatch(/</)
    editor.destroy()
  })

  it('serializes task items to markdown without HTML tags', () => {
    const editor = createEditor()
    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Todo' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Done' }],
                },
              ],
            },
          ],
        },
      ],
    })

    const md = editor.storage.markdown.getMarkdown()
    expect(md).toContain('- [ ] Todo')
    expect(md).toContain('- [x] Done')
    expect(md).not.toMatch(/</)
    editor.destroy()
  })
})

