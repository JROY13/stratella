import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ priority: _p, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ''} />
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/components/UserMenu', () => ({
  __esModule: true,
  default: () => <div>Account</div>,
}))

const { getSession, onAuthStateChange } = vi.hoisted(() => {
  return {
    getSession: vi.fn(),
    onAuthStateChange: vi
      .fn()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  }
})

vi.mock('@/lib/supabase-client', () => ({
  supabaseClient: {
    auth: { getSession, onAuthStateChange, signOut: vi.fn() },
  },
}))

import Header from '../Header'

describe('Header', () => {
  beforeEach(() => {
    getSession.mockReset()
  })

  it('shows Login when no session', async () => {
    getSession.mockResolvedValueOnce({ data: { session: null } })

    const { findByText } = render(<Header />)
    expect(await findByText('Login')).toBeTruthy()
  })

  it('shows Account when session exists', async () => {
    getSession.mockResolvedValueOnce({ data: { session: {} } })

    const { findByText, queryByText } = render(<Header />)
    expect(await findByText('Account')).toBeTruthy()
    expect(queryByText('Login')).toBeNull()
  })
})

