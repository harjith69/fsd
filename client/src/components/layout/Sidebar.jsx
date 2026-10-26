import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Briefcase,
  Lightbulb,
  FileSpreadsheet,
  CheckSquare,
  Users,
  Building,
  Sliders,
  User,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, role, logout } = useAuth();

  const facultyNav = [
    { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Teaching Workload', path: '/teaching', icon: BookOpen },
    { label: 'Publications', path: '/publications', icon: FileText },
    { label: 'FDPs & Training', path: '/fdps', icon: Award },
    { label: 'Consultancy', path: '/consultancy', icon: Briefcase },
    { label: 'Patents & IP', path: '/patents', icon: Lightbulb },
    { label: 'Appraisal & Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  const hodNav = [
    { label: 'Department Analytics', path: '/hod', icon: LayoutDashboard },
    { label: 'Approval Queue', path: '/hod/approvals', icon: CheckSquare },
    { label: 'Teaching Workload', path: '/teaching', icon: BookOpen },
    { label: 'Publications', path: '/publications', icon: FileText },
    { label: 'FDPs & Training', path: '/fdps', icon: Award },
    { label: 'Consultancy', path: '/consultancy', icon: Briefcase },
    { label: 'Patents & IP', path: '/patents', icon: Lightbulb },
    { label: 'Department Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Institutional Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building },
    { label: 'Scoring Weights', path: '/admin/scoring', icon: Sliders },
    { label: 'All Publications', path: '/publications', icon: FileText },
    { label: 'All Consultancy', path: '/consultancy', icon: Briefcase },
    { label: 'Accreditation Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  const navLinks = role === 'admin' ? adminNav : role === 'hod' ? hodNav : facultyNav;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#1B2140]/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#ECEEF7] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center border-b border-[#ECEEF7] gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5B6CFF] to-[#8E9DFF] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1B2140] tracking-tight">
              AcademiaPulse
            </h1>
            <p className="text-[10px] text-[#8A91AD] font-medium tracking-wide">
              FACULTY PERFORMANCE
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8A91AD]">
            {role === 'admin' ? 'Admin Portal' : role === 'hod' ? 'Department Portal' : 'Faculty Space'}
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#EEF0FF] text-[#5B6CFF] shadow-xs'
                      : 'text-[#4A5170] hover:bg-[#F7F8FC] hover:text-[#1B2140]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-[#ECEEF7] bg-[#FAFBFF]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] border border-[#5B6CFF]/20 flex items-center justify-center text-[#5B6CFF] font-bold text-xs uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1B2140] truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#8A91AD] uppercase font-semibold">
                {user?.role} {user?.department?.code ? `• ${user?.department?.code}` : ''}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#8A91AD] hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
