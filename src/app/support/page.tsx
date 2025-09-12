export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <main className="prose mx-auto p-4">
      <h1>Support</h1>
      <p>
        Need help? Contact us at{' '}
        <a href="mailto:support@canvasinnovations.io">support@canvasinnovations.io</a>.
      </p>
      <p>
        You can also browse our frequently asked questions to find common
        answers.
      </p>
      <section className="mt-6">
        <h2>FAQ</h2>
        <dl className="space-y-4">
          <div className="space-y-2">
            <dt>How do I create a task in a note?</dt>
            <dd>
              Type <code>[]</code> or right-click selected text to turn it into a
              task. Tasks automatically appear in your Task List.
            </dd>
          </div>
          <div className="space-y-2">
            <dt>Where do all my tasks live?</dt>
            <dd>
              All tasks collect in your centralized Task List, where you can
              filter and sort to stay organized.
            </dd>
          </div>
          <div className="space-y-2">
            <dt>What are Notes for?</dt>
            <dd>
              Notes are fast, keyboard-friendly Markdown documents perfect for
              brainstorming.
            </dd>
          </div>
          <div className="space-y-2">
            <dt>Can I collaborate with teammates?</dt>
            <dd>
              Stratella is currently single-user only, but collaboration
              features are on our roadmap.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
