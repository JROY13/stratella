// src/components/Markdown.tsx
"use client";

import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * A styled Markdown preview with GFM (tables, strikethrough, task lists).
 * Tailwind Typography (@tailwindcss/typography) provides the nice defaults.
 */
export default function Markdown({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const components: Components = {
    a: ({ node, ...props }) => (
      <a {...props} className="underline underline-offset-4 hover:text-primary" />
    ),
    h1: ({ node, ...props }) => (
      <h1 {...props} className="text-3xl font-semibold mt-0" />
    ),
    h2: ({ node, ...props }) => (
      <h2 {...props} className="text-2xl font-semibold mt-6" />
    ),
    h3: ({ node, ...props }) => (
      <h3 {...props} className="text-xl font-semibold mt-4" />
    ),
    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6" />,
    ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6" />,
    // Render checkboxes in task lists as disabled (preview-only)
    input: ({ node, ...props }) => {
      if (props.type === "checkbox") {
        return <input {...props} disabled readOnly />;
      }
      return <input {...props} readOnly />;
    },
    code: ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code
            {...props}
            className={`rounded bg-muted px-1 py-0.5 ${className ?? ""}`}
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="rounded bg-muted p-3 overflow-x-auto">
          <code {...props} className={className}>
            {children}
          </code>
        </pre>
      );
    },
  };

  return (
    <div className={`prose prose-neutral dark:prose-invert ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
