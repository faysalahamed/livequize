'use client';

import React, { useEffect, useState } from 'react';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import { Trophy, Award, Medal, TrendingUp, Sparkles, Filter } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([
    { rank: 1, name: 'Rahim Al-Hasan', avatar: '👨‍🎓', score: 14850, quizzes: 8, accuracy: '94%', roll: 'CS-2026-042' },
    { rank: 2, name: 'Anika Tabassum', avatar: '👩‍🎓', score: 13920, quizzes: 7, accuracy: '91%', roll: 'CS-2026-015' },
    { rank: 3, name: 'Tanvir Ahmed', avatar: '👨‍🎓', score: 12400, quizzes: 7, accuracy: '88%', roll: 'CS-2026-029' },
    { rank: 4, name: 'Farzana Akter', avatar: '👩‍🎓', score: 11800, quizzes: 6, accuracy: '85%', roll: 'CS-2026-055' },
    { rank: 5, name: 'Mahmudur Rahman', avatar: '👨‍🎓', score: 10950, quizzes: 6, accuracy: '83%', roll: 'CS-2026-061' },
    { rank: 6, name: 'Sadia Islam', avatar: '👩‍🎓', score: 9800, quizzes: 5, accuracy: '80%', roll: 'CS-2026-074' },
  ]);

  return (
    <EduDashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Global Student Leaderboard</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">
            Top academic performers across all live quizzes and interactive challenges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            Semester 2 - 2026
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 2nd Place */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center order-2 md:order-1">
          <span className="text-2xl mb-2">🥈</span>
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl mb-3">
            {leaders[1].avatar}
          </div>
          <h3 className="font-bold text-slate-800 text-sm">{leaders[1].name}</h3>
          <span className="text-[11px] text-slate-400 font-semibold">{leaders[1].roll}</span>
          <div className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono font-black text-sm">
            {leaders[1].score.toLocaleString()} pts
          </div>
        </div>

        {/* 1st Place */}
        <div className="bg-gradient-to-b from-amber-50/70 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center order-1 md:order-2 transform md:-translate-y-2">
          <span className="text-3xl mb-2">👑 🥇</span>
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl mb-3 shadow-sm">
            {leaders[0].avatar}
          </div>
          <h3 className="font-black text-slate-900 text-base">{leaders[0].name}</h3>
          <span className="text-xs text-amber-700 font-bold">{leaders[0].roll}</span>
          <div className="mt-4 px-5 py-2 rounded-xl bg-amber-500 text-white font-mono font-black text-base shadow-md shadow-amber-500/20">
            {leaders[0].score.toLocaleString()} pts
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center order-3">
          <span className="text-2xl mb-2">🥉</span>
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl mb-3">
            {leaders[2].avatar}
          </div>
          <h3 className="font-bold text-slate-800 text-sm">{leaders[2].name}</h3>
          <span className="text-[11px] text-slate-400 font-semibold">{leaders[2].roll}</span>
          <div className="mt-4 px-4 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-mono font-black text-sm">
            {leaders[2].score.toLocaleString()} pts
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4 text-center">Quizzes Done</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leaders.map((s) => (
                <tr key={s.rank} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-black text-slate-700">
                    #{s.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{s.avatar}</span>
                      <span className="font-bold text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{s.roll}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{s.quizzes}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      {s.accuracy}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black font-mono text-sky-600 text-sm">
                    {s.score.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </EduDashboardLayout>
  );
}
