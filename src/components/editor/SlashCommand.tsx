'use client'

import * as React from 'react'
import type { Editor, Range } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import tippy, { type Instance as TippyInstance } from 'tippy.js'

interface Command {
  title: string
  command: (opts: { editor: Editor; range: Range }) => void
}

export interface CommandListProps {
  items: Command[]
  command: (item: Command) => void
}

export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const CommandList = React.forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    }

    const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((index) => (index + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((index) => (index + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    }

    React.useImperativeHandle(ref, () => ({
      onKeyDown,
    }))

    return (
      <div className="flex flex-col gap-1 rounded-md border bg-background p-1 shadow-md">
        {items.map((item, index) => (
          <button
            key={index}
            className={`rounded-sm px-2 py-1 text-left text-sm ${
              index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => selectItem(index)}
          >
            {item.title}
          </button>
        ))}
      </div>
    )
  }
)
CommandList.displayName = 'CommandList'

export const SlashCommand = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: true,
        items: ({ query }: { query: string }) => {
          return [
            {
              title: 'Paragraph',
              command: ({ editor, range }: { editor: Editor; range: Range }) =>
                editor.chain().focus().deleteRange(range).setParagraph().run(),
            },
            {
              title: 'Heading',
              command: ({ editor, range }: { editor: Editor; range: Range }) =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleHeading({ level: 2 })
                  .run(),
            },
            {
              title: 'Bullet List',
              command: ({ editor, range }: { editor: Editor; range: Range }) =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBulletList()
                  .run(),
            },
          ].filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          )
        },
        render: () => {
          let component: ReactRenderer<CommandListRef, CommandListProps>
          let popup: TippyInstance[]

          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStart: (props: any) => {
              component = new ReactRenderer<CommandListRef, CommandListProps>(
                CommandList,
                {
                  props: {
                    items: props.items,
                    command: (item: Command) => props.command(item),
                  },
                  editor: props.editor,
                }
              )

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                placement: 'bottom-start',
              })
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onUpdate(props: any) {
              component.updateProps({
                items: props.items,
                command: (item: Command) => props.command(item),
              })

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }
              return component.ref?.onKeyDown(props) ?? false
            },
            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export default SlashCommand

