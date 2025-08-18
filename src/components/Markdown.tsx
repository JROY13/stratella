'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type CodeProps =
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    inline?: boolean
  }

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

/**
 * Convert leading "[ ] Task" / "[x] Task" at line-start into GFM
 * "- [ ] Task" / "- [x] Task" outside fenced code blocks.
 */
function normalizeTasks(md: string) {
  const lines = md.split('\n')
  let inFence = false
  return lines
    .map((line) => {
      if (line.trim().startsWith('```')) {
        inFence = !inFence
        return line
      }
      if (inFence) return line
      // Convert "[ ] foo" to "- [ ] foo" and "[x] foo" to "- [x] foo" at line start (allow leading spaces)
      const m = line.match(/^(\s*)\[( |x|X)\]\s+(.*)$/)
      if (m) {
        const [, indent, mark, rest] = m
        const box = mark.toLowerCase() === 'x' ? '[x]' : '[ ]'
        return `${indent}- ${box} ${rest}`
      }
      return line
    })
    .join('\n')
}

export default function Markdown({ children }: { children: string }) {
  // Normalize task markers outside fenced code blocks
  const normalized = normalizeTasks(children)

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ul: ({ ...props }) => <ul {...props} className="list-disc pl-6 my-1" />,
          ol: ({ ...props }) => <ol {...props} className="list-decimal pl-6 my-1" />,

          // Remove bullets for task items; align checkbox + text
          li: ({ children, ...props }) => {
            const hasCheckbox = React.Children.toArray(children).some(
              (child) =>
                React.isValidElement(child) &&
                child.type === 'input' &&
                (child.props as { type?: string }).type === 'checkbox'
            )
            return (
              <li
                {...props}
                className={`${(props as { className?: string }).className ?? ''} ${
                  hasCheckbox ? 'list-none' : ''
                } flex items-center gap-2 my-0.5`}
              >
                {children}
              </li>
            )
          },

          // Read-only checkboxes in preview
          input: (props: InputProps) => {
            if (props.type === 'checkbox') {
              const { className, ...rest } = props
              return (
                <input
                  {...rest}
                  readOnly
                  className={`h-4 w-4 align-middle rounded border border-muted-foreground/40 ${className ?? ''}`}
                />
              )
            }
            return <input {...props} readOnly />
          },

          // Inline vs block code (typed so `inline` is OK)
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
