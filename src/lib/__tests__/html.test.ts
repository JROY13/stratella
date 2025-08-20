import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from '../html'

describe('htmlToMarkdown', () => {
  it('converts simple HTML to Markdown', () => {
    const html = '<p>Hello</p>'
    const md = htmlToMarkdown(html)
    expect(md.trim()).toBe('Hello')
  })

  it('handles HTML without a global Node', () => {
    const globalObj = globalThis as { Node?: unknown }
    const originalNode = globalObj.Node
    // @ts-expect-error removing global Node for test
    delete globalObj.Node
    try {
      expect(htmlToMarkdown('<p>Hello</p>')).toBe('Hello')
    } finally {
      globalObj.Node = originalNode
    }
  })
})
