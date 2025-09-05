"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { JSDOM } from "jsdom";
import { countOpenTasks } from "@/lib/taskparse";
import { extractTitleFromHtml } from "@/lib/note";

export async function requireUser() {
  const supabase = await supabaseServer(); // <-- await here
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function createNote(title?: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("notes")
    .insert({ title: title ?? "Untitled", user_id: user.id, body: "" })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/notes");
  return data?.id as string;
}

export async function saveNoteInline(
  id: string,
  html: string,
  opts?: { revalidate?: boolean },
): Promise<SaveNoteInlineResult> {
  const { supabase, user } = await requireUser();
  const dom = new JSDOM(html);
  const body = dom.window.document.body.innerHTML;
  const title = extractTitleFromHtml(body);
  const openTasks = countOpenTasks(body);
  let { data, error } = await supabase
    .from("notes")
    .update({ title, body, open_tasks: openTasks })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("updated_at")
    .single();
  if (error?.code === "42703") {
    // title column does not exist; retry without it
    ({ data, error } = await supabase
      .from("notes")
      .update({ body, open_tasks: openTasks })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("updated_at")
      .single());
  }
  if (error) {
    console.error(error);
    throw error;
  }
  const { revalidate = true } = opts ?? {};
  if (revalidate !== false) {
    revalidatePath(`/notes/${id}`);
    revalidatePath("/notes");
    revalidatePath("/tasks");
  }
  return { openTasks, updatedAt: data?.updated_at ?? null };
}

export type SaveNoteInlineResult = {
  openTasks: number;
  updatedAt: string | null;
};

export async function deleteNote(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/notes");
}

function updateTaskHtml(
  html: string,
  taskIndex: number,
  updater: (el: HTMLElement) => void,
): string {
  const { window } = new JSDOM("");
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tasks = doc.querySelectorAll<HTMLElement>('li[data-type="taskItem"]');
  const target = tasks[taskIndex];
  if (!target) return html;
  updater(target);
  return doc.body.innerHTML;
}

async function toggleTask(noteId: string, taskLine: number) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("notes")
    .select("body")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (!data) throw new Error("Note not found");

  const nextBody = updateTaskHtml(data.body, taskLine, (el) => {
    const checked = el.getAttribute("data-checked") === "true";
    el.setAttribute("data-checked", checked ? "false" : "true");
  });

  await supabase
    .from("notes")
    .update({ body: nextBody })
    .eq("id", noteId)
    .eq("user_id", user.id);
}

export async function toggleTaskFromNote(noteId: string, taskLine: number) {
  await toggleTask(noteId, taskLine);
  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/tasks");
}

export async function setTaskDueFromNote(
  noteId: string,
  taskLine: number,
  formData: FormData,
) {
  const due = (formData.get("due") as string) || "";
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("notes")
    .select("body")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();
  if (!data) throw new Error("Note not found");

  const nextBody = updateTaskHtml(data.body, taskLine, (el) => {
    if (due) {
      el.setAttribute("data-due", due);
    } else {
      el.removeAttribute("data-due");
    }
  });

  await supabase
    .from("notes")
    .update({ body: nextBody })
    .eq("id", noteId)
    .eq("user_id", user.id);
  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/tasks");
}
