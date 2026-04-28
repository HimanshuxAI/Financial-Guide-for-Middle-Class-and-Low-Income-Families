import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-zinc-600">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 ring-offset-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50 hover:border-zinc-300 shadow-sm",
              { "pl-11": icon },
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && <p className="text-sm text-zinc-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SliderProp extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueDisplay?: string | number;
}

export const Slider = forwardRef<HTMLInputElement, SliderProp>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-900">{label}</label>
          <span className="text-lg font-bold text-blue-600">{valueDisplay}</span>
        </div>
        <input
          type="range"
          className={cn("w-full accent-blue-600", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
