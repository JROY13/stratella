'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { normalizeTasks } from '@/lib/markdown'
import { Checkbox } from '@/components/ui/checkbox'

type CodeProps =
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    inline?: boolean
  }

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

export default function MarkdownPreview({ children }: { children: string }) {
  const normalized = normalizeTasks(children)

  function renderTags(text: string) {
    const parts: React.ReactNode[] = []
    const tagRe = /(tag:(\w+))|(#(\w+))/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = tagRe.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index))
      const tag = m[2] ?? m[4]
      parts.push(
        <span key={parts.length} className="text-xs text-muted-foreground">
          #{tag}
        </span>
      )
      last = tagRe.lastIndex
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ul: ({ ...props }) => <ul {...props} className="list-disc pl-6 my-1" />,
          ol: ({ ...props }) => <ol {...props} className="list-decimal pl-6 my-1" />,

          li: ({ children, ...props }) => {
            const hasCheckbox = React.Children.toArray(children).some(
              (child) =>
                React.isValidElement(child) &&
                ((child.type === 'input' &&
                  (child.props as { type?: string }).type === 'checkbox') ||
                  child.type === Checkbox)
            )
            const className = `${(props as { className?: string }).className ?? ''} ${
              hasCheckbox ? 'list-none' : ''
            } flex items-center gap-2 my-0.5 target:bg-accent/30`

            const processed = React.Children.map(children, (child) => {
              if (typeof child === 'string') return renderTags(child)
              if (
                React.isValidElement<{ children?: React.ReactNode }>(child) &&
                typeof child.props.children === 'string'
              ) {
                return React.cloneElement(child, {}, renderTags(child.props.children))
              }
              return child
            })

            return (
              <li {...props} className={className}>
                {processed}
              </li>
            )
          },

          input: ({ className, type, checked, ...props }: InputProps) => {
            if (type === 'checkbox') {
              return (
                <Checkbox
                  checked={checked}
                  className={`align-middle pointer-events-none ${className ?? ''}`}
                  tabIndex={-1}
                />
              )
            }
            return <input {...props} readOnly className={className} />
          },

          code: ({ inline, className, children, ...props }: CodeProps) => {
            if (inline) {
              return (
                <code
                  {...props}
                  className={`rounded bg-muted px-1 py-0.5 ${className ?? ''}`}
                >
                  {children}
                </code>
              )
            }
            return (
              <pre className="overflow-x-auto rounded-lg bg-muted p-3">
                <code {...props} className={className}>
                  {children}
                </code>
              </pre>
            )
          },

          h1: ({ ...props }) => <h1 {...props} className="mt-5 mb-3 text-3xl font-semibold" />,
          h2: ({ ...props }) => <h2 {...props} className="mt-4 mb-2 text-2xl font-semibold" />,
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  )
}
