import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
const pushMock = vi.fn();
const params = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => params,
  usePathname: () => "/tasks",
}));
interface DateFilterProps {
  onChange: (date: string | undefined) => void;
  value?: string;
  onClear: () => void;
}
vi.mock("../DateFilterTrigger", () => ({
  default: ({ onChange, value, onClear }: DateFilterProps) => (
    <div>
      <button onClick={() => onChange("2024-01-01")}>set-date</button>
      {value && <button onClick={onClear}>clear-date</button>}
    </div>
  ),
}));
import TasksFilters from "../TasksFilters";

test("filter button toggles bar and applies parameters", () => {
  render(<TasksFilters notes={[]} tags={[]} />);
  expect(screen.queryAllByRole("combobox").length).toBe(0);

  fireEvent.click(screen.getByLabelText("Toggle filters"));
  expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "open" },
  });

  fireEvent.click(screen.getByText("Apply"));
  expect(pushMock).toHaveBeenCalledWith("?completion=open");
  expect(screen.queryAllByRole("combobox").length).toBe(0);
});
