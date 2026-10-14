'use client';

import React, { useMemo } from 'react';
import { ResponseData } from '@/lib/types';
import { MessageSquare } from 'lucide-react';

interface WordCloudProps {
  responses: ResponseData[];
  totalParticipants: number;
}

const CLOUD_COLORS = [
  'text-cyan-400',
  'text-pink-400',
  'text-emerald-400',
  'text-yellow-300',
  'text-purple-400',
  'text-blue-400',
  'text-amber-400',
  'text-rose-400',
  'text-indigo-300',
  'text-teal-300',
];

export default function WordCloud({ responses, totalParticipants }: WordCloudProps) {
  const wordsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.textAnswer) {
        const cleaned = r.textAnswer.trim().toLowerCase();
        if (cleaned.length > 0) {
          counts[cleaned] = (counts[cleaned] || 0) + 1;
        }
      }
    });

    const entries = Object.entries(counts).map(([word, count]) => ({
      word,
      count,
    }));

    // Sort by count descending
    entries.sort((a, b) => b.count - a.count);
    return entries;
  }, [responses]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...wordsWithCounts.map((w) => w.count));
  }, [wordsWithCounts]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {wordsWithCounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-700 rounded-3xl bg-slate-900/40">
          <MessageSquare className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
          <p className="text-xl font-bold text-slate-300">Waiting for responses...</p>
          <p className="text-sm text-slate-500 mt-1">Participants can submit words from their phones</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-6 p-8 min-h-[300px] bg-slate-900/60 backdrop-blur rounded-3xl border border-slate-800 shadow-2xl">
          {wordsWithCounts.map(({ word, count }, idx) => {
            // Scale font size between 1.25rem (text-xl) and 4.5rem (text-7xl)
            const ratio = count / maxCount;
            const fontSize = Math.min(4.5, 1.25 + ratio * 2.8);
            const colorClass = CLOUD_COLORS[idx % CLOUD_COLORS.length];

            return (
              <div
                key={word}
                className="group relative inline-flex items-center transition-all duration-500 hover:scale-110"
                style={{ fontSize: `${fontSize}rem` }}
              >
                <span className={`font-black tracking-tight ${colorClass} drop-shadow-md select-none`}>
                  {word}
                </span>
                {count > 1 && (
                  <span className="ml-1 text-xs bg-slate-800 text-white/80 px-2 py-0.5 rounded-full font-bold border border-slate-700">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-sm font-semibold">
        <MessageSquare className="w-4 h-4 text-brand-400" />
        <span>
          {responses.length} words submitted by {totalParticipants} participants
        </span>
      </div>
    </div>
  );
}
