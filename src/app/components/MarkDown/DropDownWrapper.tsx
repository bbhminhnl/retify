// components/DropdownWrapper.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ReactNode } from "react";

interface DropdownWrapperProps {
  trigger: ReactNode;
  content: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export function DropdownWrapper({
  trigger,
  content,
  open,
  onClose,
}: DropdownWrapperProps) {
  return (
    <DropdownMenu open={open} onOpenChange={(val) => !val && onClose?.()}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4}>{content}</DropdownMenuContent>
    </DropdownMenu>
  );
}
