"use client";

import { UserButton } from "@stackframe/stack";

export function Header() {
  return (
    <header className="sticky top-0 z-40 safe-top border-b border-border bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">mAI</span>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
