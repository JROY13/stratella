import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

import Footer from '../Footer'

describe('Footer', () => {
  it('renders footer links', () => {
    const { getByRole } = render(<Footer />)

    const about = getByRole('link', { name: 'About' }) as HTMLAnchorElement
    expect(about.getAttribute('href')).toBe('/about')
    expect(about.getAttribute('target')).toBeNull()

    const privacy = getByRole('link', { name: 'Privacy Policy' }) as HTMLAnchorElement
    expect(privacy.getAttribute('href')).toBe('/privacy')
    expect(privacy.getAttribute('target')).toBe('_blank')

    const terms = getByRole('link', { name: 'Terms of Service' }) as HTMLAnchorElement
    expect(terms.getAttribute('href')).toBe('/terms')
    expect(terms.getAttribute('target')).toBe('_blank')
  })
})
