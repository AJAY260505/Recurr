import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  StartIcon?: React.ReactNode;
  EndIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, StartIcon, EndIcon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {StartIcon && (
          <div className="absolute left-0 bg-secondary/60 rounded-l-md aspect-square h-full flex items-center justify-center">
            {StartIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            StartIcon && 'pl-12',
            EndIcon && 'pr-12',
            className
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-0 bg-red-500 w-10 h-full flex items-center justify-center">
            {EndIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
