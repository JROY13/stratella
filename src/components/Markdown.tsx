// src/components/Markdown.tsx
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

export function MarkdownPreview({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        // GFM gives you task lists, tables, strikethrough, etc.
        remarkPlugins={[remarkGfm]}
        components={{
          // Render task-list checkboxes as read-only so they don’t flip on click
          input: (props: InputProps) => {
            if (props.type === 'checkbox') {
              // visually nicer checkbox for previews
              const { className, ...rest } = props
              return (
                <input
                  {...rest}
                  readOnly
                  className={
                    (className ?? '') +
                    ' h-4 w-4 align-middle rounded border border-muted-foreground/40'
                  }
                />
              )
            }
            return <input {...props} />
          },

          // Syntax-friendly inline vs block code (typed so `inline` is allowed)
          code: ({ inline, className, children, ...props }: CodeProps) => {
            if (inline) {
              return (
                <code
                  {...props}
                  className={(className ?? '') + ' rounded bg-muted px-1 py-0.5'}
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
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}

// Optional default export if you’re importing as default elsewhere
export default MarkdownPreview
