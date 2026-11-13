'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, Shield, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function EduTopHeader() {
  const { user, logout, switchDemoRole } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const role = user?.role || 'ADMIN';

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input matching EduManage Reference */}
      <div className="w-full max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search quizzes, students, teachers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-sky-50/50 border border-slate-200/80 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-3 focus:ring-sky-500/10 transition"
        />
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-5">
        {/* Quick PIN Join Shortcut */}
        <button
          onClick={() => router.push('/join')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs border border-sky-200/80 transition"
        >
          <span>🎮 Enter PIN</span>
        </button>

        {/* Notifications Icon */}
        <button
          className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500"></span>
        </button>

        {/* User Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-50 border border-slate-200/60 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-lg shadow-xs">
              {user?.avatar || '👨‍💼'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[10px] font-semibold text-sky-600 block leading-tight">
                {role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-scale-in text-xs font-medium">
              <div className="p-3 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-800 text-sm">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200">
                  Role: {role}
                </span>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Demo Account
                </div>
                <button
                  onClick={() => {
                    switchDemoRole('ADMIN');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  <Shield className="w-3.5 h-3.5 text-sky-500" />
                  <span>Admin Mode (Manage all)</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('TEACHER');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Teacher Mode (Create & Host)</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('STUDENT');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Student Mode (History & Play)</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-red-50 text-red-600 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
