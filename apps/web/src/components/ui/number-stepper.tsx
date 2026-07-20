"use client";

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({ label, value, onChange, min = 0, max = 99 }: NumberStepperProps) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-surface-secondary p-3">
      <span className="text-[13px] font-medium text-content-primary">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-primary text-[16px] font-bold text-content-primary shadow-sm transition-colors hover:bg-surface-elevated disabled:opacity-30"
        >
          -
        </button>
        <span className="min-w-[24px] text-center text-[15px] font-bold text-content-primary">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[16px] font-bold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
