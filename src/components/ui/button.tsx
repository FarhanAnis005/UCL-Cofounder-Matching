import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400 shadow-md shadow-sky-500/20',
        ucl:
          'bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white font-semibold hover:brightness-110 shadow-lg shadow-indigo-950/40 border border-indigo-400/20',
        whatsapp:
          'whatsapp-cta text-white',
        destructive:
          'bg-red-500/90 text-white hover:bg-red-600 shadow-md shadow-red-500/20',
        outline:
          'border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-100 hover:text-white backdrop-blur-sm',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50',
        ghost:
          'hover:bg-slate-800 text-slate-300 hover:text-white',
        link:
          'text-sky-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-13 rounded-xl px-8 text-base font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
