'use client'

import React from 'react'
import { Extension, type Range, type Editor } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import {
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CommandItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  command: (props: { editor: Editor; range: Range }) => void
}

const commandItems: CommandItem[] = [
  {
    title: 'Heading',
    icon: Heading2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Bulleted List',
    icon: List,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    icon: ListOrdered,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Checklist',
    icon: CheckSquare,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Quote',
    icon: Quote,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
]

export const SlashCommand = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: true,
        items: () => commandItems,
        render: () => {
          let component: ReactRenderer<CommandListProps, CommandListRef> | null = null
          let popup: TippyInstance | null = null
          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer<CommandListProps, CommandListRef>(
                CommandList,
                {
                  props,
                  editor: props.editor,
                }
              )

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                placement: 'bottom-start',
              })
            },
            onUpdate(props: SuggestionProps) {
              component?.updateProps(props)
              popup?.setProps({
                getReferenceClientRect: props.clientRect,
              })
            },
            onKeyDown(props: SuggestionProps & { event: KeyboardEvent }) {
              if (props.event.key === 'Escape') {
                popup?.hide()
                return true
              }
              return component?.ref?.onKeyDown(props) ?? false
            },
            onExit() {
              popup?.destroy()
              component?.destroy()
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

interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

interface CommandListRef {
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

  const upHandler = () => {
    setSelectedIndex((index) => (index + items.length - 1) % items.length)
  }

  const downHandler = () => {
    setSelectedIndex((index) => (index + 1) % items.length)
  }

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  return (
    <div className="flex flex-col rounded-md border bg-background p-1 shadow-md">
      {items.map((item, index) => (
        <Button
          key={item.title}
          variant={index === selectedIndex ? 'default' : 'ghost'}
          className="justify-start gap-2"
          onClick={() => selectItem(index)}
        >
          <item.icon className="size-4" />
          {item.title}
        </Button>
      ))}
    </div>
  )
}
)
CommandList.displayName = 'CommandList'

export default SlashCommand

