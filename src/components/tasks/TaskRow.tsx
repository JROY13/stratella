'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import DateFilterTrigger from './DateFilterTrigger'
import { toggleTaskFromNote, setTaskDueFromNote } from '@/app/actions'
import { startTransition } from 'react'

interface Task {
  title: string
  done: boolean
  due?: string
}

interface TaskRowProps {
  task: Task
  noteId: string
  line: number
}

export default function TaskRow({ task, noteId, line }: TaskRowProps) {
  const label = task.due
    ? new Date(task.due).toLocaleDateString()
    : 'Set due date'

  function handleToggle() {
    startTransition(() => {
      void toggleTaskFromNote(noteId, line)
    })
  }

  function handleDueChange(value: string) {
    const fd = new FormData()
    fd.append('due', value)
    startTransition(() => {
      void setTaskDueFromNote(noteId, line, fd)
    })
  }

  return (
    <li className="flex items-start gap-2">
      <Checkbox
        className="mt-1"
        checked={task.done}
        onCheckedChange={() => handleToggle()}
        aria-label={task.done ? 'Mark task incomplete' : 'Mark task complete'}
      />
      <span className={cn('flex-1', task.done && 'line-through text-muted-foreground')}>
        {task.title}
      </span>
      <DateFilterTrigger
        value={task.due}
        onChange={handleDueChange}
        onClear={() => handleDueChange('')}
        variant="link"
        className="h-6 px-2 text-blue-600 hover:underline dark:text-blue-500"
      >
        {label}
      </DateFilterTrigger>
    </li>
  )
}

