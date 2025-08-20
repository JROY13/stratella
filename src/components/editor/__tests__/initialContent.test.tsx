import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import InlineEditor from '../InlineEditor'

vi.mock('@/app/actions', () => ({
  saveNoteInline: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../FloatingToolbar', () => ({
  default: () => <div />,
}))

vi.mock('@/lib/supabase-client', () => ({
  supabaseClient: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } },
}))

vi.mock('tippy.js', () => {
  const tippy = () => ({ destroy: vi.fn() })
  ;(tippy as unknown as { default: typeof tippy }).default = tippy
  return tippy
})

vi.mock('@tiptap/extension-drag-handle', async () => {
  const actual = await vi.importActual<typeof import('@tiptap/core')>('@tiptap/core')
  return { default: actual.Extension.create({ name: 'dragHandle' }) }
})

describe('InlineEditor initialization', () => {
  const renderEditor = (markdown: string | null) => {
    expect(() =>
      render(<InlineEditor noteId="note" markdown={markdown as unknown as string} />),
    ).not.toThrow()
  }

  it('initializes with null markdown', () => {
    renderEditor(null)
  })

  it('initializes with empty markdown', () => {
    renderEditor('')
  })

  it('initializes with invalid markdown', () => {
    renderEditor('***invalid [markdown')
  })
})
