'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EduDashboardLayout from '@/components/EduDashboardLayout';
import { User, Mail, Phone, Lock, Calendar, BookOpen, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

export default function RegisterStudentPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    rollNumber: string;
    className: string;
    department: string;
    phone: string;
    role: UserRole;
  }>({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    className: 'Class 10',
    department: 'Science',
    phone: '',
    role: 'STUDENT',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/student');
      }, 1500);
    } else {
      setError(res.error || 'Failed to register student');
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      rollNumber: '',
      className: 'Class 10',
      department: 'Science',
      phone: '',
      role: 'STUDENT',
    });
  };

  return (
    <EduDashboardLayout>
      {/* Header matching EduManage Reference Top-right screenshot */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="text-sky-500">🎓</span> Student Registration
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">
            Add a new student to the interactive quiz system
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Student registration successful! Redirecting to Student Portal...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Main Registration Form Container matching EduManage Reference Screenshot */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs max-w-4xl space-y-8">
        {/* Section 1: Personal Information */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500" />
            <span>Personal Information</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
            {/* Avatar Photo Circle */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-sky-50 border-2 border-dashed border-sky-300 flex items-center justify-center text-3xl shadow-inner mb-2 text-sky-600">
                👨‍🎓
              </div>
              <span className="text-[11px] font-bold text-sky-600 cursor-pointer hover:underline">
                Default Student Avatar
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter student name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Role Type
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 transition bg-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-500" />
            <span>Contact & Login Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+880 1700-000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Academic Information */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-500" />
            <span>Academic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Class / Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 transition bg-white"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Department / Section
              </label>
              <input
                type="text"
                placeholder="e.g. Science / Section A"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Roll Number
              </label>
              <input
                type="text"
                placeholder="e.g. CS-2026-101"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Buttons matching EduManage Reference (Reset + Save Student) */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
          >
            ↻ Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition flex items-center gap-2"
          >
            <span>{loading ? 'Saving...' : '💾 Save Student'}</span>
          </button>
        </div>
      </form>
    </EduDashboardLayout>
  );
}
