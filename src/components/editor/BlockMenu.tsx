'use client'

import * as React from 'react'
import { BubbleMenu, type Editor } from '@tiptap/react'
import {
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface BlockMenuProps {
  editor: Editor | null
}

export function BlockMenu({ editor }: BlockMenuProps) {
  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ placement: 'left-start', offset: [-40, 0], duration: 150 }}
      shouldShow={({ editor }) => editor.isFocused }
    >
      <div className="flex flex-col items-center gap-1 rounded-md border bg-background p-1 shadow-md">
        <Button
          size="icon"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
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

export default BlockMenu

