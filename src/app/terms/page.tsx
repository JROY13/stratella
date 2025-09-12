import { readFile } from 'fs/promises'
import path from 'path'

export const revalidate = false

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), 'public', 'legal', 'tos.html')
  const html = await readFile(filePath, 'utf8')
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
  return (
    <article
      className="prose mx-auto p-4"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
