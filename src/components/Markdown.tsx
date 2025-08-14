'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = { source: string }

export default function Markdown({ source }: Props) {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Optional: keep checkboxes non-interactive and clean
        components={{
          input({ node, ...props }) {
            if ((props as any).type === 'checkbox') {
              // neutral, unfilled checkbox look
              return (
                <input
                  {...props}
                  disabled
                  className="mr-2 h-4 w-4 align-text-bottom appearance-none rounded border border-neutral-400
                             checked:bg-neutral-900 checked:border-neutral-900
                             dark:border-neutral-600 dark:checked:bg-neutral-100 dark:checked:border-neutral-100"
                />
              )
            }
            return <input {...props} />
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
