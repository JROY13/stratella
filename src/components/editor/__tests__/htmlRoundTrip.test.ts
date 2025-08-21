import { Editor } from '@tiptap/core'
import { createInlineEditorExtensions } from '../InlineEditor'
import { describe, expect, it } from 'vitest'

function createEditor() {
  const extensions = createInlineEditorExtensions().filter(
    ext => ext.name !== 'dragHandle',
  )
  return new Editor({ extensions })
}

describe('HTML round trip', () => {
  it('preserves headings and lists', () => {
    const editor = createEditor()
    const html = [
      '<h1>Heading</h1>',
      '<ul><li><p>Bullet</p></li></ul>',
      '<ol><li><p>First</p></li></ol>',
    ].join('')
    editor.commands.setContent(html, { parseOptions: { preserveWhitespace: true } })

    const out = editor.getHTML()
    expect(out).toContain('<h1>Heading</h1>')
    expect(out).toContain('<ul')
    expect(out).toContain('<ol')
    editor.destroy()
  })

  it('preserves task items', () => {
    const editor = createEditor()
    const html =
      '<ul data-type="taskList">' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>Todo</span></label></li>' +
      '<li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span>Done</span></label></li>' +
      '</ul>'
    editor.commands.setContent(html, { parseOptions: { preserveWhitespace: true } })

    const out = editor.getHTML()
    expect(out).toContain('data-type="taskList"')
    expect(out).toContain('data-checked="false"')
    expect(out).toContain('data-checked="true"')
    editor.destroy()
  })
})

