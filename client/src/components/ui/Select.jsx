import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  ({ label, error, helperText, options = [], className = '', id, children, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#1B2140] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-xl bg-white border border-[#ECEEF7] text-sm text-[#1B2140] transition-all duration-200 py-2.5 pl-4 pr-10 focus:outline-none focus:border-[#5B6CFF] focus:ring-4 focus:ring-[#5B6CFF]/10 disabled:bg-[#F7F8FC] disabled:cursor-not-allowed ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
            } ${className}`}
            {...props}
          >
            {children ? (
              children
            ) : (
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8A91AD]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#8A91AD]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
