import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Stratella',
  description: 'All your tasks from every note, in one place. Markdown in, clarity out.',
  openGraph: {
    title: 'Stratella',
    description: 'All your tasks. From every note. In one place.',
    images: ['/og.png'], // add one later to public/og.png
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[radial-gradient(60%_40%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)] bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  )
}

