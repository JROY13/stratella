'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { normalizeTasks } from '@/lib/markdown'
import { toggleTaskFromNote } from '@/app/actions'

type CodeProps =
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    inline?: boolean
  }

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

export default function Markdown({ children, noteId }: { children: string; noteId: string }) {
  // Normalize task markers outside fenced code blocks
  const normalized = normalizeTasks(children)
  const [, startTransition] = React.useTransition()

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ul: ({ ...props }) => <ul {...props} className="list-disc pl-6 my-1" />,
          ol: ({ ...props }) => <ol {...props} className="list-decimal pl-6 my-1" />,

          // Remove bullets for task items; align checkbox + text and expose line numbers
          li: ({ children, node, ...props }) => {
            const hasCheckbox = React.Children.toArray(children).some(
              (child) =>
                React.isValidElement(child) &&
                child.type === 'input' &&
                (child.props as { type?: string }).type === 'checkbox'
            )
              const line = (node as { position?: { start?: { line?: number } } })
                ?.position?.start?.line
              const className = `${(props as { className?: string }).className ?? ''} ${
                hasCheckbox ? 'list-none' : ''
              } flex items-center gap-2 my-0.5 target:bg-accent/30`;

            return (
              <li
                {...props}
                id={line ? `L${line}` : undefined}
                data-line={line}
                className={className}
              >
                {children}
              </li>
            )
          },

          // Checkboxes that toggle tasks via server action
          input: (props: InputProps) => {
            if (props.type === 'checkbox') {
              const { className, disabled: _disabled, ...rest } = props
              void _disabled
              return (
                <input
                  {...rest}
                  disabled={false}
                  className={`h-4 w-4 align-middle rounded border border-muted-foreground/40 ${className ?? ''}`}
                  onClick={e => {
                    e.preventDefault()
                    const lineAttr = e.currentTarget.closest('li')?.getAttribute('data-line')
                    if (!lineAttr) return
                    const line = parseInt(lineAttr, 10) - 1
                    startTransition(() => toggleTaskFromNote(noteId, line))
                  }}
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
