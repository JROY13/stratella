export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { deleteNote } from "@/app/actions";
import { revalidatePath } from "next/cache";
import NoteClient from "./NoteClient";
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
  const html = body;

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
    revalidatePath("/notes");
    redirect("/notes");
  }

  return (
    <NoteClient
      noteId={noteId}
      html={html}
      created={created}
      modified={modified}
      openTasks={openTasks}
      onDelete={onDelete}
    />
  );
}
