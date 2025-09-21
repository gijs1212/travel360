import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className, ...props }: LabelProps) => (
  <label className={cn('mb-1 block text-sm font-medium text-slate-700', className)} {...props} />
);
