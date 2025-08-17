// Find markdown checkboxes like "- [ ] Do thing" or "* [x] Done"
export type TaskHit = {
  text: string
  checked: boolean
  marker: string
  line: number
  start: number
  end: number
}

const TASK_RE = /^\s*(?:[-*+]|\d+\.)\s+\[( |x|X)\]\s+(.*)$/gm
const FENCE_RE = /```[\s\S]*?```/g

function inFence(idx: number, fences: Array<[number, number]>) {
  return fences.some(([s, e]) => idx >= s && idx < e)
}

export function extractTasks(md: string): TaskHit[] {
  const out: TaskHit[] = []
  const fences: Array<[number, number]> = []
  let fm: RegExpExecArray | null
  while ((fm = FENCE_RE.exec(md))) {
    fences.push([fm.index, fm.index + fm[0].length])
  }

  let m: RegExpExecArray | null
  while ((m = TASK_RE.exec(md))) {
    const start = m.index
    if (inFence(start, fences)) continue
    const whole = m[0]
    const marker = m[1]
    const checked = marker.toLowerCase() === 'x'
    const text = m[2]
    const end = start + whole.length
    const line = md.slice(0, start).split('\n').length - 1
    out.push({ text, checked, marker, line, start, end })
  }
  return out
}

export function toggleTaskInMarkdown(md: string, hit: TaskHit) {
  const before = md.slice(0, hit.start)
  const target = md.slice(hit.start, hit.end)
  const after  = md.slice(hit.end)
  const toggled = hit.checked
    ? target.replace(`[${hit.marker}]`, '[ ]')
    : target.replace('[ ]', `[${hit.marker === 'X' ? 'X' : 'x'}]`)
  return before + toggled + after
}
