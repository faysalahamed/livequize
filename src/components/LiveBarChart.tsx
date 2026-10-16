'use client';

import React from 'react';
import { OptionData, ResponseData } from '@/lib/types';
import { Check, Users } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

interface LiveBarChartProps {
  options: OptionData[];
  responses: ResponseData[];
  showCorrectAnswer: boolean;
  totalParticipants: number;
}

const DEFAULT_COLORS = ['#EF4444', '#3B82F6', '#EAB308', '#10B981', '#8B5CF6', '#EC4899'];
const SHAPES = ['▲', '◆', '●', '■', '★', '⬟'];

export default function LiveBarChart({
  options,
  responses,
  showCorrectAnswer,
  totalParticipants,
}: LiveBarChartProps) {
  const totalResponses = responses.length;

  // Calculate vote count per option
  const counts: Record<string, number> = {};
  options.forEach((opt) => {
    counts[opt.id] = 0;
  });
  responses.forEach((resp) => {
    if (resp.optionId && counts[resp.optionId] !== undefined) {
      counts[resp.optionId] += 1;
    }
  });

  const maxVotes = Math.max(1, ...Object.values(counts));

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end min-h-[320px]">
        {options.map((opt, idx) => {
          const voteCount = counts[opt.id] || 0;
          const percentage = totalResponses > 0 ? Math.round((voteCount / totalResponses) * 100) : 0;
          const heightPercent = totalResponses > 0 ? Math.max(12, Math.round((voteCount / maxVotes) * 100)) : 10;
          const color = opt.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          const isCorrect = opt.isCorrect;

          const isHighlight = showCorrectAnswer && isCorrect;
          const isFaded = showCorrectAnswer && !isCorrect;

          return (
            <div
              key={opt.id}
              className={`flex flex-col items-center justify-end h-full transition-all duration-500 ${
                isFaded ? 'opacity-40 scale-95' : 'opacity-100'
              }`}
            >
              {/* Vote Count & Percentage Badge */}
              <div className="mb-2 text-center transition-all duration-300">
                <span className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-md">
                  {voteCount}
                </span>
                <span className="text-xs text-white/70 block font-medium">{percentage}%</span>
              </div>

              {/* Animated Rising Bar */}
              <div className="w-full flex justify-center items-end h-56 px-2">
                <div
                  className={`w-full rounded-2xl relative shadow-lg transition-all duration-700 ease-out flex flex-col justify-between p-3 border-2 ${
                    isHighlight ? 'ring-4 ring-green-400 border-white shadow-green-500/50' : 'border-white/20'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: color,
                  }}
                >
                  {isHighlight && (
                    <div className="absolute -top-4 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg animate-bounce">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  )}

                  <span className="text-xl font-black text-white/90 drop-shadow">
                    {SHAPES[idx % SHAPES.length]}
                  </span>
                </div>
              </div>

              {/* Option Text Card */}
              <div
                className={`w-full mt-3 p-3.5 rounded-xl border text-center transition-all duration-300 ${
                  isHighlight
                    ? 'bg-green-600/30 border-green-400 text-green-200'
                    : 'bg-slate-800/80 border-slate-700 text-white'
                }`}
              >
                <MathRenderer
                  as="p"
                  className="text-base md:text-lg font-bold leading-snug line-clamp-2"
                  text={opt.text}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Response tally counter */}
      <div className="flex items-center justify-center gap-2 mt-8 text-slate-300 bg-slate-900/60 backdrop-blur px-4 py-2 rounded-full w-max mx-auto border border-slate-800 text-sm font-semibold">
        <Users className="w-4 h-4 text-brand-400" />
        <span>
          {totalResponses} / {totalParticipants} responses submitted
        </span>
      </div>
    </div>
  );
}
