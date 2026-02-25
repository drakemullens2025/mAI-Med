"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const patientNav: NavItem[] = [
  { href: "/patient", label: "Home", icon: "🏠" },
  { href: "/patient/new-request", label: "New Visit", icon: "➕" },
];

const doctorNav: NavItem[] = [
  { href: "/doctor", label: "Queue", icon: "📋" },
];

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = role === "doctor" ? doctorNav : patientNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom border-t border-border bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
                active ? "text-primary font-medium" : "text-text-secondary"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
