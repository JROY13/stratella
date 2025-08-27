import React from "react";
(globalThis as any).React = React;
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));
import FiltersOverlay from "../FiltersOverlay";
import { useRouter, useSearchParams } from "next/navigation";

function TasksFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  function handleApply(filters: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <button onClick={() => setOpen(true)}>Filters…</button>
      <FiltersOverlay
        open={open}
        onClose={() => setOpen(false)}
        notes={[]}
        tags={[]}
        onApply={handleApply}
      />
    </div>
  );
}

test("Filters button toggles overlay and updates URL parameters", () => {
  render(<TasksFilters />);
  expect(screen.queryByRole("dialog")).toBeNull();

  fireEvent.click(screen.getByText("Filters…"));
  expect(screen.getByRole("dialog")).toBeTruthy();

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "open" },
  });

  fireEvent.click(screen.getByText("Apply"));
  expect(pushMock).toHaveBeenCalledWith("?completion=open");
  expect(screen.queryByRole("dialog")).toBeNull();
});
