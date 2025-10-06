'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import DateFilterTrigger from './DateFilterTrigger'
import { toggleTaskFromNote, setTaskDueFromNote } from '@/app/actions'
import { startTransition, useState } from 'react'

interface Task {
  title: string
  done: boolean
  due?: string
  highlight?: string | null
}

interface TaskRowProps {
  task: Task
  noteId: string
  line: number
}

export default function TaskRow({ task, noteId, line }: TaskRowProps) {
  const [error, setError] = useState<string | null>(null)

  const label = task.due
    ? new Date(task.due).toLocaleDateString()
    : 'Set due date'

  function handleToggle() {
    setError(null)
    startTransition(() => {
      toggleTaskFromNote(noteId, line).catch((err) => {
        console.error('Failed to toggle task:', err)
        setError('Failed to update task. Please try again.')
      })
    })
  }

  function handleDueChange(value: string) {
    setError(null)
    const fd = new FormData()
    fd.append('due', value)
    startTransition(() => {
      setTaskDueFromNote(noteId, line, fd).catch((err) => {
        console.error('Failed to set due date:', err)
        setError('Failed to set due date. Please try again.')
      })
    })
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <Checkbox
          className="mt-1"
          checked={task.done}
          onCheckedChange={() => handleToggle()}
          aria-label={task.done ? 'Mark task incomplete' : 'Mark task complete'}
        />
        <span className={cn('flex-1', task.done && 'line-through text-muted-foreground')}>
          {task.highlight ? (
            <span
              dangerouslySetInnerHTML={{ __html: task.highlight }}
              suppressHydrationWarning
            />
          ) : (
            task.title
          )}
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
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 ml-8">{error}</p>
      )}
    </li>
  )
}

