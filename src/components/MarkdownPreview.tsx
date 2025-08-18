'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { normalizeTasks } from '@/lib/markdown'

export default function MarkdownPreview({ children }: { children: string }) {
  const normalized = normalizeTasks(children)
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalized}</ReactMarkdown>
}
