import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-text">{label}</label>}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
