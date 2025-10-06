import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { QuickCaptureProvider } from '@/components/quick-capture/QuickCaptureProvider'
import { supabaseServer } from '@/lib/supabase-server'

export const metadata: Metadata = {
  metadataBase: new URL('https://stratella.vercel.app'),
  title: 'Stratella',
  description: 'All your tasks from every note, in one place. Markdown in, clarity out.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Stratella',
    description: 'All your tasks. From every note. In one place.',
    images: ['/og.png'], // add one later to public/og.png
  },
  twitter: { card: 'summary_large_image' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[radial-gradient(60%_40%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)] bg-background text-foreground">
        <QuickCaptureProvider>
          <Header />
          <main className="mx-auto max-w-5xl p-4">{children}</main>
          {!session && <Footer />}
        </QuickCaptureProvider>
      </body>
    </html>
  )
}

