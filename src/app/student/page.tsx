'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import {
  Trophy,
  History,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { StudentQuizHistoryItem } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [history, setHistory] = useState<StudentQuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/student/history');
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        }
      } catch (e) {
        console.warn('Error loading student history:', e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleJoinPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      router.push(`/join?pin=${pin.trim()}`);
    }
  };

  const totalScore = history.reduce((acc, item) => acc + item.score, 0);
  const bestRank = history.length > 0 ? Math.min(...history.map((h) => h.rank)) : 0;
  const avgCorrectPercent =
    history.length > 0
      ? Math.round(
          (history.reduce((acc, h) => acc + h.correctAnswers / Math.max(1, h.totalQuestions), 0) /
            history.length) *
            100
        )
      : 0;

  return (
    <EduDashboardLayout>
      {/* Student Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center text-4xl shadow-sm">
            {user?.avatar || '👨‍🎓'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-1 border border-sky-100">
              <span>Student Profile</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800">{user?.name || 'Rahim Al-Hasan'}</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Roll: <strong className="text-slate-600">{user?.rollNumber || 'CS-2026-042'}</strong> • {user?.className || 'Class 10'} • {user?.department || 'Science'}
            </p>
          </div>
        </div>

        {/* Quick Join Game PIN Card */}
        <form
          onSubmit={handleJoinPin}
          className="bg-[#F0F5FA] p-4 rounded-2xl border border-sky-200/80 flex items-center gap-3 w-full md:w-auto"
        >
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Have a Game PIN?
            </label>
            <input
              type="text"
              placeholder="e.g. 123 456"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold text-sm text-center w-32 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={pin.length < 6}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center gap-1.5 mt-3.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Join</span>
          </button>
        </form>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Quizzes Participated
          </span>
          <span className="text-2xl font-black text-slate-800">{history.length}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Highest Rank
          </span>
          <span className="text-2xl font-black text-slate-800">
            {bestRank > 0 ? `#${bestRank}` : '—'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Points Earned
          </span>
          <span className="text-2xl font-black text-slate-800">{totalScore.toLocaleString()} pts</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Accuracy Rate
          </span>
          <span className="text-2xl font-black text-emerald-600">{avgCorrectPercent}%</span>
        </div>
      </div>

      {/* Detailed Quiz History & Standings Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-500" />
              <span>পূর্ববর্তী কুইজে অংশগ্রহণের অবস্থান ও ফলাফল (Quiz Standings)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review your ranks, scores, and answer accuracy across past live sessions
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Loading student records...
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Quiz Records Found</p>
            <p className="text-xs text-slate-400 mt-1">
              Join a live quiz using a PIN from your teacher to see your performance history here!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">কুইজের শিরোনাম (Quiz)</th>
                  <th className="py-3 px-4">তারিখ (Date)</th>
                  <th className="py-3 px-4 text-center">অবস্থান (Rank)</th>
                  <th className="py-3 px-4 text-center">স্কোর (Score)</th>
                  <th className="py-3 px-4 text-center">সঠিক উত্তর (Accuracy)</th>
                  <th className="py-3 px-4 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/40 transition">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {item.quizTitle}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-black text-xs ${
                          item.rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : item.rank === 3
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.rank === 1 ? '🥇 1st' : item.rank === 2 ? '🥈 2nd' : item.rank === 3 ? '🥉 3rd' : `#${item.rank}`}
                        <span className="text-[10px] text-slate-400 font-normal">
                          /{item.totalParticipants}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-800 font-mono">
                      {item.score.toLocaleString()} pts
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        {item.correctAnswers} / {item.totalQuestions} ({Math.round((item.correctAnswers / Math.max(1, item.totalQuestions)) * 100)}%)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EduDashboardLayout>
  );
}
