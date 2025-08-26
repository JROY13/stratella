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
  onToggle: (done: boolean) => void
  onDueChange: (value: string) => void
}

export default function TaskRow({ task, onToggle, onDueChange }: TaskRowProps) {
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
      />
    </li>
  )
}

