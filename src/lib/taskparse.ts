// Find markdown checkboxes like "- [ ] Do thing" or "* [x] Done"
export type TaskHit = {
  text: string
  checked: boolean
  line: number
  start: number
  end: number
  mark: string
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
        const text = m[2]
        const start = index + line.indexOf(whole)
        const end = start + whole.length
        out.push({ text, checked, line: lineNo, start, end, mark })
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
