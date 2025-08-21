export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { deleteNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import InlineEditor from "@/components/editor/InlineEditor";
import NoteTitleInput from "@/components/NoteTitleInput";
import { extractTasksFromHtml } from "@/lib/taskparse";
import React from "react";

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
    <NoteClient
      noteId={noteId}
      initialTitle={note.title}
      body={body}
      created={created}
      modified={modified}
      onDelete={onDelete}
    />
  );
}

function NoteClient({
  noteId,
  initialTitle,
  body,
  created,
  modified,
  onDelete,
}: {
  noteId: string;
  initialTitle: string | null;
  body: string;
  created: string;
  modified: string;
  onDelete: () => Promise<void>;
}) {
  "use client";
  const [openTasks, setOpenTasks] = React.useState(() =>
    extractTasksFromHtml(body).filter(t => !t.checked).length,
  );
  const handleChange = React.useCallback((html: string) => {
    setOpenTasks(extractTasksFromHtml(html).filter(t => !t.checked).length);
  }, []);

  return (
    <div className="space-y-4">
      <NoteTitleInput noteId={noteId} initialTitle={initialTitle} />
      <div className="text-sm text-muted-foreground">
        Created {created} • Modified {modified} • {openTasks} open tasks
      </div>
      <InlineEditor noteId={noteId} html={body} onChange={handleChange} />
      <form action={onDelete}>
        <Button type="submit" variant="outline">
          Delete
        </Button>
      </form>
    </div>
  );
}
