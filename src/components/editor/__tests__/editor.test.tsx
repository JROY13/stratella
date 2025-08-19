import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Editor } from '@tiptap/react'
import FloatingToolbar from '../FloatingToolbar'

vi.mock('@tiptap/react', async () => {
  const actual = await vi.importActual<typeof import('@tiptap/react')>(
    '@tiptap/react'
  )
  return {
    ...actual,
    BubbleMenu: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }
})

Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: () => ({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  }),
  configurable: true,
})

Object.defineProperty(Text.prototype, 'getClientRects', {
  value: () => [] as unknown as DOMRectList,
  configurable: true,
})

describe('FloatingToolbar', () => {
  it('renders buttons', () => {
    const editor = {
      isActive: () => false,
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({
            run: () => true,
          }),
          toggleItalic: () => ({
            run: () => true,
          }),
          toggleHeading: () => ({
            run: () => true,
          }),
          toggleBulletList: () => ({
            run: () => true,
          }),
          toggleOrderedList: () => ({
            run: () => true,
          }),
          toggleTaskList: () => ({
            run: () => true,
          }),
          toggleBlockquote: () => ({
            run: () => true,
          }),
        }),
      }),
    } as unknown as Editor

    const { container } = render(<FloatingToolbar editor={editor} />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

