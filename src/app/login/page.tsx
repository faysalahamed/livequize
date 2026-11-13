'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Shield, BookOpen, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.includes('student')) {
        router.push('/student');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.error || 'Failed to login');
    }
  };

  const handleQuickDemo = async (role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    await switchDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] flex flex-col justify-center items-center p-4">
      {/* Container Card matching EduManage form style */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
            <GraduationCap className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">EduManage System</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Live Quiz & Academic Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@magicquize.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-3 focus:ring-sky-500/10 transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-3 focus:ring-sky-500/10 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider mb-3">
            ⚡ Quick 1-Click Demo Login
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('STUDENT')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 text-center transition flex flex-col items-center gap-1"
            >
              <span className="text-lg">👨‍🎓</span>
              <span className="text-[10px] font-bold">Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('TEACHER')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 text-center transition flex flex-col items-center gap-1"
            >
              <span className="text-lg">👩‍🏫</span>
              <span className="text-[10px] font-bold">Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 text-center transition flex flex-col items-center gap-1"
            >
              <span className="text-lg">👨‍💼</span>
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
