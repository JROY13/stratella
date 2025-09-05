import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import { createInlineEditorExtensions } from '../InlineEditor'
import './setup'

describe('list item input rules', () => {
  it('Enter creates a new list item', () => {
    const editor = new Editor({ extensions: createInlineEditorExtensions() })

    editor.commands.toggleBulletList()
    editor.commands.insertContent('one')
    editor.commands.enter()

    const json = editor.getJSON()
    expect(json.content?.[0].type).toBe('bulletList')
    expect(json.content?.[0].content).toHaveLength(2)
    editor.destroy()
  })

  it('Enter on empty item exits the list', () => {
    const editor = new Editor({ extensions: createInlineEditorExtensions() })

    editor.commands.toggleBulletList()
    editor.commands.insertContent('one')
    editor.commands.enter()
    editor.commands.enter()

    const json = editor.getJSON()
    expect(json.content?.[0].type).toBe('bulletList')
    expect(json.content?.[0].content).toHaveLength(1)
    expect(json.content?.[1].type).toBe('paragraph')
    editor.destroy()
  })

  it('Backspace at start converts item to paragraph', () => {
    const editor = new Editor({ extensions: createInlineEditorExtensions() })

    editor.commands.toggleBulletList()
    editor.commands.insertContent('one')
    const { from } = editor.state.selection
    editor.commands.setTextSelection({ from: from - 3, to: from - 3 })
    editor.commands.keyboardShortcut('Backspace')

    const json = editor.getJSON()
    expect(json.content?.[0].type).toBe('paragraph')
    expect(json.content?.[0].content?.[0].text).toBe('one')
    editor.destroy()
  })
})
