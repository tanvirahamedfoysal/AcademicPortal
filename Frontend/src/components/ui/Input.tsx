import { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-md text-sm transition-colors
              focus:outline-none focus:ring-2 
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
              ${error 
                ? 'border-[#b8dce3] focus:border-[#78bac5] focus:ring-[#78bac5]/20 text-[#355f6d] placeholder:text-[#95b9c5]' 
                : 'border-slate-300 focus:border-[#78bac5] focus:ring-[#78bac5]/20 placeholder:text-slate-400'
              }
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-4 w-4 text-[#5f91a0]" />
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#5f91a0] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';