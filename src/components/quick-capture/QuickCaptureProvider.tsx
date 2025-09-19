"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import InlineEditor from "@/components/editor/InlineEditor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { SaveNoteInlineResult } from "@/app/actions";

const EMPTY_HTML = "<h1></h1>";

type QuickCaptureContextValue = {
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
};

const QuickCaptureContext = React.createContext<QuickCaptureContextValue | null>(
  null,
);

export function useQuickCapture() {
  const context = React.useContext(QuickCaptureContext);
  if (!context) {
    throw new Error(
      "useQuickCapture must be used within a QuickCaptureProvider",
    );
  }
  return context;
}

export function QuickCaptureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editorKey, setEditorKey] = React.useState<string | null>(null);
  const [modifierLabel, setModifierLabel] = React.useState("Ctrl");
  const navigateOnSaveRef = React.useRef(false);

  const closeQuickCapture = React.useCallback(() => {
    setIsOpen(false);
    setEditorKey(null);
  }, []);

  const openQuickCapture = React.useCallback(() => {
    const generatedId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    setEditorKey(generatedId);
    navigateOnSaveRef.current = false;
    setIsOpen(true);
  }, []);

  const handleSaved = React.useCallback(
    (result: SaveNoteInlineResult) => {
      if (!navigateOnSaveRef.current) {
        navigateOnSaveRef.current = true;
        setIsOpen(false);
        setEditorKey(null);
        router.push(`/notes/${result.id}`);
      }
    },
    [router],
  );

  React.useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      setModifierLabel(navigator.platform.includes("Mac") ? "⌘" : "Ctrl");
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.shiftKey && event.key.toLowerCase() === "n") {
        const target = event.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          if (
            target.isContentEditable ||
            tagName === "INPUT" ||
            tagName === "TEXTAREA"
          ) {
            return;
          }
        }
        event.preventDefault();
        openQuickCapture();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openQuickCapture]);

  const contextValue = React.useMemo(
    () => ({ openQuickCapture, closeQuickCapture }),
    [closeQuickCapture, openQuickCapture],
  );

  return (
    <QuickCaptureContext.Provider value={contextValue}>
      {children}
      <Sheet
        open={isOpen}
        onOpenChange={(next) => {
          if (!next) {
            closeQuickCapture();
          }
        }}
      >
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader className="pb-0">
            <SheetTitle>Quick capture</SheetTitle>
            <SheetDescription>
              Start writing immediately. Your first save opens the full note.
              Use ⇧ + {modifierLabel} + N anytime.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden px-4 pb-6">
            {editorKey ? (
              <InlineEditor
                key={editorKey}
                html={EMPTY_HTML}
                onSaved={handleSaved}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </QuickCaptureContext.Provider>
  );
}

