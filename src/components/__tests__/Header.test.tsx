import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  __esModule: true,
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
  default: () => <div />,
}))

vi.mock('@/lib/supabase-client', () => ({
  supabaseClient: { auth: { signOut: vi.fn() } },
}))

import Header from '../Header'

describe('Header', () => {
  it('renders link to Why Stratella', () => {
    const { getByRole } = render(<Header />)
    const link = getByRole('link', { name: 'Why Stratella' }) as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/why-stratella')
  })
})
