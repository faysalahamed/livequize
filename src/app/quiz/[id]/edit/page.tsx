'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QuizEditor from '@/components/QuizEditor';
import { QuizData } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditQuizPage() {
  const params = useParams();
  const id = params?.id as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/quizzes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.quiz) {
            setQuiz(data.quiz);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <p className="text-xl font-bold mb-4">Quiz not found</p>
        <a href="/dashboard" className="text-brand-400 hover:underline font-semibold">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <QuizEditor initialQuiz={quiz} />;
}
