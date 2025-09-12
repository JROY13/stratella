import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ListChecks, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Why Stratella | Notes that capture tasks automatically',
  description:
    'Capture notes, turn checkboxes into tasks, and stay organized without hunting through dozens of docs.',
}

export default function WhyStratellaPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 space-y-24">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Why Stratella</h1>
        <p className="text-lg text-muted-foreground">
          Capture notes, turn checkboxes into tasks, and see every action item in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/login">Start capturing tasks</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-12 md:grid-cols-3">
        <div className="flex flex-col items-center text-center space-y-3">
          <FileText className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Fast Markdown Notes</h2>
          <p className="text-muted-foreground">
            Create notes instantly with keyboard-friendly editing.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <ListChecks className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Tasks Automatically Collected</h2>
          <p className="text-muted-foreground">
            Checkboxes in any note show up in your Task List.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Filter className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Stay Organized</h2>
          <p className="text-muted-foreground">
            Filter and sort tasks without hunting through dozens of notes.
          </p>
        </div>
      </section>
    </main>
  )
}
