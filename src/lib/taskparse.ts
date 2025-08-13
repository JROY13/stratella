// Find markdown checkboxes like "- [ ] Do thing" or "* [x] Done"
export type TaskHit = {
  text: string
  checked: boolean
  line: number
  start: number
  end: number
}

const TASK_RE = /^\s*(?:[-*+]|\d+\.)\s+\[( |x|X)\]\s+(.*)$/gm

export function extractTasks(md: string): TaskHit[] {
  const out: TaskHit[] = []
  let m: RegExpExecArray | null
  while ((m = TASK_RE.exec(md))) {
    const whole = m[0]
    const checked = m[1].toLowerCase() === 'x'
    const text = m[2]
    const start = m.index
    const end = start + whole.length
    const line = md.slice(0, start).split('\n').length - 1
    out.push({ text, checked, line, start, end })
  }
  return out
}

export function toggleTaskInMarkdown(md: string, hit: TaskHit) {
  const before = md.slice(0, hit.start)
  const target = md.slice(hit.start, hit.end)
  const after  = md.slice(hit.end)
  const toggled = hit.checked
    ? target.replace('[x]', '[ ]').replace('[X]', '[ ]')
    : target.replace('[ ]', '[x]')
  return before + toggled + after
}
