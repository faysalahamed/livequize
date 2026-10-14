'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Play, Database } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [pinInput, setPinInput] = useState('');

  const handleJoinByPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim()) {
      router.push(`/join?pin=${pinInput.trim()}`);
    }
  };

  return (
    <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Menti<span className="text-brand-400">Pulse</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wide uppercase">
              Live Interactive Quiz
            </span>
          </div>
        </Link>

        {/* Quick Join PIN Input */}
        <form onSubmit={handleJoinByPin} className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Game PIN..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-40 md:w-48 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 text-center font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!pinInput.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-brand-400 font-bold text-xs uppercase tracking-wider border border-slate-700 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Join
          </button>
        </form>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-800/80 transition"
          >
            My Quizzes
          </Link>
          <Link
            href="/quiz/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
