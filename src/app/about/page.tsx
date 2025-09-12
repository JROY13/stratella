import type { Metadata } from 'next'
import { Heart, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Stratella',
  description: 'Learn about Stratella\'s mission, team, and values.'
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About Stratella</h1>
        <p className="text-lg text-muted-foreground">
          Stratella helps teams stay focused and organized so they can do their best work.
        </p>
      </section>
      <section className="grid gap-12 md:grid-cols-2">
        <div className="flex flex-col items-center text-center space-y-3">
          <Users className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Our Team</h2>
          <p className="text-muted-foreground">
            We are a small group of builders dedicated to crafting tools that empower people.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Heart className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold">Our Values</h2>
          <p className="text-muted-foreground">
            Openness, empathy, and a passion for helping others guide everything we do.
          </p>
        </div>
      </section>
    </main>
  )
}

