import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'indigo', // indigo | mint | sky | peach | rose
  trend, // { value: '+12%', isPositive: true }
  className = '',
  onClick,
}) => {
  const accentStyles = {
    indigo: {
      bg: 'bg-[#EEF0FF]',
      text: 'text-[#5B6CFF]',
      border: 'hover:border-[#5B6CFF]/30',
    },
    mint: {
      bg: 'bg-[#2EC4A6]/10',
      text: 'text-[#2EC4A6]',
      border: 'hover:border-[#2EC4A6]/40',
    },
    sky: {
      bg: 'bg-[#6EC1FF]/15',
      text: 'text-[#3AA4F5]',
      border: 'hover:border-[#6EC1FF]/40',
    },
    peach: {
      bg: 'bg-[#FFB88C]/15',
      text: 'text-[#F5874F]',
      border: 'hover:border-[#FFB88C]/40',
    },
    rose: {
      bg: 'bg-[#FF7A93]/15',
      text: 'text-[#FF5978]',
      border: 'hover:border-[#FF7A93]/40',
    },
  };

  const currentAccent = accentStyles[accent] || accentStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#ECEEF7] p-5 shadow-[0_8px_30px_rgba(91,108,255,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${currentAccent.border} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8A91AD]">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentAccent.bg} ${currentAccent.text}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-3xl font-extrabold text-[#1B2140] tracking-tight">
          {value}
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-[#2EC4A6]/10 text-[#2EC4A6]'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend.value}
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-1.5 text-xs text-[#8A91AD] font-medium truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
