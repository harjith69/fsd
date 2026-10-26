import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none select-none';

  const variants = {
    primary:
      'bg-[#5B6CFF] text-white hover:bg-[#4A59E8] shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-[#5B6CFF]/40 active:translate-y-0',
    secondary:
      'bg-[#EEF0FF] text-[#5B6CFF] hover:bg-[#DDE2FF] focus:ring-[#5B6CFF]/30 active:scale-95',
    outline:
      'border border-[#ECEEF7] bg-white text-[#4A5170] hover:bg-[#F7F8FC] hover:border-[#5B6CFF]/40 focus:ring-[#5B6CFF]/20',
    ghost:
      'text-[#4A5170] hover:bg-[#EEF0FF]/50 hover:text-[#5B6CFF] focus:ring-[#5B6CFF]/20',
    danger:
      'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-300',
    success:
      'bg-[#2EC4A6]/10 text-[#2EC4A6] hover:bg-[#2EC4A6]/20 focus:ring-[#2EC4A6]/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};
