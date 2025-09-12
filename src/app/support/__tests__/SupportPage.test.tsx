import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render } from '@testing-library/react'
import SupportPage from '../page'

test('shows support email link and FAQ', () => {
  const { getByRole, getByText } = render(<SupportPage />)
  const email = getByRole('link', { name: 'support@canvasinnovations.io' }) as HTMLAnchorElement
  expect(email.getAttribute('href')).toBe('mailto:support@canvasinnovations.io')
  getByText('How do I create a task in a note?')
  getByText('Where do all my tasks live?')
  getByText('What are Notes for?')
  getByText('Can I collaborate with teammates?')
})
