import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from '../html'

describe('htmlToMarkdown', () => {
  it('converts simple HTML to Markdown', () => {
    const html = '<p>Hello</p>'
    const md = htmlToMarkdown(html)
    expect(md.trim()).toBe('Hello')
  })

  it('converts without global Node', () => {
    const html = '<p>Hello</p>'
    const g = globalThis as { Node?: unknown }
    const originalNode = g.Node
    // @ts-expect-error - ensure Node is undefined for test
    delete g.Node
    try {
      const md = htmlToMarkdown(html)
      expect(md.trim()).toBe('Hello')
    } finally {
      if (originalNode !== undefined) {
        g.Node = originalNode
      } else {
        // @ts-expect-error - restore to undefined
        delete g.Node
      }
    }
  })
})
