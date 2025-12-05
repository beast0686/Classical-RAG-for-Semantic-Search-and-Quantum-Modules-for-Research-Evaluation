import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
};

const Input: React.FC<InputProps> = ({ label, helperText, className = '', ...rest }) => {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-main">
      {label && <span className="font-medium text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</span>}
      <input
        className={`rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-text-main shadow-sm outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
        {...rest}
      />
      {helperText && <span className="text-[11px] text-text-muted">{helperText}</span>}
    </label>
  );
};

export default Input;


