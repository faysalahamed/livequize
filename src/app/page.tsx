'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Play, Sparkles, BarChart3, Cloud, Trophy, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      router.push(`/join?pin=${pin.trim()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/80 border border-brand-800/80 text-brand-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Mentimeter & Kahoot Alternative</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
          Turn passive listeners into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
            active participants
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          Host interactive live quizzes, real-time audience polls, and vibrant word clouds. Powered by Next.js, PostgreSQL, and WebSockets.
        </p>

        {/* Primary Action Card: Join with Game PIN */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-12 transform hover:scale-[1.01] transition-all">
          <h2 className="text-xl font-bold text-white mb-2">Joining a Live Session?</h2>
          <p className="text-xs text-slate-400 mb-6">Enter the 6-digit code shown on the presenter's screen</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="123 456"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-3xl font-black tracking-widest font-mono py-4 px-4 rounded-2xl bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={pin.length < 6}
              className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base tracking-wide shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 group"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Enter Quiz Lobby</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Host Call-to-Action */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 shadow-md transition flex items-center gap-2 hover:scale-105"
          >
            <span>Host or Create a Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/quiz/new"
            className="px-6 py-3.5 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-bold text-sm border border-indigo-800/60 shadow-md transition hover:scale-105"
          >
            + Create New Quiz
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Animated Bar Charts</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Watch votes roll in instantly. Audience votes update the host screen with smooth bar animations in under 50ms.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic Word Clouds</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Let audiences submit single words or ideas. The system dynamically groups and sizes terms based on live frequency.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Podium & Speed Scoring</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kahoot/Mentimeter style speed multipliers reward lightning-fast answers, ending with a celebratory confetti finale!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MentiPulse • Interactive Presentation Platform</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>Socket.io WebSockets</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
