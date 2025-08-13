'use client'

export default function Time({ value }: { value: string | Date }) {
  const d = new Date(value)
  return <time dateTime={d.toISOString()}>{d.toLocaleString()}</time>
}
