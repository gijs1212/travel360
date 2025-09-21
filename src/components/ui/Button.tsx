import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const baseStyles =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600',
  secondary: 'bg-white text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus-visible:outline-primary-600',
  ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:outline-primary-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
