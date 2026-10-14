'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Play, Sparkles, User, Shuffle } from 'lucide-react';

const AVATARS = ['🚀', '🦊', '⚡', '🦄', '🎯', '👾', '🦁', '🔮', '🍕', '🏆', '💎', '🐉', '🐱', '🎸'];

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryPin = searchParams?.get('pin');
    if (queryPin) {
      setPin(queryPin.replace(/\D/g, '').slice(0, 6));
    }
  }, [searchParams]);

  const randomizeAvatar = () => {
    const random = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setSelectedAvatar(random);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pin.length < 6) {
      alert('Please enter a valid 6-digit Game PIN');
      return;
    }
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }

    setLoading(true);

    // Save to sessionStorage so play page can reuse
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('menti_nickname', nickname.trim());
      sessionStorage.setItem('menti_avatar', selectedAvatar);
    }

    router.push(`/play/${pin.trim()}`);
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20 text-3xl">
          {selectedAvatar}
        </div>
        <h1 className="text-2xl font-black text-white">Join Live Presentation</h1>
        <p className="text-xs text-slate-400 mt-1">Enter your details to join the live audience</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-5">
        {/* PIN Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5 text-center">
            Game PIN
          </label>
          <input
            type="text"
            placeholder="123 456"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full text-center text-3xl font-black tracking-widest font-mono py-3.5 px-4 rounded-2xl bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
            autoFocus={!pin}
            required
          />
        </div>

        {/* Nickname Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Your Nickname
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Alex, Maya, QuizMaster"
              value={nickname}
              maxLength={20}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>
        </div>

        {/* Avatar Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Choose Avatar
            </label>
            <button
              type="button"
              onClick={randomizeAvatar}
              className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`text-2xl p-2 rounded-xl transition ${
                  selectedAvatar === av
                    ? 'bg-brand-600 ring-2 ring-white scale-110 shadow'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || pin.length < 6 || !nickname.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-extrabold text-base tracking-wide shadow-lg shadow-brand-600/30 transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Enter Live Room</span>
        </button>
      </form>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <JoinContent />
        </Suspense>
      </div>
    </div>
  );
}
