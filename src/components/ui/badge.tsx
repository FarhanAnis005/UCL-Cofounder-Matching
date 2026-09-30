import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border border-slate-700 bg-slate-800/80 text-slate-200',
        ucl:
          'border border-blue-500/30 bg-blue-950/60 text-blue-300 shadow-sm shadow-blue-900/30',
        superpower:
          'border border-emerald-500/30 bg-emerald-950/50 text-emerald-300 font-medium',
        lookingFor:
          'border border-indigo-500/30 bg-indigo-950/50 text-indigo-300 font-medium',
        industry:
          'border border-slate-700/60 bg-slate-800/50 text-slate-300',
        whatsapp:
          'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        secondary:
          'border border-transparent bg-slate-800 text-slate-300 hover:bg-slate-700',
        destructive:
          'border border-transparent bg-red-900/50 text-red-300',
        outline: 'border border-slate-700 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
