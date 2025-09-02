'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import DateFilterTrigger from './DateFilterTrigger'

interface Task {
  title: string
  done: boolean
  due?: string
}

interface TaskRowProps {
  task: Task
  onToggle: (done: boolean) => void | Promise<void>
  onDueChange: (value: string) => void | Promise<void>
}

export default function TaskRow({ task, onToggle, onDueChange }: TaskRowProps) {
  const label = task.due
    ? new Date(task.due).toLocaleDateString()
    : 'Set due date'

  return (
    <li className="flex items-center gap-2">
      <Checkbox
        checked={task.done}
        onCheckedChange={checked => onToggle(checked === true)}
        aria-label={task.done ? 'Mark task incomplete' : 'Mark task complete'}
      />
      <span className={cn('flex-1', task.done && 'line-through text-muted-foreground')}>
        {task.title}
      </span>
      <DateFilterTrigger
        value={task.due}
        onChange={onDueChange}
        onClear={() => onDueChange('')}
        variant="link"
        className="h-auto p-0 text-blue-600 hover:underline dark:text-blue-500"
      >
        {label}
      </DateFilterTrigger>
    </li>
  )
}

