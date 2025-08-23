'use client'

import { useRouter } from 'next/navigation'
import React, { startTransition, useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface NavButtonProps extends React.ComponentProps<typeof Button> {
  href: string
}

export function NavButton({ href, children, ...props }: NavButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    router.prefetch(href)
  }, [href, router])

  const handleClick = useCallback(() => {
    setPending(true)
    const start = performance.now()
    startTransition(() => {
      try {
        router.push(href)
        console.log(`[nav] ${href}`, { duration: performance.now() - start })
      } catch (err) {
        console.error(`[nav-error] ${href}`, err)
        setPending(false)
      }
    })
  }, [href, router])

  return (
    <Button type="button" onClick={handleClick} disabled={pending} {...props}>
      {children}
    </Button>
  )
}
