'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import { Play, Sparkles, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function JoinPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '🚀');

  const AVATARS = ['🚀', '🦁', '🦊', '⚡', '🌟', '🦄', '🎯', '🔥', '🎓', '💎'];

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().length === 6 && nickname.trim()) {
      localStorage.setItem('magicquize_pin', pin.trim());
      localStorage.setItem('magicquize_nickname', nickname.trim());
      localStorage.setItem('magicquize_avatar', avatar);
      if (user?.id) {
        localStorage.setItem('magicquize_userId', user.id);
      }
      router.push(`/play/${pin.trim()}`);
    }
  };

  return (
    <EduDashboardLayout>
      <div className="max-w-xl mx-auto py-8">
        {/* Header matching EduManage style */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-600 text-xs font-bold uppercase tracking-wider mb-3 border border-sky-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Live Presentation Room</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Enter Game PIN</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Type the 6-digit PIN displayed on your instructor's presentation screen
          </p>
        </div>

        {/* Join Card Form */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2 text-center">
                6-Digit PIN
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000 000"
                className="w-full text-center text-4xl font-black tracking-widest font-mono py-4 px-4 rounded-2xl bg-sky-50/50 border-2 border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Your Nickname
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter player nickname..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Choose Player Avatar
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition ${
                      avatar === av
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-110'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={pin.length < 6 || !nickname.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-md shadow-sky-500/25 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter Quiz Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </EduDashboardLayout>
  );
}
