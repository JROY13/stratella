import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/lib/supabase-client', () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}))

import SignInForm from '../auth/SignInForm'

describe('SignInFormLegal', () => {
  it('shows acknowledgement text with links in sign-up mode', () => {
    const { getByRole, getByText } = render(<SignInForm />)

    fireEvent.click(getByRole('button', { name: /sign up/i }))

    getByText(/by signing up, you agree to our/i)

    const terms = getByRole('link', { name: 'Terms of Service' }) as HTMLAnchorElement
    expect(terms.getAttribute('href')).toBe('/terms')
    expect(terms.getAttribute('target')).toBe('_blank')

    const privacy = getByRole('link', { name: 'Privacy Policy' }) as HTMLAnchorElement
    expect(privacy.getAttribute('href')).toBe('/privacy')
    expect(privacy.getAttribute('target')).toBe('_blank')
  })
})
