export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { deleteNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InlineEditor from "@/components/editor/InlineEditor";

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
        className="text-lg font-medium"
      />
      <InlineEditor noteId={noteId} html={body} />
      <form action={onDelete}>
        <Button type="submit" variant="outline">
          Delete
        </Button>
      </form>
    </div>
  );
}
