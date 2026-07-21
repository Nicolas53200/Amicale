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
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-content-secondary">{label}</label>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-surface-secondary text-[18px] font-bold text-content-primary transition-colors disabled:opacity-30"
        >
          −
        </button>
        <span className="flex-1 text-center text-[20px] font-extrabold text-content-primary">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#E8553A] text-[18px] font-bold text-white transition-colors disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
