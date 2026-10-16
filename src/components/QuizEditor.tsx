'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizData, QuestionData, QuestionType, OptionData } from '@/lib/types';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  BarChart3,
  Cloud,
  HelpCircle,
  Copy,
  ChevronUp,
  ChevronDown,
  Loader2,
  Presentation,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

interface QuizEditorProps {
  initialQuiz?: QuizData;
}

const DEFAULT_COLORS = ['#EF4444', '#3B82F6', '#EAB308', '#10B981', '#8B5CF6', '#EC4899'];

export default function QuizEditor({ initialQuiz }: QuizEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialQuiz?.title || 'Untitled Interactive Presentation');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [theme, setTheme] = useState(initialQuiz?.theme || 'vibrant');

  const [questions, setQuestions] = useState<QuestionData[]>(
    initialQuiz?.questions && initialQuiz.questions.length > 0
      ? initialQuiz.questions
      : [
          {
            id: 'temp-1',
            title: 'What is your favorite feature of this quiz app?',
            type: 'MULTIPLE_CHOICE',
            timeLimit: 20,
            points: 1000,
            order: 0,
            options: [
              { id: 'opt-1', text: 'Real-time WebSocket Sync', isCorrect: true, color: '#EF4444', order: 0 },
              { id: 'opt-2', text: 'Live Animated Bar Charts', isCorrect: false, color: '#3B82F6', order: 1 },
              { id: 'opt-3', text: 'Interactive Word Clouds', isCorrect: false, color: '#EAB308', order: 2 },
              { id: 'opt-4', text: 'Instant Mobile Answering', isCorrect: false, color: '#10B981', order: 3 },
            ],
          },
        ]
  );

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const currentQuestion = questions[activeQuestionIndex] || questions[0];

  const updateCurrentQuestion = (updates: Partial<QuestionData>) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[activeQuestionIndex] = { ...copy[activeQuestionIndex], ...updates };
      return copy;
    });
  };

  const handleAddSlide = (type: QuestionType = 'MULTIPLE_CHOICE') => {
    let title = 'Enter your question prompt here...';
    let content = '';
    let imageUrl = '';
    let options: OptionData[] = [
      { id: `opt-${Date.now()}-1`, text: 'Option A', isCorrect: true, color: '#EF4444', order: 0 },
      { id: `opt-${Date.now()}-2`, text: 'Option B', isCorrect: false, color: '#3B82F6', order: 1 },
      { id: `opt-${Date.now()}-3`, text: 'Option C', isCorrect: false, color: '#EAB308', order: 2 },
      { id: `opt-${Date.now()}-4`, text: 'Option D', isCorrect: false, color: '#10B981', order: 3 },
    ];

    if (type === 'WORD_CLOUD') {
      title = 'In one word, describe your thoughts:';
      options = [];
    } else if (type === 'CONTENT_SLIDE') {
      title = 'Key Concept & Presentation Topic';
      content = '• First major presentation takeaway\n• Supporting analysis or metric\n• Next steps or discussion prompt';
      imageUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80';
      options = [];
    }

    const newQuestion: QuestionData = {
      id: `temp-${Date.now()}`,
      title,
      type,
      timeLimit: type === 'CONTENT_SLIDE' ? 0 : 20,
      points: type === 'MULTIPLE_CHOICE' ? 1000 : 0,
      order: questions.length,
      imageUrl: imageUrl || undefined,
      content: content || undefined,
      options,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setActiveQuestionIndex(questions.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question or slide.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (activeQuestionIndex >= questions.length - 1) {
      setActiveQuestionIndex(Math.max(0, questions.length - 2));
    }
  };

  const handleDuplicateSlide = (idx: number) => {
    const target = questions[idx];
    const duplicated: QuestionData = {
      ...JSON.parse(JSON.stringify(target)),
      id: `temp-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: questions.length,
    };
    setQuestions((prev) => [...prev, duplicated]);
    setActiveQuestionIndex(questions.length);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please provide a title for the presentation');
      return;
    }

    try {
      setIsSaving(true);
      const payload: QuizData = {
        id: initialQuiz?.id || '',
        title: title.trim(),
        description: description.trim(),
        theme,
        questions: questions.map((q, idx) => ({ ...q, order: idx })),
      };

      const res = await fetch(initialQuiz?.id ? `/api/quizzes/${initialQuiz.id}` : '/api/quizzes', {
        method: initialQuiz?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.quiz) {
        router.push('/dashboard');
      } else {
        alert(data.error || 'Failed to save quiz');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving presentation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between gap-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-lg md:text-xl font-black text-white hover:bg-slate-800/60 focus:bg-slate-800 px-2 py-1 rounded-lg border border-transparent focus:border-slate-700 outline-none transition"
              placeholder="Presentation Title..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition hover:scale-105 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Presentation</span>
          </button>
        </div>
      </header>

      {/* Main Studio View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Slide Navigator */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between flex-shrink-0">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slides ({questions.length})
            </span>
            <button
              onClick={() => handleAddSlide('MULTIPLE_CHOICE')}
              className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 bg-brand-950/60 px-2 py-1 rounded-lg border border-brand-800/60 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {questions.map((q, idx) => {
              const isActive = idx === activeQuestionIndex;
              return (
                <div
                  key={q.id || idx}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-brand-950/60 border-brand-500 ring-2 ring-brand-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300">
                      {q.type === 'MULTIPLE_CHOICE' && <HelpCircle className="w-4 h-4 text-brand-400" />}
                      {q.type === 'POLL' && <BarChart3 className="w-4 h-4 text-emerald-400" />}
                      {q.type === 'WORD_CLOUD' && <Cloud className="w-4 h-4 text-purple-400" />}
                      {q.type === 'CONTENT_SLIDE' && <Presentation className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{q.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {q.type === 'CONTENT_SLIDE' ? 'CONTENT SLIDE' : q.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      className="p-1 hover:text-white text-slate-400 rounded"
                      title="Duplicate slide"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      className="p-1 hover:text-red-400 text-slate-400 rounded"
                      title="Delete slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Slide Picker */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleAddSlide('CONTENT_SLIDE')}
              className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-slate-700 transition"
              title="Add PowerPoint-style content slide"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Slide</span>
            </button>
            <button
              onClick={() => handleAddSlide('POLL')}
              className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-slate-700 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Poll</span>
            </button>
            <button
              onClick={() => handleAddSlide('WORD_CLOUD')}
              className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border border-slate-700 transition"
            >
              <Cloud className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Cloud</span>
            </button>
          </div>
        </aside>

        {/* Center: Stage Live Preview */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur relative">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-6">
              <span className="uppercase tracking-wider">
                {currentQuestion.type === 'CONTENT_SLIDE' ? 'PowerPoint Slide Preview' : 'Slide Preview'}
              </span>
              <div className="flex items-center gap-4">
                {currentQuestion.type === 'CONTENT_SLIDE' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300 font-bold text-[11px]">
                    <Presentation className="w-3.5 h-3.5" />
                    Presentation Slide
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {currentQuestion.timeLimit}s
                    </span>
                    {currentQuestion.points > 0 && (
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                        {currentQuestion.points} pts
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Preview Body */}
            {currentQuestion.type === 'CONTENT_SLIDE' ? (
              <div className={`flex flex-col ${currentQuestion.imageUrl ? 'md:flex-row' : ''} gap-6 items-center py-4`}>
                {currentQuestion.imageUrl && (
                  <div className="w-full md:w-1/2 max-h-80 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex items-center justify-center">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Slide visual"
                      className="w-full h-full object-cover max-h-80"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className={`w-full ${currentQuestion.imageUrl ? 'md:w-1/2' : 'max-w-2xl mx-auto text-center'}`}>
                  <MathRenderer
                    as="h2"
                    className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight"
                    text={currentQuestion.title || 'Untitled Slide'}
                  />
                  {currentQuestion.content ? (
                    <div className="space-y-2.5 text-left bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 shadow">
                      {currentQuestion.content
                        .split('\n')
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-slate-200 text-sm md:text-base leading-relaxed">
                            <span className="text-amber-400 font-black mt-0.5">•</span>
                            <MathRenderer text={line.replace(/^[•\-\*]\s*/, '')} />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm italic">Add bullet points or slide notes in the right panel.</p>
                  )}
                </div>
              </div>
            ) : currentQuestion.type === 'WORD_CLOUD' ? (
              <div>
                <MathRenderer
                  as="h2"
                  className="text-2xl md:text-3xl font-black text-white text-center mb-8 px-4 leading-tight"
                  text={currentQuestion.title || 'Untitled Question'}
                />
                {currentQuestion.imageUrl && (
                  <div className="w-full max-w-sm mx-auto mb-6 rounded-2xl overflow-hidden border border-slate-700 shadow-lg max-h-48 flex items-center justify-center bg-slate-950">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Illustration"
                      className="w-full h-full object-cover max-h-48"
                    />
                  </div>
                )}
                <div className="p-12 border-2 border-dashed border-slate-700 rounded-2xl text-center bg-slate-950/40">
                  <Cloud className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-lg font-bold text-white">Live Word Cloud Slide</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Audience members submit words on their devices and they bloom dynamically on the presentation stage!
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <MathRenderer
                  as="h2"
                  className="text-2xl md:text-3xl font-black text-white text-center mb-6 px-4 leading-tight"
                  text={currentQuestion.title || 'Untitled Question'}
                />
                {currentQuestion.imageUrl && (
                  <div className="w-full max-w-sm mx-auto mb-6 rounded-2xl overflow-hidden border border-slate-700 shadow-lg max-h-48 flex items-center justify-center bg-slate-950">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question illustration"
                      className="w-full h-full object-cover max-h-48"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt, i) => (
                    <div
                      key={opt.id || i}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                        opt.isCorrect && currentQuestion.type === 'MULTIPLE_CHOICE'
                          ? 'bg-green-950/40 border-green-500/80 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: opt.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                        />
                        <MathRenderer
                          as="span"
                          className="font-bold text-base"
                          text={opt.text || `Option ${i + 1}`}
                        />
                      </div>

                      {currentQuestion.type === 'MULTIPLE_CHOICE' && opt.isCorrect && (
                        <span className="text-xs font-bold text-green-400 bg-green-900/60 px-2 py-0.5 rounded-full border border-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: Question Settings Inspector */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Slide Configuration
            </h3>

            {/* Slide Type */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Slide Type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { type: 'MULTIPLE_CHOICE', label: 'Quiz', icon: HelpCircle },
                  { type: 'POLL', label: 'Poll', icon: BarChart3 },
                  { type: 'WORD_CLOUD', label: 'Cloud', icon: Cloud },
                  { type: 'CONTENT_SLIDE', label: 'Slide', icon: Presentation },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      updateCurrentQuestion({
                        type: type as QuestionType,
                        points: type === 'MULTIPLE_CHOICE' ? 1000 : 0,
                        timeLimit: type === 'CONTENT_SLIDE' ? 0 : 20,
                        content:
                          type === 'CONTENT_SLIDE' && !currentQuestion.content
                            ? '• Key presentation point\n• Supporting analysis\n• Conclusion'
                            : currentQuestion.content,
                        options:
                          type === 'WORD_CLOUD' || type === 'CONTENT_SLIDE'
                            ? []
                            : currentQuestion.options.length > 0
                            ? currentQuestion.options
                            : [
                                { id: `opt-1`, text: 'Option A', isCorrect: true, color: '#EF4444', order: 0 },
                                { id: `opt-2`, text: 'Option B', isCorrect: false, color: '#3B82F6', order: 1 },
                              ],
                      });
                    }}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition ${
                      currentQuestion.type === type
                        ? 'bg-brand-600 text-white border-brand-400 shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question / Slide Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {currentQuestion.type === 'CONTENT_SLIDE' ? 'Slide Title' : 'Question Prompt'}
              </label>
              <textarea
                value={currentQuestion.title}
                onChange={(e) => updateCurrentQuestion({ title: e.target.value })}
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 transition resize-none"
                placeholder={currentQuestion.type === 'CONTENT_SLIDE' ? 'e.g. Q3 Growth Strategy' : 'What would you like to ask?'}
              />

              {/* Math Formula Shortcuts */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Math Formula Shortcuts ($...$)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'a²', code: '$a^2$' },
                    { label: '½', code: '$\\frac{1}{2}$' },
                    { label: '√x', code: '$\\sqrt{x}$' },
                    { label: 'a²+b²=c²', code: '$a^2 + b^2 = c^2$' },
                    { label: 'x/y', code: '$\\frac{x}{y}$' },
                    { label: '±', code: '$\\pm$' },
                    { label: 'π', code: '$\\pi$' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        updateCurrentQuestion({
                          title: (currentQuestion.title ? currentQuestion.title + ' ' : '') + item.code,
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 hover:border-brand-500 transition"
                      title={`Insert ${item.code}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Image URL input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
                  <span>Image URL (Optional)</span>
                </label>
                {currentQuestion.imageUrl && (
                  <button
                    onClick={() => updateCurrentQuestion({ imageUrl: undefined })}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                value={currentQuestion.imageUrl || ''}
                onChange={(e) => updateCurrentQuestion({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500 font-mono"
              />

              {/* Quick Preset Images */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500 font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentQuestion({
                      imageUrl:
                        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=80',
                    })
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Meeting
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentQuestion({
                      imageUrl:
                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
                    })
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Charts
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentQuestion({
                      imageUrl:
                        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
                    })
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Tech
                </button>
              </div>
            </div>

            {/* If CONTENT_SLIDE: show bullet points / content textarea */}
            {currentQuestion.type === 'CONTENT_SLIDE' ? (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Bullet Points / Slide Notes
                </label>
                <textarea
                  value={currentQuestion.content || ''}
                  onChange={(e) => updateCurrentQuestion({ content: e.target.value })}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-brand-500 font-sans"
                  placeholder="• Key point 1&#10;• Key point 2&#10;• Takeaway or conclusion"
                />
                <p className="text-[10px] text-slate-500 mt-1">Each line is formatted as a presentation bullet point.</p>
              </div>
            ) : (
              /* Time Limit & Points for Quiz / Poll */
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Time Limit</label>
                  <select
                    value={currentQuestion.timeLimit}
                    onChange={(e) => updateCurrentQuestion({ timeLimit: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={20}>20 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={45}>45 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Points</label>
                  <select
                    value={currentQuestion.points}
                    onChange={(e) => updateCurrentQuestion({ points: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value={0}>0 (Poll)</option>
                    <option value={1000}>1,000 (Standard)</option>
                    <option value={2000}>2,000 (Double)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Answer Options Configuration */}
            {currentQuestion.type !== 'WORD_CLOUD' && currentQuestion.type !== 'CONTENT_SLIDE' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Options ({currentQuestion.options.length})
                  </label>
                  {currentQuestion.options.length < 6 && (
                    <button
                      onClick={() => {
                        const newOption: OptionData = {
                          id: `opt-${Date.now()}`,
                          text: `Option ${currentQuestion.options.length + 1}`,
                          isCorrect: false,
                          color: DEFAULT_COLORS[currentQuestion.options.length % DEFAULT_COLORS.length],
                          order: currentQuestion.options.length,
                        };
                        updateCurrentQuestion({
                          options: [...currentQuestion.options, newOption],
                        });
                      }}
                      className="text-xs text-brand-400 font-bold hover:underline"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {currentQuestion.options.map((opt, i) => (
                    <div
                      key={opt.id || i}
                      className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center gap-2"
                    >
                      {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = currentQuestion.options.map((o, idx) => ({
                              ...o,
                              isCorrect: idx === i,
                            }));
                            updateCurrentQuestion({ options: newOptions });
                          }}
                          className={`p-1 rounded-full transition ${
                            opt.isCorrect ? 'text-green-400' : 'text-slate-500 hover:text-slate-400'
                          }`}
                          title="Set as correct answer"
                        >
                          {opt.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 fill-green-400 text-slate-900" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      )}

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[i].text = e.target.value;
                          updateCurrentQuestion({ options: newOptions });
                        }}
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                        placeholder={`Option ${i + 1}`}
                      />

                      {currentQuestion.options.length > 2 && (
                        <button
                          onClick={() => {
                            const newOptions = currentQuestion.options.filter((_, idx) => idx !== i);
                            updateCurrentQuestion({ options: newOptions });
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                          title="Remove option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
