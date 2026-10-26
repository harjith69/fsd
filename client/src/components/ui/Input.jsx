import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#1B2140] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A91AD]">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full rounded-xl bg-white border border-[#ECEEF7] text-sm text-[#1B2140] placeholder-[#8A91AD] transition-all duration-200 py-2.5 ${
              Icon ? 'pl-10 pr-4' : 'px-4'
            } focus:outline-none focus:border-[#5B6CFF] focus:ring-4 focus:ring-[#5B6CFF]/10 disabled:bg-[#F7F8FC] disabled:cursor-not-allowed ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#8A91AD]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
