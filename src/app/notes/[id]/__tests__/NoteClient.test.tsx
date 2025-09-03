import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import NoteClient from "../NoteClient";

let changeHandler: (html: string) => void = () => {};

vi.mock("@/components/editor/InlineEditor", () => ({
  __esModule: true,
  default: (props: { onBlur?: () => void; onChange?: (h: string) => void }) => {
    changeHandler = props.onChange ?? (() => {});
    return <div data-testid="editor" tabIndex={0} onBlur={props.onBlur} />;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }),
}));

describe("NoteClient", () => {
  beforeEach(() => {
    changeHandler = () => {};
  });

  const baseProps = {
    noteId: "1",
    html: "<h1></h1>",
    created: "",
    modified: "",
    openTasks: 0,
  };

  it("deletes empty note on blur", () => {
    const onDelete = vi.fn();
    const { getByTestId } = render(
      <NoteClient {...baseProps} onDelete={onDelete} />,
    );
    const editor = getByTestId("editor");
    editor.focus();
    fireEvent.blur(editor);
    expect(onDelete).toHaveBeenCalled();
  });

  it("keeps note when user typed", () => {
    const onDelete = vi.fn();
    const { getByTestId } = render(
      <NoteClient {...baseProps} onDelete={onDelete} />,
    );
    changeHandler("<h1>Title</h1><p>content</p>");
    const editor = getByTestId("editor");
    editor.focus();
    fireEvent.blur(editor);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
