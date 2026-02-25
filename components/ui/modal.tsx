"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className={cn("w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl animate-in slide-in-from-bottom-4", className)}>
        {title && <h2 className="mb-4 text-lg font-semibold text-text">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
