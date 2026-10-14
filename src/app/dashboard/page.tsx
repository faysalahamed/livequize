'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import QuizCard from '@/components/QuizCard';
import { QuizData } from '@/lib/types';
import { Plus, Database, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Layers } from 'lucide-react';

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error?: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      if (data.quizzes) {
        setQuizzes(data.quizzes);
      }
    } catch (e) {
      console.error('Failed to load quizzes', e);
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
      await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Sample quizzes loaded!');
      fetchQuizzes();
    } catch {
      alert('Failed to seed sample quizzes');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* PostgreSQL Status Indicator Banner */}
        <div className="mb-8">
          {dbStatus && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                dbStatus.connected
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  {dbStatus.connected ? (
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      PostgreSQL Database Connected
                    </span>
                  ) : (
                    <div>
                      <span className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Running in In-Memory Live Mode
                      </span>
                      <p className="text-xs text-amber-300/80 mt-0.5">
                        To persist quizzes permanently, configure <code className="bg-slate-900 px-1 py-0.5 rounded text-white">DATABASE_URL</code> in <code className="bg-slate-900 px-1 py-0.5 rounded text-white">.env</code> and run <code className="bg-slate-900 px-1 py-0.5 rounded text-white">npm run prisma:push</code>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  {isSeeding ? 'Seeding...' : 'Load Sample Quizzes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Interactive Presentations</h1>
            <p className="text-sm text-slate-400 mt-1">
              Select a quiz to launch a live room, or build a new presentation from scratch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuizzes}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              title="Refresh Quizzes"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/quiz/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Presentation</span>
            </Link>
          </div>
        </div>

        {/* Quizzes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-800">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">No Quizzes Created Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              Create your first interactive quiz or load our pre-made templates to start presenting right away.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleSeed}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
              >
                Load Pre-Made Templates
              </button>
              <Link
                href="/quiz/new"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition"
              >
                Create from Scratch
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
