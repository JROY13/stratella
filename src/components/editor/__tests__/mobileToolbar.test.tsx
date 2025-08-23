import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Editor } from '@tiptap/react'
import MobileToolbar from '../MobileToolbar'

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))

describe('MobileToolbar', () => {
  it('renders buttons', () => {
    const editor = {
      isActive: () => false,
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: () => true }),
          toggleItalic: () => ({ run: () => true }),
          toggleHeading: () => ({ run: () => true }),
          toggleBulletList: () => ({ run: () => true }),
          toggleOrderedList: () => ({ run: () => true }),
          toggleTaskList: () => ({ run: () => true }),
          toggleBlockquote: () => ({ run: () => true }),
        }),
      }),
    } as unknown as Editor

    const { container } = render(
      <MobileToolbar editor={editor} noteId="note" userId="user" />
    )
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('activates buttons on Enter', () => {
    const run = vi.fn()
    const editor = {
      isActive: () => false,
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run }),
          toggleItalic: () => ({ run: () => true }),
          toggleHeading: () => ({ run: () => true }),
          toggleBulletList: () => ({ run: () => true }),
          toggleOrderedList: () => ({ run: () => true }),
          toggleTaskList: () => ({ run: () => true }),
          toggleBlockquote: () => ({ run: () => true }),
        }),
      }),
    } as unknown as Editor

    const { container } = render(
      <MobileToolbar editor={editor} noteId="note" userId="user" />
    )
    const button = container.querySelector('button') as HTMLButtonElement
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(run).toHaveBeenCalled()
  })
})

