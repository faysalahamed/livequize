'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Trophy,
  History,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  PlusCircle,
  Play
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { appConfig } from '@/config/app';

export default function EduSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const role = user?.role || 'ADMIN';

  // Navigation items based on role
  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: role === 'STUDENT' ? '/student' : '/dashboard',
      active: pathname === '/dashboard' || pathname === '/student',
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      label: 'Live Quizzes',
      icon: BookOpen,
      href: '/dashboard',
      active: pathname === '/dashboard' && role !== 'STUDENT',
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      label: 'My Quiz History',
      icon: History,
      href: '/student/history',
      active: pathname === '/student/history',
      roles: ['STUDENT'],
    },
    {
      label: 'Students',
      icon: Users,
      href: '/students',
      active: pathname === '/students',
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      label: 'Teachers',
      icon: UserCheck,
      href: '/teachers',
      active: pathname === '/teachers',
      roles: ['ADMIN'],
    },
    {
      label: 'Leaderboard',
      icon: Trophy,
      href: '/student/leaderboard',
      active: pathname === '/student/leaderboard',
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      label: 'Reports & Analytics',
      icon: BarChart2,
      href: '/reports',
      active: pathname === '/reports',
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      label: 'Join Game',
      icon: Play,
      href: '/join',
      active: pathname === '/join',
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings',
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 shadow-sm z-30 select-none">
      <div>
        {/* Logo and Brand Title matching EduManage */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">
              EduManage
            </h1>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5 block">
              Quiz & School System
            </span>
          </div>
        </div>

        {/* Role Switcher Pill Bar for instant testing */}
        <div className="px-4 pt-4">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-100 text-sky-800 text-xs font-bold hover:bg-sky-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{user?.avatar || '🎓'}</span>
                <span>Role: <strong className="text-sky-600">{role}</strong></span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-sky-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-scale-in text-xs font-semibold">
                <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Switch Active Role
                </div>
                {(['STUDENT', 'TEACHER', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                      role === r ? 'bg-sky-500 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{r === 'STUDENT' ? '👨‍🎓' : r === 'TEACHER' ? '👩‍🏫' : '👨‍💼'}</span>
                    <span>{r === 'STUDENT' ? 'Student View' : r === 'TEACHER' ? 'Teacher View' : 'Admin View'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-4 space-y-1 mt-2">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 font-bold'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-white stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-2xl p-1 bg-white rounded-xl shadow-xs border border-slate-100">
              {user?.avatar || '🎓'}
            </span>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Logged in'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
