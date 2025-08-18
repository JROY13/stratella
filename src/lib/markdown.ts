/**
 * Convert leading "[ ] Task" / "[x] Task" at line-start into GFM
 * "- [ ] Task" / "- [x] Task" outside fenced code blocks.
 */
export function normalizeTasks(markdown: string) {
  const lines = markdown.split(/\r?\n/)
  let inFence = false
  return lines
    .map((line) => {
      const trimmed = line.trimStart()
      if (/^(```|~~~)/.test(trimmed)) {
        inFence = !inFence
        return line
      }
      if (inFence) return line
      const m = trimmed.match(/^\[( |x|X)\]\s+(.*)$/)
      if (m) {
        const indent = line.slice(0, line.length - trimmed.length)
        const box = m[1].toLowerCase() === 'x' ? '[x]' : '[ ]'
        return `${indent}- ${box} ${m[2]}`
      }
      return line
    })
    .join('\n')
}
