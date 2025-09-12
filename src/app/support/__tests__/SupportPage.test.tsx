import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render } from '@testing-library/react'
import SupportPage from '../page'

test('shows support email link', () => {
  const { getByRole } = render(<SupportPage />)
  const email = getByRole('link', { name: 'support@canvasinnovations.io' }) as HTMLAnchorElement
  expect(email.getAttribute('href')).toBe('mailto:support@canvasinnovations.io')
})
