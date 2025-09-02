import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/notes',
  useSearchParams: () => new URLSearchParams('foo=bar&view=card'),
}))

import ViewSelector from '../ViewSelector'
import { LayoutPanelTop, List } from 'lucide-react'

describe('ViewSelector', () => {
  beforeEach(() => replace.mockClear())

  it('updates the view query parameter', () => {
    const { getByText } = render(
      <ViewSelector
        defaultValue="card"
        options={[
          { value: 'card', label: 'Card', icon: LayoutPanelTop },
          { value: 'list', label: 'List', icon: List },
        ]}
      />
    )

    fireEvent.click(getByText('List'))
    expect(replace).toHaveBeenCalledWith('/notes?foo=bar&view=list')
  })
})

