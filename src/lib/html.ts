import TurndownService from 'turndown'
import { normalizeTasks } from './markdown'

const turndown = new TurndownService()

export function htmlToMarkdown(html: string) {
  return normalizeTasks(turndown.turndown(html))
}
