import TurndownService from 'turndown'
import { JSDOM } from 'jsdom'
import { normalizeTasks } from './markdown'

const turndown = new TurndownService()

export function htmlToMarkdown(html: string) {
  const { window } = new JSDOM(html)
  return normalizeTasks(turndown.turndown(window.document.body))
}
