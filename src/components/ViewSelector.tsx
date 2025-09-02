'use client'

import { LucideIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export type ViewOption = {
  value: string
  label: string
  icon: LucideIcon
}

interface ViewSelectorProps {
  options: ViewOption[]
  paramKey?: string
  defaultValue: string
  className?: string
}

export function ViewSelector({ options, paramKey = 'view', defaultValue, className }: ViewSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = searchParams.get(paramKey) ?? defaultValue

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramKey, value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className={cn(
        'inline-flex h-9 divide-x rounded-md border border-input bg-background overflow-hidden',
        className
      )}
    >
      {options.map(opt => {
        const Icon = opt.icon
        const active = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleClick(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 text-sm transition-colors',
              active
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            )}
            aria-pressed={active}
          >
            <Icon className="size-4" />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ViewSelector

