import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.ComponentProps<'div'>) => (
    <div role="menuitem" {...props}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div role="separator" />,
}))

vi.mock('@/lib/supabase-client', () => {
  const signOut = vi.fn().mockResolvedValue(undefined)
  return {
    supabaseClient: {
      auth: {
        signOut,
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
    },
  }
})

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

import { supabaseClient } from '@/lib/supabase-client'
import UserMenu from '../UserMenu'

describe('UserMenu', () => {
  it('renders menu items and signs out', async () => {
    const { getByRole, getByText } = render(<UserMenu />)

    fireEvent.click(getByRole('button', { name: 'Account' }))

    expect(getByText('Sign out')).toBeTruthy()
    expect(getByText('Terms')).toBeTruthy()
    expect(getByText('Privacy')).toBeTruthy()
    expect(getByText('Support')).toBeTruthy()
    expect(getByText('Keyboard shortcuts')).toBeTruthy()

    const emailLink = getByRole('link', {
      name: 'Email support',
    }) as HTMLAnchorElement
    expect(emailLink.getAttribute('href')).toBe(
      'mailto:support@canvasinnovations.io'
    )

    fireEvent.click(getByText('Sign out'))
    await waitFor(() => expect(supabaseClient.auth.signOut).toHaveBeenCalled())
  })
})

