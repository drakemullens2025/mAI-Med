import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-text">{label}</label>}
      <select
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
          error && "border-danger",
          className
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
