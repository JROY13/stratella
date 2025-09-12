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
          <div>
            <dt>How do Tasks work?</dt>
            <dd>
              Tasks move through a simple workflow—create a task, track its
              progress, and mark it complete when finished.
            </dd>
          </div>
          <div>
            <dt>What can I do with Notes?</dt>
            <dd>
              Use notes to brainstorm ideas and link them to related tasks for
              easy reference.
            </dd>
          </div>
          <div>
            <dt>How much does Stratella cost?</dt>
            <dd>
              Stratella offers a free tier with additional features available on
              paid plans.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
