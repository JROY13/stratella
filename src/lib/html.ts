import TurndownService from 'turndown'
import { JSDOM } from 'jsdom'
import { normalizeTasks } from './markdown'

const turndown = new TurndownService()

export function htmlToMarkdown(html: string) {
  const dom = new JSDOM(html)
  return normalizeTasks(turndown.turndown(dom.window.document.body))
}
