import { cn } from "@/lib/utils";

interface PageShellProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageShell({ title, children, className, noPadding }: PageShellProps) {
  return (
    <main className={cn("pb-20", !noPadding && "px-4 py-6", className)}>
      {title && <h1 className="mb-6 text-2xl font-bold text-text">{title}</h1>}
      {children}
    </main>
  );
}
