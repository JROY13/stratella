import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

import BackButton from '../BackButton'

describe('BackButton', () => {
  beforeEach(() => {
    push.mockClear()
  })

  function setUserAgent(ua: string) {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: ua,
      configurable: true,
      writable: true,
    })
  }

  it('navigates on iOS', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
    const { getByRole } = render(<BackButton href="/notes" />)
    fireEvent.click(getByRole('button', { name: /go back/i }))
    expect(push).toHaveBeenCalledWith('/notes')
  })

  it('navigates on Android', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 10)')
    const { getByRole } = render(<BackButton href="/notes" />)
    fireEvent.click(getByRole('button', { name: /go back/i }))
    expect(push).toHaveBeenCalledWith('/notes')
  })
})

