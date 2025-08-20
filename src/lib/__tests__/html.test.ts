import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from '../html'

describe('htmlToMarkdown', () => {
  it('converts simple HTML to Markdown', () => {
    const html = '<p>Hello</p>'
    const md = htmlToMarkdown(html)
    expect(md.trim()).toBe('Hello')
  })
})
