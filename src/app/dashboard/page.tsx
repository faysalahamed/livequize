'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import QuizCard from '@/components/QuizCard';
import { QuizData } from '@/lib/types';
import {
  Users,
  GraduationCap,
  BookOpen,
  Trophy,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error?: string } | null>(null);
  const { user } = useAuth();

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      if (data.quizzes) {
        setQuizzes(data.quizzes);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setDbStatus(data);
    } catch {
      setDbStatus({ connected: false });
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchDbStatus();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert('Failed to delete quiz');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting quiz');
    }
  };

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchQuizzes();
      } else {
        alert(data.error || 'Failed to seed sample quizzes');
      }
    } catch (err: any) {
      alert(err.message || 'Error seeding quizzes');
    } finally {
      setIsSeeding(false);
    }
  };

  const totalQuestions = quizzes.reduce((acc, q) => acc + q.questions.length, 0);

  return (
    <EduDashboardLayout>
      {/* Top Banner / Heading matching EduManage design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">
            Welcome back, {user?.name || 'Administrator'}! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Today Date Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-xs">
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <Link
            href="/quiz/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create New Quiz</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Directly styled like EduManage Reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ 8%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Students
          </span>
          <span className="text-2xl md:text-3xl font-black text-slate-800">
            1,250
          </span>
        </div>

        {/* Card 2: Faculty / Teachers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ 2%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Teachers & Faculty
          </span>
          <span className="text-2xl md:text-3xl font-black text-slate-800">
            85
          </span>
        </div>

        {/* Card 3: Active Quizzes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ 12%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Quizzes
          </span>
          <span className="text-2xl md:text-3xl font-black text-slate-800">
            {quizzes.length}
          </span>
        </div>

        {/* Card 4: Total Questions / Slides */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
              <Trophy className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ 18%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Quiz Slides
          </span>
          <span className="text-2xl md:text-3xl font-black text-slate-800">
            {totalQuestions}
          </span>
        </div>
      </div>

      {/* Middle Row: Analytics Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Bar Chart Visualization */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Quiz Participation Overview</h2>
              <p className="text-xs text-slate-400">Monthly student participation vs completions</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-sky-600">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span> Started
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-sky-200"></span> Completed
              </span>
            </div>
          </div>

          {/* Simple Simulated Bar Chart matching reference image style */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-100 pb-2">
            {[
              { m: 'Jan', v1: 45, v2: 35 },
              { m: 'Feb', v1: 65, v2: 50 },
              { m: 'Mar', v1: 55, v2: 45 },
              { m: 'Apr', v1: 80, v2: 70 },
              { m: 'May', v1: 75, v2: 60 },
              { m: 'Jun', v1: 95, v2: 85 },
            ].map((col) => (
              <div key={col.m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    style={{ height: `${col.v1}%` }}
                    className="w-4 sm:w-5 bg-sky-500 rounded-t-lg transition-all duration-500 hover:brightness-110"
                    title={`Started: ${col.v1}%`}
                  ></div>
                  <div
                    style={{ height: `${col.v2}%` }}
                    className="w-4 sm:w-5 bg-sky-200 rounded-t-lg transition-all duration-500 hover:brightness-105"
                    title={`Completed: ${col.v2}%`}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{col.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Activities matching reference design */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800">Recent Activities</h2>
              <span className="text-xs font-bold text-sky-500 hover:underline cursor-pointer">View All →</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                  +
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Rahim Al-Hasan joined Tech Challenge</p>
                  <span className="text-[10px] text-slate-400 font-medium">Today, 10:30 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Dr. Fatima hosted Mathematics Quiz</p>
                  <span className="text-[10px] text-slate-400 font-medium">Today, 09:45 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                  🏆
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Leaderboard updated for Semester 2</p>
                  <span className="text-[10px] text-slate-400 font-medium">Today, 08:20 AM</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>{isSeeding ? 'Reloading...' : 'Reload Sample Quizzes'}</span>
          </button>
        </div>
      </div>

      {/* Quizzes List Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">Interactive Quiz Library</h2>
          <p className="text-xs text-slate-400 font-medium">Launch live presenter rooms or edit slides</p>
        </div>

        <button
          onClick={fetchQuizzes}
          className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition"
          title="Refresh Quizzes"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Quizzes Created Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Get started by creating a new live interactive presentation or loading pre-made templates.
          </p>
          <button
            onClick={handleSeed}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition"
          >
            Load Sample Quizzes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </EduDashboardLayout>
  );
}
