"use client";

export function PhoneField({
  value,
  onChange,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <span className="inline-flex items-center rounded-md border border-line bg-ink/5 px-3 text-sm font-medium text-ink/70">
        +91
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="98765 43210"
        maxLength={10}
        disabled={disabled}
        autoFocus={autoFocus}
        className="field-input flex-1 tracking-wide"
      />
    </div>
  );
}
