import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Labeled input with a leading icon and optional password reveal. */
export default function Field({ label, icon: Icon, type = "text", hint, children, ...inputProps }) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-fg">
        {label}
      </label>
      <div className="group flex h-12 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 shadow-soft transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-ring hover:border-line-strong">
        {Icon && (
          <Icon className="h-[18px] w-[18px] shrink-0 text-subtle transition-colors group-focus-within:text-accent" />
        )}
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-fg outline-none sm:text-[0.9375rem]"
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="-mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint}
      {children}
    </div>
  );
}
