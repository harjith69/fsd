import React from 'react';
import { Menu, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const Navbar = ({ onOpenMobile }) => {
  const { user, role, academicYears, selectedYear, setSelectedYear } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-[#ECEEF7] px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Mobile Toggle & Page Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-[#4A5170] hover:bg-[#F7F8FC] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#8A91AD] hidden sm:inline">
            Active Institution:
          </span>
          <span className="text-xs font-bold text-[#1B2140] bg-[#EEF0FF] text-[#5B6CFF] px-2.5 py-1 rounded-full">
            Engineering College Autonomous
          </span>
        </div>
      </div>

      {/* Right side: Academic Year Selector & User Role */}
      <div className="flex items-center gap-3">
        {/* Academic Year Switcher */}
        <div className="flex items-center gap-2 bg-[#F7F8FC] border border-[#ECEEF7] rounded-full px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#5B6CFF]" />
          <span className="text-xs font-semibold text-[#4A5170] hidden md:inline">
            Year:
          </span>
          <select
            value={selectedYear?._id || ''}
            onChange={(e) => {
              const yr = academicYears.find((y) => y._id === e.target.value);
              if (yr) setSelectedYear(yr);
            }}
            className="bg-transparent text-xs font-bold text-[#1B2140] focus:outline-none cursor-pointer"
          >
            {academicYears.map((yr) => (
              <option key={yr._id} value={yr._id}>
                {yr.label} {yr.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* NAAC / NBA badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#2EC4A6] bg-[#2EC4A6]/10 px-3 py-1 rounded-full border border-[#2EC4A6]/20 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>NAAC A++ Ready</span>
        </div>

        {/* User Role Pill */}
        <Badge variant={role === 'admin' ? 'indigo' : role === 'hod' ? 'sky' : 'mint'}>
          {role?.toUpperCase()}
        </Badge>
      </div>
    </header>
  );
};
