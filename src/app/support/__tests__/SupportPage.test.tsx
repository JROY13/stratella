import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render } from '@testing-library/react'
import SupportPage from '../page'

test('shows support email link and FAQ', () => {
  const { getByRole, getByText } = render(<SupportPage />)
  const email = getByRole('link', { name: 'support@canvasinnovations.io' }) as HTMLAnchorElement
  expect(email.getAttribute('href')).toBe('mailto:support@canvasinnovations.io')
  getByText('How do Tasks work?')
  getByText('What can I do with Notes?')
  getByText('How much does Stratella cost?')
})
