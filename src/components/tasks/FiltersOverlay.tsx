"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import DateFilterTrigger from "./DateFilterTrigger";
import type { TaskFilters } from "@/lib/taskparse";
import { track } from "@/lib/analytics";

interface NoteOption {
  id: string;
  title: string;
}

interface FilterState extends TaskFilters {
  note?: string;
}

interface FiltersOverlayProps {
  open: boolean;
  onClose: () => void;
  notes: NoteOption[];
  tags: string[];
  initialFilters?: FilterState;
  onApply: (filters: FilterState) => void;
}

export default function FiltersOverlay({
  open,
  onClose,
  notes,
  tags,
  initialFilters,
  onApply,
}: FiltersOverlayProps) {
  const [filters, setFilters] = useState<FilterState>(
    () => initialFilters ?? {},
  );

  useEffect(() => {
    if (open) {
      setFilters(initialFilters ?? {});
    }
  }, [open, initialFilters]);

  function update(patch: Partial<FilterState>) {
    setFilters((f) => ({ ...f, ...patch }));
    track('tasks.filters.changed', { note_id: 'tasks' });
  }

  function handleApply() {
    onApply(filters);
    track('tasks.filters.applied', { note_id: 'tasks' });
    onClose();
  }

  function handleClearAll() {
    const empty: FilterState = {};
    setFilters(empty);
    onApply(empty);
    track('tasks.filters.cleared', { note_id: 'tasks' });
    onClose();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          role="dialog"
          aria-label="Task filters"
          className="fixed inset-0 z-50 flex flex-col bg-background p-4"
        >
          <Dialog.Title className="sr-only">Task filters</Dialog.Title>
          <Dialog.Description className="sr-only">
            Set filters for the task list
          </Dialog.Description>
          <div className="flex flex-col gap-4 overflow-auto">
            <select
              value={filters.completion ?? ""}
              onChange={(e) =>
                update({ completion: e.target.value || undefined })
              }
              className="h-9 rounded-md border border-input bg-transparent px-2"
              aria-label="Completion filter"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filters.note ?? ""}
              onChange={(e) => update({ note: e.target.value || undefined })}
              className="h-9 rounded-md border border-input bg-transparent px-2"
              aria-label="Note filter"
            >
              <option value="">All Notes</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title || "Untitled"}
                </option>
              ))}
            </select>
            <select
              value={filters.tag ?? ""}
              onChange={(e) => update({ tag: e.target.value || undefined })}
              className="h-9 rounded-md border border-input bg-transparent px-2"
              aria-label="Tag filter"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <DateFilterTrigger
              value={filters.due}
              onChange={(d) => update({ due: d })}
              onClear={() => {
                update({ due: undefined });
                track('tasks.filters.cleared', { note_id: 'tasks' });
              }}
            />
            <select
              value={filters.sort ?? ""}
              onChange={(e) => update({ sort: e.target.value || undefined })}
              className="h-9 rounded-md border border-input bg-transparent px-2"
              aria-label="Sort tasks"
            >
              <option value="">Sort</option>
              <option value="due">Due</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div className="mt-auto flex justify-end gap-2 pt-4">
            <Button type="button" onClick={handleApply}>
              Apply
            </Button>
            <Button type="button" variant="ghost" onClick={handleClearAll}>
              Clear all
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
