import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, CheckCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Why Stratella | Remote Product Team Collaboration',
  description:
    'Discover how Stratella keeps distributed product teams collaborating securely and shipping faster.',
}

export default function WhyStratellaPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 space-y-24">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Why Stratella</h1>
        <p className="text-lg text-muted-foreground">
          From brainstorm to backlog, Stratella keeps your remote product team aligned.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-12 md:grid-cols-3">
        <div className="flex flex-col items-center text-center space-y-3">
          <FileText className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Collaborative Specs</h2>
          <p className="text-muted-foreground">
            Keep ideas, decisions, and docs in sync so everyone builds from the same page.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <CheckCircle className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Enterprise Security</h2>
          <p className="text-muted-foreground">
            Granular permissions and audit trails safeguard your roadmap and customer data.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Globe className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Built for Speed</h2>
          <p className="text-muted-foreground">
            Real-time updates keep globally distributed teams moving quickly from idea to release.
          </p>
        </div>
      </section>
    </main>
  )
}
