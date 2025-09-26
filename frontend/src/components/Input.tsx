import React from "react";
import { cn } from "../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", className)}>
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center   ">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-white/5 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400",
            icon ? "pl-10" : "pl-4"
          )}
          placeholder={props.placeholder}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
