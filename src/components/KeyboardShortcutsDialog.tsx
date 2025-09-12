"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["?"], description: "Open this dialog" },
  { keys: ["g", "t"], description: "Go to tasks" },
  { keys: ["g", "n"], description: "Go to notes" },
];

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          role="dialog"
          aria-label="Keyboard shortcuts"
          className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-background p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-medium">
            Keyboard shortcuts
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Global application keyboard shortcuts
          </Dialog.Description>
          <ul className="mt-4 space-y-2">
            {shortcuts.map((s, i) => (
              <li key={i} className="flex items-center gap-4 text-sm">
                <span className="flex gap-1">
                  {s.keys.map((k, idx) => (
                    <kbd
                      key={idx}
                      className="rounded border bg-muted px-1 py-0.5 font-mono text-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
                <span>{s.description}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

