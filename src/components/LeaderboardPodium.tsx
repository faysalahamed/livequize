'use client';

import React, { useEffect } from 'react';
import { ParticipantData } from '@/lib/types';
import { Trophy, Flame, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/sounds';

interface LeaderboardPodiumProps {
  participants: ParticipantData[];
  isFinal?: boolean;
}

export default function LeaderboardPodium({ participants, isFinal = false }: LeaderboardPodiumProps) {
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const others = sorted.slice(3, 10);

  useEffect(() => {
    if (isFinal) {
      sounds.playFanfare();
      // Confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 400);
      } catch {}
    }
  }, [isFinal]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* 3-Step Podium for Top 3 */}
      <div className="flex justify-center items-end gap-3 md:gap-6 min-h-[340px] px-4 mb-8">
        {/* 2nd Place */}
        {second ? (
          <div className="flex-1 max-w-[200px] flex flex-col items-center animate-scale-in">
            <span className="text-4xl mb-2">{second.avatar}</span>
            <span className="font-bold text-white text-base md:text-lg truncate max-w-full">
              {second.nickname}
            </span>
            <span className="text-sm font-semibold text-slate-300 mb-2">
              {second.score.toLocaleString()} pts
            </span>

            <div className="w-full h-44 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-xl border-t-2 border-slate-300">
              <span className="text-3xl font-black text-white/90">2</span>
              <Medal className="w-6 h-6 text-slate-300 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-[200px] opacity-20" />
        )}

        {/* 1st Place */}
        {first ? (
          <div className="flex-1 max-w-[220px] flex flex-col items-center animate-scale-in -mt-8">
            <div className="relative mb-2">
              <Trophy className="w-10 h-10 text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-lg animate-bounce-short" />
              <span className="text-5xl">{first.avatar}</span>
            </div>
            <span className="font-extrabold text-white text-lg md:text-xl truncate max-w-full">
              {first.nickname}
            </span>
            <span className="text-sm font-bold text-yellow-400 mb-2">
              {first.score.toLocaleString()} pts
            </span>

            <div className="w-full h-60 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-2xl border-t-4 border-yellow-200">
              <span className="text-4xl font-black text-slate-950">1</span>
              <Trophy className="w-8 h-8 text-slate-950 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-[220px] opacity-20" />
        )}

        {/* 3rd Place */}
        {third ? (
          <div className="flex-1 max-w-[200px] flex flex-col items-center animate-scale-in">
            <span className="text-4xl mb-2">{third.avatar}</span>
            <span className="font-bold text-white text-base md:text-lg truncate max-w-full">
              {third.nickname}
            </span>
            <span className="text-sm font-semibold text-amber-500 mb-2">
              {third.score.toLocaleString()} pts
            </span>

            <div className="w-full h-32 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-lg border-t-2 border-amber-400">
              <span className="text-3xl font-black text-white/90">3</span>
              <Medal className="w-6 h-6 text-amber-300 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-[200px] opacity-20" />
        )}
      </div>

      {/* Runner Ups (4th - 10th) */}
      {others.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-slate-800 space-y-2">
          {others.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-slate-400 text-sm">{idx + 4}</span>
                <span className="text-2xl">{player.avatar}</span>
                <span className="font-semibold text-white">{player.nickname}</span>
                {player.streak > 1 && (
                  <span className="flex items-center gap-0.5 text-xs text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded-full border border-orange-800">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    {player.streak} streak
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-200">{player.score.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
