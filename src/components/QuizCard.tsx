'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/types';
import { Play, Edit2, Trash2, Layers, Loader2, Sparkles, CheckCircle2, Calendar, User } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group shadow-sm">
      <div>
        {/* Top Meta info */}
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            {quiz.questions.length} {quiz.questions.length === 1 ? 'Slide' : 'Slides'}
          </span>

          <div className="flex items-center gap-1">
            <Link
              href={`/quiz/${quiz.id}/edit`}
              className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-sky-50 transition"
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
              className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition"
              title="Delete Quiz"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <MathRenderer
          as="h3"
          className="text-lg font-black text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1 mb-2 leading-tight"
          text={quiz.title}
        />

        {/* Description */}
        <MathRenderer
          as="p"
          className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-normal"
          text={quiz.description || 'No description provided.'}
        />

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {questionTypes.map((t) => (
            <span
              key={t}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wider"
            >
              {t.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Launch Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[110px]">{quiz.creatorName || 'Faculty'}</span>
        </div>

        <button
          onClick={handleLaunch}
          disabled={isLaunching || quiz.questions.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition hover:scale-102 active:scale-98"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Launching...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Host Live</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
