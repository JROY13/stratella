'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?: string
  className?: string
}

export default function BackButton({ href = '/', className }: BackButtonProps) {
  const router = useRouter()
  const handleClick = React.useCallback(() => {
    router.push(href)
  }, [router, href])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Go back"
      className={cn('md:hidden', className)}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
}

