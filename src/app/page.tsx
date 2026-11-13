'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, GraduationCap, ArrowRight, Shield, BookOpen, Users, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const { user } = useAuth();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      router.push(`/join?pin=${pin.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none">EduManage</h1>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Academic Quizzes</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={user.role === 'STUDENT' ? '/student' : '/dashboard'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition"
            >
              <span>{user.avatar} My Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition"
              >
                Launch Dashboard
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>EduManage School System & Live Quiz Arena</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tight max-w-3xl leading-[1.15] mb-4">
          ইন্টারেক্টিভ লাইভ কুইজ ও{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">
            শিক্ষার্থী পারফরম্যান্স ট্র্যাকিং
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          শিক্ষক ও অ্যাডমিনদের জন্য সরাসরি কুইজ প্রেজেন্টেশন এবং ছাত্র-ছাত্রীদের জন্য তাৎক্ষণিক অংশগ্রহণ ও পূর্ববর্তী কুইজের অবস্থান পর্যালোচনা।
        </p>

        {/* 6-Digit PIN Join Card matching EduManage form style */}
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 mb-12">
          <h2 className="text-base font-black text-slate-800 mb-1">কুইজে অংশ নিতে পিন (PIN) দিন</h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">শিক্ষকের প্রেজেন্টার স্ক্রিনের ৬-সংখ্যার পিন লিখুন</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder="123 456"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-3xl font-black tracking-widest font-mono py-3.5 px-4 rounded-2xl bg-sky-50/50 border-2 border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              autoFocus
            />

            <button
              type="submit"
              disabled={pin.length < 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter Quiz Arena</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>

        {/* Feature Cards Grid (EduManage clean 3-col card style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">👨‍🎓 ছাত্র পোর্টাল (Student Standings)</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              ছাত্ররা তাদের অংশগ্রহণকৃত পূর্ববর্তী সব কুইজের স্কোর, র‍্যাঙ্ক ও সঠিক উত্তরের পার্সেন্টেজ সরাসরি দেখতে পারবে।
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">👩‍🏫 শিক্ষক ড্যাশবোর্ড (Teacher Host)</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              পাওয়ারপয়েন্ট-সদৃশ কনটেন্ট স্লাইড, ইমেজ এবং Math ($a^2, \frac&#123;1&#125;&#123;2&#125;$) ফর্মুলা সহ প্রেজেন্টেশন পরিচালনা।
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">🛡️ অ্যাডমিন ও ম্যানেজমেন্ট</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              সম্পূর্ণ স্কুল সিস্টেমের ছাত্র-শিক্ষক তালিকা ও গ্লোবাল কুইজ লিডারবোর্ড ট্র্যাকিং।
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
