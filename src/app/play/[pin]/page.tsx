'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/lib/use-socket';
import { SessionState, QuestionData, ParticipantData, ResponseData } from '@/lib/types';
import { sounds } from '@/lib/sounds';
import { appConfig } from '@/config/app';
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Flame,
  Send,
  Loader2,
  Lock,
  Sparkles,
  Presentation,
} from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

const SHAPES = ['▲', '◆', '●', '■', '★', '⬟'];
const BUTTON_COLORS = [
  'bg-red-500 hover:bg-red-600 border-red-400',
  'bg-blue-500 hover:bg-blue-600 border-blue-400',
  'bg-amber-500 hover:bg-amber-600 border-amber-400',
  'bg-emerald-500 hover:bg-emerald-600 border-emerald-400',
  'bg-purple-500 hover:bg-purple-600 border-purple-400',
  'bg-pink-500 hover:bg-pink-600 border-pink-400',
];

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;
  const { socket, isConnected } = useSocket();

  const [session, setSession] = useState<SessionState | null>(null);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);

  // Answering state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wordInput, setWordInput] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    pointsAwarded: number;
    totalScore: number;
  } | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get nickname and avatar from sessionStorage or prompt
  useEffect(() => {
    if (!pin) return;

    let nickname = '';
    let avatar = '🚀';

    if (typeof window !== 'undefined') {
      nickname = sessionStorage.getItem('menti_nickname') || '';
      avatar = sessionStorage.getItem('menti_avatar') || '🚀';
    }

    if (!nickname) {
      router.push(`/join?pin=${pin}`);
      return;
    }

    if (socket) {
      socket.emit('join_room', {
        pin,
        role: 'player',
        nickname,
        avatar,
      });

      socket.on(
        'joined_successfully',
        ({ participant: p, session: s }: { participant: ParticipantData; session: SessionState }) => {
          setParticipant(p);
          setSession(s);
          setLoading(false);
        }
      );

      socket.on('quiz_started', ({ session: s }: { session: SessionState }) => {
        setSession(s);
        setHasAnswered(false);
        setSelectedOptionId(null);
        setAnswerResult(null);
        setWordInput('');
      });

      socket.on('question_changed', ({ session: s }: { session: SessionState }) => {
        setSession(s);
        setHasAnswered(false);
        setSelectedOptionId(null);
        setAnswerResult(null);
        setWordInput('');
      });

      socket.on(
        'answer_confirmed',
        (result: { isCorrect: boolean; pointsAwarded: number; totalScore: number }) => {
          setHasAnswered(true);
          setAnswerResult(result);
          if (result.isCorrect && result.pointsAwarded > 0) {
            sounds.playCorrect();
          }
          setParticipant((prev) => (prev ? { ...prev, score: result.totalScore } : null));
        }
      );

      socket.on('answer_revealed', ({ session: s }: { session: SessionState }) => {
        setSession(s);
      });

      socket.on('leaderboard_updated', ({ session: s }: { session: SessionState }) => {
        setSession(s);
      });

      socket.on('quiz_finished', ({ session: s }: { session: SessionState }) => {
        setSession(s);
      });

      socket.on('error_message', ({ message }: { message: string }) => {
        alert(message);
        router.push('/join');
      });
    }

    return () => {
      if (socket) {
        socket.off('joined_successfully');
        socket.off('quiz_started');
        socket.off('question_changed');
        socket.off('answer_confirmed');
        socket.off('answer_revealed');
        socket.off('leaderboard_updated');
        socket.off('quiz_finished');
        socket.off('error_message');
      }
    };
  }, [socket, pin, router]);

  // Timer countdown
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (session?.status === 'QUESTION' && session.questions[session.currentQuestionIndex]) {
      const q = session.questions[session.currentQuestionIndex];
      setTimeLeft(q.timeLimit || 20);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.status, session?.currentQuestionIndex]);

  // Submit Multiple Choice / Poll Option
  const handleSelectOption = (optionId: string) => {
    if (hasAnswered || !socket || !participant || !session) return;
    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return;

    setSelectedOptionId(optionId);
    setHasAnswered(true);

    socket.emit('submit_answer', {
      pin,
      participantId: participant.id,
      questionId: currentQ.id,
      optionId,
    });
  };

  // Submit Word Cloud entry
  const handleSubmitWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !wordInput.trim() || !socket || !participant || !session) return;
    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return;

    setHasAnswered(true);

    socket.emit('submit_answer', {
      pin,
      participantId: participant.id,
      questionId: currentQ.id,
      textAnswer: wordInput.trim(),
    });
  };

  if (loading || !participant || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-4" />
        <p className="text-base font-bold text-slate-300">Entering Quiz Room {pin}...</p>
      </div>
    );
  }

  const currentQ: QuestionData | undefined = session.questions[session.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans select-none">
      {/* Top Mobile Bar */}
      <header className="h-16 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{participant.avatar}</span>
          <span className="font-extrabold text-white text-sm max-w-[120px] truncate">
            {participant.nickname}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {participant.streak > 1 && (
            <span className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-950/60 px-2 py-1 rounded-full border border-orange-800">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              {participant.streak}
            </span>
          )}

          <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-xs font-bold text-yellow-400">
            {participant.score.toLocaleString()} pts
          </div>
        </div>
      </header>

      {/* Main Interactive Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg w-full mx-auto">
        {/* ================= 1. LOBBY STATE ================= */}
        {session.status === 'LOBBY' && (
          <div className="w-full text-center py-10 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-brand-600/20 border-2 border-brand-500 flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl shadow-brand-500/20 animate-bounce">
              {participant.avatar}
            </div>

            <h2 className="text-2xl font-black text-white mb-2">You're in!</h2>
            <p className="text-slate-400 text-sm mb-8">
              See your nickname <span className="text-white font-bold">{participant.nickname}</span> on the presenter's screen.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Waiting for host to start the presentation...</span>
            </div>
          </div>
        )}

        {/* ================= 2. ACTIVE QUESTION STATE ================= */}
        {session.status === 'QUESTION' && currentQ && (
          <div className="w-full flex-1 flex flex-col justify-between py-2 animate-fade-in">
            {/* Top Prompt & Timer */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-400">
                <span>Slide {session.currentQuestionIndex + 1}</span>
                {currentQ.timeLimit > 0 && (
                  <span className="flex items-center gap-1 text-brand-400 font-mono">
                    <Clock className="w-3.5 h-3.5" /> {timeLeft}s
                  </span>
                )}
              </div>
              <MathRenderer
                as="h2"
                className="text-lg sm:text-xl font-bold text-white line-clamp-3 leading-snug"
                text={currentQ.title}
              />
            </div>

            {/* If CONTENT_SLIDE: Display Slide View on Mobile */}
            {currentQ.type === 'CONTENT_SLIDE' ? (
              <div className="flex-1 flex flex-col justify-center my-2 animate-fade-in">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                  {currentQ.imageUrl && (
                    <div className="w-full max-h-52 rounded-2xl overflow-hidden border border-slate-700/80 mb-4 bg-slate-950 flex items-center justify-center">
                      <img
                        src={currentQ.imageUrl}
                        alt="Slide visual"
                        className="w-full h-full object-cover max-h-52"
                      />
                    </div>
                  )}
                  {currentQ.content && (
                    <div className="space-y-2 text-left bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 mb-4">
                      {currentQ.content
                        .split('\n')
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-200 text-sm leading-relaxed">
                            <span className="text-amber-400 font-bold">•</span>
                            <MathRenderer text={line.replace(/^[•\-\*]\s*/, '')} />
                          </div>
                        ))}
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Presenter is speaking... Follow along with the slide!</span>
                  </div>
                </div>
              </div>
            ) : hasAnswered ? (
              /* If Already Answered: Show Locked In screen */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/80 rounded-3xl border border-slate-800 my-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-brand-600/20 border-2 border-brand-500 flex items-center justify-center text-brand-400 mb-4 animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Answer Locked In!</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Hang tight! Waiting for the timer to expire or for the presenter to reveal the results.
                </p>
              </div>
            ) : currentQ.type === 'WORD_CLOUD' ? (
              /* Word Cloud submission input */
              <form onSubmit={handleSubmitWord} className="flex-1 flex flex-col justify-center gap-4 my-4">
                {currentQ.imageUrl && (
                  <div className="w-full max-h-40 rounded-xl overflow-hidden border border-slate-700/80 mb-2 bg-slate-950 flex items-center justify-center">
                    <img
                      src={currentQ.imageUrl}
                      alt="Illustration"
                      className="w-full h-full object-cover max-h-40"
                    />
                  </div>
                )}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                    Type your word or idea
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder="e.g. Collaboration, Fast, Fun..."
                    className="w-full py-4 px-4 rounded-2xl bg-slate-950 border-2 border-slate-700 text-white font-bold text-center text-lg focus:outline-none focus:border-brand-500 transition mb-4"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!wordInput.trim()}
                    className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Word</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Multiple Choice / Poll touch buttons */
              <div className="flex-1 flex flex-col justify-center my-2">
                {currentQ.imageUrl && (
                  <div className="w-full max-h-36 rounded-xl overflow-hidden border border-slate-700/80 mb-3 bg-slate-950 flex items-center justify-center">
                    <img
                      src={currentQ.imageUrl}
                      alt="Question diagram"
                      className="w-full h-full object-cover max-h-36"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {currentQ.options.map((opt, idx) => {
                    const colorClass = BUTTON_COLORS[idx % BUTTON_COLORS.length];
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full min-h-[85px] rounded-2xl p-4 flex items-center justify-between text-left font-bold text-white shadow-lg transition transform active:scale-95 border-2 ${colorClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl drop-shadow">{SHAPES[idx % SHAPES.length]}</span>
                          <MathRenderer
                            as="span"
                            className="text-base sm:text-lg leading-snug line-clamp-2"
                            text={opt.text}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 3. REVEAL ANSWER STATE ================= */}
        {session.status === 'REVEAL' && currentQ && (
          <div className="w-full text-center py-8 animate-scale-in">
            {currentQ.type === 'MULTIPLE_CHOICE' ? (
              answerResult?.isCorrect ? (
                <div className="bg-emerald-950/60 border-2 border-emerald-500 rounded-3xl p-8 shadow-2xl mb-6">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-2xl font-black text-white mb-1">Correct! 🎉</h3>
                  <p className="text-emerald-300 font-bold text-lg mb-4">
                    +{answerResult.pointsAwarded.toLocaleString()} points
                  </p>
                  <p className="text-xs text-slate-400">
                    Your Total Score: <span className="font-bold text-white">{answerResult.totalScore.toLocaleString()}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-red-950/60 border-2 border-red-500 rounded-3xl p-8 shadow-2xl mb-6">
                  <XCircle className="w-16 h-16 text-red-400 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-2xl font-black text-white mb-1">Incorrect 😢</h3>
                  <p className="text-red-300 text-sm mb-4">Keep your focus for the next slide!</p>
                  <p className="text-xs text-slate-400">
                    Total Score: <span className="font-bold text-white">{participant.score.toLocaleString()}</span>
                  </p>
                </div>
              )
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl mb-6">
                <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                <h3 className="text-xl font-black text-white mb-2">Response Recorded!</h3>
                <p className="text-xs text-slate-400">
                  Look at the presenter's screen to see the live audience results!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. LEADERBOARD STATE ================= */}
        {session.status === 'LEADERBOARD' && (
          <div className="w-full text-center py-10 animate-fade-in">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-white mb-2">Check the Big Screen!</h2>
            <p className="text-slate-400 text-sm mb-6">The current leaderboard is shown on the presenter stage</p>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-xs mx-auto">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Your Current Score
              </span>
              <span className="text-3xl font-black text-yellow-400 font-mono">
                {participant.score.toLocaleString()} pts
              </span>
            </div>
          </div>
        )}

        {/* ================= 5. FINISHED STATE ================= */}
        {session.status === 'FINISHED' && (
          <div className="w-full text-center py-10 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-4xl mx-auto mb-4">
              🏆
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Quiz Finished!</h2>
            <p className="text-slate-400 text-sm mb-6">Great effort during today’s session!</p>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 max-w-xs mx-auto mb-6">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Final Score
              </span>
              <span className="text-4xl font-black text-white font-mono">
                {participant.score.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 block mt-1">points earned</span>
            </div>

            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>

      {/* Mobile Footer */}
      <footer className="h-12 border-t border-slate-900 bg-slate-950 px-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>PIN: {pin}</span>
        <span>{appConfig.name} Live</span>
      </footer>
    </div>
  );
}
