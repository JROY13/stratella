import { JSDOM } from 'jsdom'

// Find markdown checkboxes like "- [ ] Do thing" or "* [x] Done"
export type TaskHit = {
  text: string
  checked: boolean
  line: number
  start?: number
  end?: number
  mark?: string
  due?: string
  tags: string[]
  status?: string
}

const TASK_RE = /^\s*(?:(?:[-*+]|\d+\.)\s+)?\[( |x|X)\]\s+(.*)$/

export function extractTasks(md: string): TaskHit[] {
  const out: TaskHit[] = []
  const lines = md.split('\n')
  let inFence = false
  let index = 0

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo]
    const trimmed = line.trim()
    const fenceMatch = /^(?:```|~~~)/.exec(trimmed)
    if (fenceMatch) {
      inFence = !inFence
    }
    if (!inFence) {
      const m = TASK_RE.exec(line)
      if (m) {
        const whole = m[0]
        const mark = m[1]
        const checked = mark.toLowerCase() === 'x'
        let text = m[2]
        const tags: string[] = []
        let due: string | undefined
        let status: string | undefined

        text = text.replace(/\b(\w+):([^\s]+)/g, (_, key: string, value: string) => {
          switch (key.toLowerCase()) {
            case 'due':
              due = value
              break
            case 'tag':
              tags.push(value)
              break
            case 'status':
              status = value
              break
          }
          return ''
        })

        text = text.replace(/#(\w+)/g, (_m, tag: string) => {
          tags.push(tag)
          return ''
        })

        text = text.trim()
        const start = index + line.indexOf(whole)
        const end = start + whole.length
        out.push({ text, checked, line: lineNo, start, end, mark, due, tags, status })
      }
    }
    index += line.length + 1
    TASK_RE.lastIndex = 0
  }
  return out
}

type PMNode = {
  type?: string
  attrs?: Record<string, unknown>
  content?: PMNode[]
  text?: string
}

export function extractTasksFromHtml(html: string | PMNode): TaskHit[] {
  const out: TaskHit[] = []

  if (typeof html === 'string') {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const items = doc.querySelectorAll<HTMLElement>('li[data-type="taskItem"]')
    items.forEach((el, index) => {
      const checked = el.getAttribute('data-checked') === 'true'
      const tags: string[] = []
      let due = el.getAttribute('data-due') || undefined
      let status = el.getAttribute('data-status') || undefined
      const attrTags = el.getAttribute('data-tags')
      if (attrTags) {
        attrTags.split(',').forEach(t => {
          const tag = t.trim()
          if (tag) tags.push(tag)
        })
      }
      const div = el.querySelector('div')
      let text = div?.textContent || ''
      text = text.replace(/\b(\w+):([^\s]+)/g, (_, key: string, value: string) => {
        switch (key.toLowerCase()) {
          case 'due':
            if (!due) due = value
            break
          case 'tag':
            tags.push(value)
            break
          case 'status':
            if (!status) status = value
            break
        }
        return ''
      })
      text = text.replace(/#(\w+)/g, (_m, tag: string) => {
        tags.push(tag)
        return ''
      })
      text = text.trim()
      out.push({ text, checked, line: index, tags, due, status })
    })
    return out
  }


  function walk(node: PMNode | PMNode[] | undefined): void {
    if (!node) return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (node.type === 'taskItem') {
      const index = out.length
      const checked = (node.attrs as { checked?: boolean } | undefined)?.checked ?? false
      const tags: string[] = []
      let due: string | undefined = (node.attrs as { due?: string } | undefined)?.due
      let status: string | undefined = (node.attrs as { status?: string } | undefined)?.status
      let text = ''
      const extract = (n: PMNode | PMNode[] | undefined): void => {
        if (!n) return
        if (Array.isArray(n)) {
          n.forEach(extract)
          return
        }
        if (n.text) text += n.text
        if (n.content) n.content.forEach(extract)
      }
      if (node.content) node.content.forEach(extract)
      text = text.replace(/\b(\w+):([^\s]+)/g, (_: string, key: string, value: string) => {
        switch (key.toLowerCase()) {
          case 'due':
            if (!due) due = value
            break
          case 'tag':
            tags.push(value)
            break
          case 'status':
            if (!status) status = value
            break
        }
        return ''
      })
      text = text.replace(/#(\w+)/g, (_m: string, tag: string) => {
        tags.push(tag)
        return ''
      })
      text = text.trim()
      out.push({ text, checked, line: index, tags, due, status })
    }
    if (node.content) node.content.forEach(walk)
  }

  walk(html as PMNode)
  return out
}

export function toggleTaskInMarkdown(
  md: string,
  hit: TaskHit & { start: number; end: number; mark: string },
) {
  const before = md.slice(0, hit.start)
  const target = md.slice(hit.start, hit.end)
  const after = md.slice(hit.end)
  const checkedMark = `[${hit.mark}]`
  const uncheckedMark = '[ ]'
  const newMark = hit.mark === ' ' ? 'x' : hit.mark
  const toggled = hit.checked
    ? target.replace(checkedMark, uncheckedMark)
    : target.replace(uncheckedMark, `[${newMark}]`)
  return before + toggled + after
}

export type TaskWithNote = TaskHit & { noteId: string }

export type TaskFilters = {
  completion?: string
  tag?: string
  due?: string
  sort?: string
}

export function filterTasks<T extends TaskWithNote>(tasks: T[], filters: TaskFilters): T[] {
  let out = [...tasks]
  if (filters.completion === 'open') out = out.filter(t => !t.checked)
  else if (filters.completion === 'done') out = out.filter(t => t.checked)
  if (filters.tag) {
    const tag = filters.tag
    out = out.filter(t => t.tags.includes(tag))
  }
  if (filters.due) out = out.filter(t => t.due === filters.due)

  if (filters.sort === 'due') {
    const toTime = (d?: string) => {
      if (!d) return Number.POSITIVE_INFINITY
      const t = new Date(d).getTime()
      return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
    }
    out.sort((a, b) => toTime(a.due) - toTime(b.due))
  } else if (filters.sort === 'text') {
    out.sort((a, b) => a.text.localeCompare(b.text))
  }
  return out
}
