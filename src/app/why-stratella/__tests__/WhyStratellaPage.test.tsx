import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render, screen } from '@testing-library/react'
import WhyStratellaPage from '../page'

describe('WhyStratellaPage', () => {
  it('renders updated feature headings', () => {
    render(<WhyStratellaPage />)
    expect(screen.getByText('Fast Markdown Notes')).toBeDefined()
    expect(screen.getByText('Tasks Automatically Collected')).toBeDefined()
    expect(screen.getByText('Stay Organized')).toBeDefined()
  })
})
