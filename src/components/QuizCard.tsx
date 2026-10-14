'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/types';
import { Play, Edit2, Trash2, HelpCircle, Layers, Loader2 } from 'lucide-react';

interface QuizCardProps {
  quiz: QuizData;
  onDelete: (id: string) => void;
}

export default function QuizCard({ quiz, onDelete }: QuizCardProps) {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    try {
      setIsLaunching(true);
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id }),
      });
      const data = await res.json();
      if (data.pin) {
        router.push(`/host/${data.pin}`);
      } else {
        alert(data.error || 'Failed to start session');
      }
    } catch (err: any) {
      alert(err.message || 'Error launching session');
    } finally {
      setIsLaunching(false);
    }
  };

  const questionTypes = Array.from(new Set(quiz.questions.map((q) => q.type)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`/quiz/${quiz.id}/edit`}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Edit Quiz"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
                  onDelete(quiz.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
              title="Delete Quiz"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1 mb-2">
          {quiz.title}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {quiz.description || 'No description provided.'}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questionTypes.map((t) => (
            <span
              key={t}
              className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-950/60 text-brand-300 border border-brand-800/60 uppercase tracking-wider"
            >
              {t.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={handleLaunch}
        disabled={isLaunching}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-brand-600/25 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {isLaunching ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4 fill-white" />
        )}
        <span>{isLaunching ? 'Starting Room...' : 'Start Live Quiz'}</span>
      </button>
    </div>
  );
}
