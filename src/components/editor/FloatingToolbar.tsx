'use client'

import * as React from 'react'
import { BubbleMenu, type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface FloatingToolbarProps {
  editor: Editor | null
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
      }}
      shouldShow={({ editor }) =>
        !editor.state.selection.empty && editor.isFocused
      }
    >
      <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
        <Button
          size="icon"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          size="icon"
          variant={
            editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive('taskList') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare className="size-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </Button>
      </div>
    </BubbleMenu>
  )
}

export default FloatingToolbar

