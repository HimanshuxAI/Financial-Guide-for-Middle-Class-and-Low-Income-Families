import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex font-medium items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-zinc-900 text-white hover:bg-zinc-800 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]": variant === "primary",
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200": variant === "secondary",
            "border border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm": variant === "outline",
            "hover:bg-zinc-100 text-zinc-900": variant === "ghost",
            "bg-status-red text-white hover:opacity-90 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]": variant === "danger",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
