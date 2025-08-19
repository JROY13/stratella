// Find markdown checkboxes like "- [ ] Do thing" or "* [x] Done"
export type TaskHit = {
  text: string
  checked: boolean
  line: number
  start: number
  end: number
  mark: string
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

export function toggleTaskInMarkdown(md: string, hit: TaskHit) {
  const before = md.slice(0, hit.start)
  const target = md.slice(hit.start, hit.end)
  const after  = md.slice(hit.end)
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
  status?: string
  tag?: string
  due?: string
  sort?: string
}

export function filterTasks<T extends TaskWithNote>(tasks: T[], filters: TaskFilters): T[] {
  let out = [...tasks]
  if (filters.status === 'open') out = out.filter(t => !t.checked)
  else if (filters.status === 'done') out = out.filter(t => t.checked)
  if (filters.tag) {
    const tag = filters.tag
    out = out.filter(t => t.tags.includes(tag))
  }
  if (filters.due) out = out.filter(t => t.due === filters.due)

  if (filters.sort === 'due') {
    out.sort((a, b) => (a.due ?? '').localeCompare(b.due ?? ''))
  } else if (filters.sort === 'text') {
    out.sort((a, b) => a.text.localeCompare(b.text))
  }
  return out
}
