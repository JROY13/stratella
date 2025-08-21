export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { deleteNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InlineEditor from "@/components/editor/InlineEditor";
import { extractTasksFromHtml } from "@/lib/taskparse";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next 15: await params first
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (!note) redirect("/notes");

  const body = note.body ?? "";
  if (note.body == null) {
    console.warn(`Note ${id} has no body`);
  }

  const openTasks = extractTasksFromHtml(body).filter(t => !t.checked).length;
  const created = note.created_at
    ? new Date(note.created_at).toLocaleDateString()
    : "";
  const modified = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString()
    : "";

  // Capture the id into a serializable primitive for server actions
  const noteId = id;

  async function onDelete() {
    "use server";
    await deleteNote(noteId);
    redirect("/notes");
  }

  return (
    <div className="space-y-4">
      <Input
        name="title"
        defaultValue={note.title}
        variant="title"
        className="text-3xl md:text-3xl font-bold h-auto py-0 border-0 px-0 focus-visible:ring-0"
      />
      <div className="text-sm text-muted-foreground">
        Created {created} • Modified {modified} • {openTasks} open tasks
      </div>
      <InlineEditor noteId={noteId} html={body} />
      <form action={onDelete}>
        <Button type="submit" variant="outline">
          Delete
        </Button>
      </form>
    </div>
  );
}
