import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-[#EEF0FF]/60 rounded-full border border-[#ECEEF7] max-w-fit ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
              isActive
                ? 'bg-white text-[#5B6CFF] shadow-sm'
                : 'text-[#4A5170] hover:text-[#1B2140] hover:bg-white/40'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-[#EEF0FF] text-[#5B6CFF]'
                    : 'bg-[#ECEEF7] text-[#8A91AD]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
