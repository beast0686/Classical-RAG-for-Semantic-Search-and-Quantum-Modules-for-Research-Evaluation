import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-soft',
  secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
  ghost: 'bg-transparent text-text-muted hover:bg-slate-100',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', loading, children, className = '', ...rest }) => {
  return (
    <button
      className={`${baseClasses} ${variants[variant]} px-4 py-2 ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;


