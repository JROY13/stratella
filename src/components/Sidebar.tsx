'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

const items = [
  { href: '/tasks', label: 'Tasks' },
  { href: '/notes', label: 'Notes' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-48 shrink-0 border-r h-[calc(100dvh-3.5rem)] sticky top-14">
      <div className="p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Menu</div>
        <nav className="grid gap-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/')
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`rounded px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground
                  ${active ? 'bg-accent text-accent-foreground' : ''}`}
              >
                {it.label}
              </Link>
            )
          })}
        </nav>
        <Separator className="my-4" />
        <p className="px-3 text-xs text-muted-foreground">
          Tip: create tasks by typing '[] ' or by right clicking on highlighted text. These tasks will aggregate in &apos;Tasks&apos;
        </p>
      </div>
    </aside>
  )
}
