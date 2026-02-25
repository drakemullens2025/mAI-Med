import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-text">{label}</label>}
      <textarea
        id={inputId}
        rows={3}
        className={cn(
          "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
