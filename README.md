This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Copy the example environment file and update it with your Supabase project details and any analytics keys:

```bash
cp .env.example .env.local
```

Replace the placeholder values with the real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the [Supabase dashboard](https://supabase.com/dashboard). To enable analytics, also set `NEXT_PUBLIC_POSTHOG_KEY` and, if using a self-hosted instance, `NEXT_PUBLIC_POSTHOG_HOST`.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Note flow

Click **New** to create a blank note. The first line becomes the note title, and the editor saves the entire document in a single state rather than maintaining separate title and body fields.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Operations

### Unified document migration

Run the migration to ensure existing notes store the title and body in a single HTML document:

```bash
node --import tsx scripts/migrate-notes.ts
```

Set `NEXT_PUBLIC_SUPABASE_URL` and either `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` before running the script.

### Sample note cleanup

After running the migration, remove any leftover sample notes that still match the onboarding content:

```sql
DELETE FROM notes
WHERE body = '<sample note body>';
```

Replace `<sample note body>` with the exact string defined in `src/app/api/init-user/route.ts`.

## Developer notes

- TipTap uses an `<h1>` block as the note title and removes the “Untitled Note” placeholder once typing begins.
- Empty notes are automatically deleted when the editor blurs or the page unloads without any user input.

## Legal

Static Terms of Service and Privacy Policy pages are available at `/terms` and `/privacy`.
These routes render the HTML in `public/legal/tos.html` and `public/legal/privacy.html`.
Links to both pages appear in the footer and on the sign-in form and open in a new tab.

To update the legal copy, edit the respective HTML files in `public/legal/`.
Only the contents inside each file's `<body>` tag are injected into the page.
