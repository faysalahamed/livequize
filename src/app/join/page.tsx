'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import { Play, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const urlPin = searchParams?.get('pin') || '';
  const [pin, setPin] = useState(urlPin);
  const [nickname, setNickname] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '🚀');
  const [checkingPin, setCheckingPin] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{ found: boolean; title?: string } | null>(null);

  const AVATARS = ['🚀', '🦁', '🦊', '⚡', '🌟', '🦄', '🎯', '🔥', '🎓', '💎'];

  // Keep nickname in sync if user logs in or switches role
  useEffect(() => {
    if (user?.name && !nickname) {
      setNickname(user.name);
    }
  }, [user, nickname]);

  // When urlPin arrives or changes, set it
  useEffect(() => {
    if (urlPin && urlPin.length === 6) {
      setPin(urlPin);
    }
  }, [urlPin]);

  // Verify PIN live when 6 digits are present
  useEffect(() => {
    if (pin.length === 6) {
      let isMounted = true;
      setCheckingPin(true);
      fetch(`/api/sessions/${pin}`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setRoomInfo({ found: true, title: data.session?.quizTitle || 'Live Quiz Room' });
          }
        })
        .catch(() => {
          if (isMounted) {
            setRoomInfo({ found: false });
          }
        })
        .finally(() => {
          if (isMounted) setCheckingPin(false);
        });
      return () => {
        isMounted = false;
      };
    } else {
      setRoomInfo(null);
    }
  }, [pin]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    const cleanNickname = (nickname.trim() || user?.name || 'Player').slice(0, 24);

    if (cleanPin.length === 6 && cleanNickname) {
      // Store in both localStorage and sessionStorage with all key conventions for maximum compatibility
      try {
        localStorage.setItem('magicquize_pin', cleanPin);
        localStorage.setItem('magicquize_nickname', cleanNickname);
        localStorage.setItem('magicquize_avatar', avatar);

        sessionStorage.setItem('magicquize_pin', cleanPin);
        sessionStorage.setItem('magicquize_nickname', cleanNickname);
        sessionStorage.setItem('magicquize_avatar', avatar);

        sessionStorage.setItem('menti_pin', cleanPin);
        sessionStorage.setItem('menti_nickname', cleanNickname);
        sessionStorage.setItem('menti_avatar', avatar);

        if (user?.id) {
          localStorage.setItem('magicquize_userId', user.id);
          sessionStorage.setItem('menti_userId', user.id);
        }
      } catch (err) {
        console.warn('Storage write error:', err);
      }

      router.push(`/play/${cleanPin}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Header matching EduManage style */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-600 text-xs font-bold uppercase tracking-wider mb-3 border border-sky-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Join Live Presentation Room</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Enter Game PIN</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Type the 6-digit PIN displayed on your instructor&apos;s presentation screen
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

            {/* Live Room Verification Status */}
            {checkingPin && (
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-400 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                <span>Checking room status...</span>
              </div>
            )}
            {!checkingPin && roomInfo?.found && (
              <div className="flex items-center justify-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Live Room Found: {roomInfo.title}</span>
              </div>
            )}
            {!checkingPin && roomInfo && !roomInfo.found && pin.length === 6 && (
              <div className="flex items-center justify-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Room not found yet. Ask your teacher to launch the session.</span>
              </div>
            )}
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
  );
}

export default function JoinPage() {
  return (
    <EduDashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      }>
        <JoinContent />
      </Suspense>
    </EduDashboardLayout>
  );
}
