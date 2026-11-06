'use client';

import type { LucideIcon } from 'lucide-react';

export interface ViewOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface ViewToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly ViewOption<T>[];
  label: string;
}

export default function ViewToggle<T extends string>({
  value,
  onChange,
  options,
  label,
}: ViewToggleProps<T>) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border p-1"
      role="group"
      aria-label={label}
      style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}
    >
      <span
        className="hidden px-2 text-[10px] font-bold uppercase tracking-wider sm:inline"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.label}
            aria-label={option.label}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-md p-1.5 transition-colors ${
              active
                ? 'bg-(--btn-active) text-(--btn-active-text)'
                : 'text-(--text-secondary) hover:bg-(--tag-bg)'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
