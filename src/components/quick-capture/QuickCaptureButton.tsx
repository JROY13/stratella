"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickCapture } from "./QuickCaptureProvider";

type ButtonProps = React.ComponentProps<typeof Button>;

interface QuickCaptureButtonProps extends ButtonProps {
  showIcon?: boolean;
}

export function QuickCaptureButton({
  children = "Quick capture",
  showIcon = true,
  onClick,
  type,
  ...props
}: QuickCaptureButtonProps) {
  const { openQuickCapture } = useQuickCapture();

  const handleClick = React.useCallback<
    NonNullable<ButtonProps["onClick"]>
  >(
    (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      openQuickCapture();
    },
    [onClick, openQuickCapture],
  );

  return (
    <Button type={type ?? "button"} onClick={handleClick} {...props}>
      {showIcon && <Plus className="size-4" aria-hidden />}
      {children}
    </Button>
  );
}

