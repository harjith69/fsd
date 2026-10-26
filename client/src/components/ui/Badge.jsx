import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const normalized = (children || variant || '').toString().toLowerCase();

  let style = 'bg-[#ECEEF7] text-[#4A5170] border-transparent';

  if (normalized.includes('approved') || variant === 'approved' || variant === 'success') {
    style = 'bg-[#2EC4A6]/10 text-[#1B8E77] border-[#2EC4A6]/20';
  } else if (normalized.includes('submitted') || variant === 'submitted' || variant === 'warning') {
    style = 'bg-amber-50 text-amber-700 border-amber-200/60';
  } else if (normalized.includes('rejected') || variant === 'rejected' || variant === 'danger') {
    style = 'bg-rose-50 text-rose-600 border-rose-200/60';
  } else if (normalized.includes('draft') || variant === 'draft') {
    style = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (variant === 'primary' || variant === 'indigo') {
    style = 'bg-[#EEF0FF] text-[#5B6CFF] border-[#5B6CFF]/20';
  } else if (variant === 'sky') {
    style = 'bg-[#6EC1FF]/15 text-[#0072C6] border-[#6EC1FF]/30';
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${sizes[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {children}
    </span>
  );
};
