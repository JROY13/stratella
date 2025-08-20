import { describe, expect, it } from 'vitest'

import { createInlineEditorExtensions } from '../InlineEditor'

describe('Drag handle extension', () => {
  it('is included in inline editor extensions', () => {
    const { extensions } = createInlineEditorExtensions()
    const names = extensions.map(ext => ext.name)
    expect(names).toContain('dragHandle')
  })
})
