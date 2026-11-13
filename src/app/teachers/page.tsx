'use client';

import React, { useEffect, useState } from 'react';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import { UserData } from '@/lib/types';
import { UserCheck, Mail, Phone, BookOpen, Plus, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load teachers list
    setTeachers([
      {
        id: 't-1',
        name: 'Dr. Fatima Noor',
        email: 'teacher@magicquize.com',
        role: 'TEACHER',
        avatar: '👩‍🏫',
        department: 'Mathematics & Computer Science',
        phone: '+880 1722-111222',
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-2',
        name: 'Prof. Anisul Haque',
        email: 'anisul@magicquize.com',
        role: 'TEACHER',
        avatar: '👨‍🏫',
        department: 'Physics & Applied Sciences',
        phone: '+880 1744-333444',
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-3',
        name: 'Ms. Nusrat Jahan',
        email: 'nusrat@magicquize.com',
        role: 'TEACHER',
        avatar: '👩‍🏫',
        department: 'English & Communication',
        phone: '+880 1755-444555',
        createdAt: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <EduDashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-sky-500" />
            <span>Teachers & Faculty Directory</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">
            Manage instructors, quiz authors, and live presenters
          </p>
        </div>

        <Link
          href="/students"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Member</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-3xl shadow-xs">
                  {teacher.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{teacher.name}</h3>
                  <span className="text-[11px] font-semibold text-sky-600 block mt-0.5">
                    {teacher.department}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4 mb-4">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.phone}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Instructor
              </span>
              <span className="text-xs font-bold text-sky-500 hover:underline cursor-pointer">
                View Quizzes →
              </span>
            </div>
          </div>
        ))}
      </div>
    </EduDashboardLayout>
  );
}
