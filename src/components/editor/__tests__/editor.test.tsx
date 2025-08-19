import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
vi.mock('@tiptap/react', async () => {
  const actual: any = await vi.importActual('@tiptap/react')
  return {
    ...actual,
    BubbleMenu: ({ children }: any) => <div>{children}</div>,
  }
})

import { Editor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import FloatingToolbar from '../FloatingToolbar'

beforeAll(() => {
  document.createRange = () => {
    const range = new Range()
    range.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    })
    range.getClientRects = () => ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    })
    return range
  }
  ;(Element.prototype as any).getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  })
  ;(Element.prototype as any).getClientRects = () => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  })
  ;(Text.prototype as any).getClientRects = () => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  })
  document.elementFromPoint = () => document.body
  window.scrollTo = () => {}
})

function createEditor(markdown = '') {
  const TaskItemExt = TaskItem.extend({
    addProseMirrorPlugins() {
      const name = this.name
      return [
        new Plugin({
          key: new PluginKey('taskItemClick'),
          props: {
            handleClickOn(view, _pos, node, nodePos, event) {
              const el = event.target as HTMLElement
              if (node.type.name === name && el.tagName === 'INPUT') {
                event.preventDefault()
                const checked = !node.attrs.checked
                view.dispatch(
                  view.state.tr.setNodeMarkup(nodePos, undefined, {
                    ...node.attrs,
                    checked,
                  })
                )
                view.focus()
                return true
              }
              return false
            },
          },
        }),
      ]
    },
  })

  const editor = new Editor({
    extensions: [
      StarterKit.configure({ history: {} }),
      TaskList,
      TaskItemExt,
      Placeholder,
      Markdown,
    ],
    content: '',
  })

  if (markdown) {
    const doc = editor.storage.markdown.parser.parse(markdown)
    editor.commands.setContent(doc)
  }

  return editor
}

describe('editor markdown and shortcuts', () => {
  test('serializes markdown on update', async () => {
    const user = userEvent.setup()
    const editor = createEditor('')
    const { container } = render(<EditorContent editor={editor} />)
    const el = container.querySelector('.ProseMirror') as HTMLElement
    await user.type(el, 'Hello')
    expect(editor.storage.markdown.getMarkdown()).toBe('Hello')
    editor.destroy()
  })

  test('converts bullet list shortcut', async () => {
    const user = userEvent.setup()
    const editor = createEditor('')
    const { container } = render(<EditorContent editor={editor} />)
    const el = container.querySelector('.ProseMirror') as HTMLElement
    await user.type(el, '- ')
    await user.type(el, 'Item')
    expect(editor.storage.markdown.getMarkdown()).toBe('- Item')
    editor.destroy()
  })

  test('syncs checklist with task state', async () => {
    const user = userEvent.setup()
    const editor = createEditor('- [ ] Task')
    const { container } = render(<EditorContent editor={editor} />)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLElement
    await user.click(checkbox)
    expect(editor.storage.markdown.getMarkdown()).toBe('- [x] Task')
    editor.destroy()
  })

  test('supports undo and redo', async () => {
    const user = userEvent.setup()
    const editor = createEditor('')
    const { container } = render(<EditorContent editor={editor} />)
    const el = container.querySelector('.ProseMirror') as HTMLElement
    await user.type(el, 'hello')
    expect(editor.storage.markdown.getMarkdown()).toBe('hello')
    editor.chain().undo().run()
    expect(editor.storage.markdown.getMarkdown()).toBe('')
    editor.chain().redo().run()
    expect(editor.storage.markdown.getMarkdown()).toBe('hello')
    editor.destroy()
  })
})

describe('FloatingToolbar accessibility', () => {
  test('toolbar buttons can be focused with keyboard', async () => {
    const user = userEvent.setup()
    const editor = createEditor('Sample text')
    render(
      <>
        <EditorContent editor={editor} />
        <FloatingToolbar editor={editor} />
      </>
    )
    await user.tab()
    await user.tab()
    const buttons = screen.getAllByRole('button')
    expect(document.activeElement).toBe(buttons[0])
    editor.destroy()
  })
})
