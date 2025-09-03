import { JSDOM } from 'jsdom'

export function extractTitleFromHtml(html: string | null | undefined): string {
  if (!html) return ''
  const dom = new JSDOM(html)
  const title = dom.window.document.querySelector('h1')?.textContent?.trim() ?? ''
  return title
}
