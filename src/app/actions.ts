"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { JSDOM } from "jsdom";

export async function requireUser() {
  const supabase = await supabaseServer(); // <-- await here
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function createNote(title: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("notes").insert({ title, user_id: user.id, body: "" });
  revalidatePath("/notes");
}

export async function saveNote(id: string, title: string, html: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notes")
    .update({ title, body: html })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath(`/notes/${id}`);
  revalidatePath("/notes");
}

export async function saveNoteInline(
  id: string,
  html: string,
  opts?: { revalidate?: boolean },
) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notes")
    .update({ body: html })
    .eq("id", id)
    .eq("user_id", user.id);
  const { revalidate = true } = opts ?? {};
  if (revalidate !== false) {
    revalidatePath(`/notes/${id}`);
    revalidatePath("/notes");
    revalidatePath("/tasks");
  }
}

export async function updateNoteTitle(id: string, title: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notes")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath(`/notes/${id}`);
  revalidatePath("/notes");
}

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
