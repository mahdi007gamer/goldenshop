"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg
              bg-obsidian-light border border-obsidian-lighter
              text-white placeholder-gray-500
              focus:outline-none focus:border-cyber/50 focus:ring-1 focus:ring-cyber/20
              transition-all duration-200
              ${icon ? "ps-10" : ""}
              ${error ? "border-danger/50 focus:border-danger/50 focus:ring-danger/20" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
