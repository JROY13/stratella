'use client'

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type ComponentProps,
} from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { track } from '@/lib/analytics'

export interface DateFilterTriggerProps {
  value?: string
  onChange: (value: string) => void
  onClear?: () => void
  className?: string
  variant?: ComponentProps<typeof Button>['variant']
  children?: ReactNode
}

export default function DateFilterTrigger({
  value,
  onChange,
  onClear,
  className,
  variant = 'outline',
  children,
}: DateFilterTriggerProps) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const d = value ? new Date(value) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [focusDate, setFocusDate] = useState<Date | undefined>(() => (value ? new Date(value) : new Date()))
  const overlayRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  function format(d: Date) {
    return d.toISOString().slice(0, 10)
  }

  const handleSelect = useCallback(
    (d: Date) => {
      onChange(format(d))
      track('tasks.datepicker.date_set', { note_id: 'tasks' })
      setOpen(false)
    },
    [onChange]
  )

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (focusDate) handleSelect(focusDate)
      } else if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        e.preventDefault()
        if (!focusDate) return
        const next = new Date(focusDate)
        if (e.key === 'ArrowLeft') next.setDate(next.getDate() - 1)
        if (e.key === 'ArrowRight') next.setDate(next.getDate() + 1)
        if (e.key === 'ArrowUp') next.setDate(next.getDate() - 7)
        if (e.key === 'ArrowDown') next.setDate(next.getDate() + 7)
        setFocusDate(next)
        setMonth(new Date(next.getFullYear(), next.getMonth(), 1))
        const btn = gridRef.current?.querySelector<HTMLButtonElement>(
          `[data-date="${format(next)}"]`
        )
        btn?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, focusDate, handleSelect])

  useEffect(() => {
    if (!open) return
    const overlay = overlayRef.current
    const focusables = overlay?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables?.[0]
    const last = focusables?.[focusables.length - 1]
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        ;(last as HTMLElement).focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        ;(first as HTMLElement).focus()
      }
    }
    overlay?.addEventListener('keydown', trap)
    ;(first as HTMLElement)?.focus()
    return () => overlay?.removeEventListener('keydown', trap)
  }, [open])

  function handleToday() {
    handleSelect(new Date())
  }

  function handleTomorrow() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    handleSelect(d)
  }

  function handleClear() {
    onClear?.()
    track('tasks.datepicker.cleared', { note_id: 'tasks' })
    setOpen(false)
  }

  function days() {
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const arr: (Date | null)[] = []
    for (let i = 0; i < start.getDay(); i++) arr.push(null)
    for (let d = 1; d <= end.getDate(); d++) {
      arr.push(new Date(month.getFullYear(), month.getMonth(), d))
    }
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant={variant}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() =>
          setOpen(o => {
            const next = !o
            if (next) track('tasks.datepicker.opened', { note_id: 'tasks' })
            return next
          })
        }
      >
        {(children ?? value) || 'Select date'}
      </Button>
      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="absolute z-50 mt-2 rounded-md border bg-popover p-3 shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium">
              {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                }
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                }
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div ref={gridRef} className="mb-2 grid grid-cols-7 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d}>{d}</div>
            ))}
            {days().map((d, i) => (
              <Button
                key={i}
                type="button"
                size="sm"
                variant={d && value === format(d) ? 'default' : 'ghost'}
                className="h-8 w-8 p-0"
                disabled={!d}
                onClick={d ? () => handleSelect(d) : undefined}
                onFocus={d ? () => setFocusDate(d) : undefined}
                data-date={d ? format(d) : undefined}
              >
                {d ? d.getDate() : ''}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={handleToday}>
              Today
            </Button>
            <Button type="button" variant="ghost" onClick={handleTomorrow}>
              Tomorrow
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

