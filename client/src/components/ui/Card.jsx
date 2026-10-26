import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#ECEEF7] shadow-[0_8px_30px_rgba(91,108,255,0.06)] transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 border-b border-[#ECEEF7] flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#1B2140] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#8A91AD] mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
