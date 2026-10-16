'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/lib/use-socket';
import { SessionState, QuestionData, ParticipantData, ResponseData } from '@/lib/types';
import LiveBarChart from '@/components/LiveBarChart';
import WordCloud from '@/components/WordCloud';
import LeaderboardPodium from '@/components/LeaderboardPodium';
import QrModal from '@/components/QrModal';
import { sounds } from '@/lib/sounds';
import {
  Users,
  Play,
  ChevronRight,
  Trophy,
  Volume2,
  VolumeX,
  Maximize2,
  QrCode,
  Sparkles,
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Presentation,
} from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

export default function HostLivePage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;
  const { socket, isConnected } = useSocket();

  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle sound
  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Socket setup
  useEffect(() => {
    if (!socket || !pin) return;

    socket.emit('join_room', { pin, role: 'host' });

    socket.on('session_synced', ({ session: s }: { session: SessionState }) => {
      setSession(s);
      setLoading(false);
    });

    socket.on('participant_joined', ({ participants }: { participants: ParticipantData[] }) => {
      setSession((prev) => (prev ? { ...prev, participants } : null));
    });

    socket.on('participant_left', ({ participants }: { participants: ParticipantData[] }) => {
      setSession((prev) => (prev ? { ...prev, participants } : null));
    });

    socket.on('quiz_started', ({ session: s }: { session: SessionState }) => {
      setSession(s);
    });

    socket.on('question_changed', ({ session: s }: { session: SessionState }) => {
      setSession(s);
    });

    socket.on(
      'live_response_received',
      ({ responses }: { responses: ResponseData[]; totalResponses: number }) => {
        setSession((prev) => {
          if (!prev) return null;
          // Merge or replace responses
          const otherResponses = prev.responses.filter(
            (r) => r.questionId !== prev.questions[prev.currentQuestionIndex]?.id
          );
          return {
            ...prev,
            responses: [...otherResponses, ...responses],
          };
        });
      }
    );

    socket.on('answer_revealed', ({ session: s }: { session: SessionState }) => {
      setSession(s);
      sounds.playCorrect();
    });

    socket.on('leaderboard_updated', ({ session: s }: { session: SessionState }) => {
      setSession(s);
    });

    socket.on('quiz_finished', ({ session: s }: { session: SessionState }) => {
      setSession(s);
    });

    return () => {
      socket.off('session_synced');
      socket.off('participant_joined');
      socket.off('participant_left');
      socket.off('quiz_started');
      socket.off('question_changed');
      socket.off('live_response_received');
      socket.off('answer_revealed');
      socket.off('leaderboard_updated');
      socket.off('quiz_finished');
    };
  }, [socket, pin]);

  // Handle countdown timer when in QUESTION state
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (session?.status === 'QUESTION' && session.questions[session.currentQuestionIndex]) {
      const currentQ = session.questions[session.currentQuestionIndex];
      if (currentQ.type === 'CONTENT_SLIDE' || currentQ.timeLimit <= 0) {
        setTimeLeft(0);
        return;
      }

      const initialSeconds = currentQ.timeLimit || 20;
      setTimeLeft(initialSeconds);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            // Auto reveal when timer hits 0
            if (socket && pin) {
              socket.emit('reveal_answer', { pin });
            }
            return 0;
          }
          if (prev <= 6) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.status, session?.currentQuestionIndex]);

  // Host Action handlers
  const handleStartQuiz = () => {
    if (socket && pin) {
      socket.emit('start_quiz', { pin });
    }
  };

  const handleRevealAnswer = () => {
    if (socket && pin) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(0);
      socket.emit('reveal_answer', { pin });
    }
  };

  const handleShowLeaderboard = () => {
    if (socket && pin) {
      socket.emit('show_leaderboard', { pin });
    }
  };

  const handleNextQuestion = () => {
    if (socket && pin) {
      socket.emit('next_question', { pin });
    }
  };

  const handleEndQuiz = () => {
    if (socket && pin) {
      socket.emit('end_quiz', { pin });
    }
  };

  if (loading || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
        <p className="text-sm text-slate-400 font-semibold tracking-wide">Connecting to Live Room {pin}...</p>
      </div>
    );
  }

  const currentQuestion: QuestionData | undefined = session.questions[session.currentQuestionIndex];
  const currentQuestionResponses = session.responses.filter(
    (r) => r.questionId === currentQuestion?.id
  );
  const isLastQuestion = session.currentQuestionIndex >= session.questions.length - 1;

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans">
      <QrModal pin={pin} isOpen={showQr} onClose={() => setShowQr(false)} />

      {/* Presentation Top Bar */}
      <header className="h-20 px-6 sm:px-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Leave to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Join Instructions Pill */}
          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 shadow-sm">
            <span className="text-xs sm:text-sm text-slate-300 font-medium">Join at:</span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/join
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs sm:text-sm text-slate-300 font-medium">PIN:</span>
            <span className="text-lg sm:text-xl font-black text-brand-400 font-mono tracking-wider">
              {pin}
            </span>
          </div>

          <button
            onClick={() => setShowQr(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
          >
            <QrCode className="w-4 h-4 text-brand-400" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Right Info & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-slate-300 text-sm font-semibold">
            <Users className="w-4 h-4 text-brand-400" />
            <span>{session.participants.length} Players</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Fullscreen Mode"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* ================= 1. LOBBY STATE ================= */}
        {session.status === 'LOBBY' && (
          <div className="w-full max-w-4xl text-center flex flex-col items-center animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/80 border border-brand-800 text-brand-300 text-sm font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Live Game Lobby</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              {session.quizTitle}
            </h1>

            <p className="text-slate-400 text-base md:text-lg mb-8 max-w-xl">
              Tell audience members to open the website on their smartphones and type the Game PIN to join!
            </p>

            {/* Giant PIN Card */}
            <div
              onClick={() => setShowQr(true)}
              className="bg-slate-900/90 border-2 border-brand-500/50 hover:border-brand-400 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur mb-10 cursor-pointer transform hover:scale-105 transition duration-300"
            >
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">
                Join with Game PIN
              </span>
              <span className="text-5xl sm:text-7xl font-black text-white font-mono tracking-widest drop-shadow-lg">
                {pin}
              </span>
              <span className="text-xs text-brand-400 mt-2 block font-semibold">
                Click to expand QR Code
              </span>
            </div>

            {/* Joined Participants Grid */}
            <div className="w-full mb-10">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Joined Participants ({session.participants.length})
                </span>
                {session.participants.length === 0 && (
                  <span className="text-xs text-slate-500 animate-pulse">Waiting for players...</span>
                )}
              </div>

              {session.participants.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40 text-slate-500 text-sm font-medium">
                  No players in lobby yet. Open a new browser tab at <span className="text-white font-bold">/join</span> to test!
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3 max-h-56 overflow-y-auto p-4 bg-slate-900/60 rounded-3xl border border-slate-800/80">
                  {session.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow animate-scale-in"
                    >
                      <span className="text-2xl">{p.avatar}</span>
                      <span className="font-bold text-white text-sm">{p.nickname}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={session.participants.length === 0}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg tracking-wide shadow-xl shadow-brand-600/30 transition hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Start Presentation ({session.questions.length} Slides)</span>
            </button>
          </div>
        )}

        {/* ================= 2. ACTIVE QUESTION / CONTENT SLIDE STATE ================= */}
        {session.status === 'QUESTION' && currentQuestion && (
          <div className="w-full max-w-6xl flex flex-col items-center animate-fade-in">
            {/* Slide Index & Timer Header */}
            <div className="w-full flex items-center justify-between mb-6 px-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {currentQuestion.type === 'CONTENT_SLIDE' ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Presentation className="w-4 h-4" /> Presentation Slide {session.currentQuestionIndex + 1} of {session.questions.length}
                  </span>
                ) : (
                  `Question ${session.currentQuestionIndex + 1} of ${session.questions.length}`
                )}
              </span>

              {/* Countdown Circular Ring / Badge (only if timeLimit > 0) */}
              {currentQuestion.timeLimit > 0 && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg font-mono border shadow-lg transition ${
                    timeLeft <= 5
                      ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                      : 'bg-slate-900/80 border-slate-700 text-white'
                  }`}
                >
                  <Clock className="w-5 h-5 text-brand-400" />
                  <span>{timeLeft}s</span>
                </div>
              )}
            </div>

            {/* If CONTENT_SLIDE: Render PowerPoint Presentation Layout */}
            {currentQuestion.type === 'CONTENT_SLIDE' ? (
              <div
                className={`w-full flex flex-col ${
                  currentQuestion.imageUrl ? 'lg:flex-row items-center gap-10' : 'items-center'
                } bg-slate-900/60 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur my-4`}
              >
                {currentQuestion.imageUrl && (
                  <div className="w-full lg:w-1/2 max-h-[460px] rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 flex items-center justify-center">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Presentation Visual"
                      className="w-full h-full object-cover max-h-[460px]"
                    />
                  </div>
                )}
                <div className={`w-full ${currentQuestion.imageUrl ? 'lg:w-1/2' : 'max-w-4xl text-center'}`}>
                  <MathRenderer
                    as="h1"
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight drop-shadow-md"
                    text={currentQuestion.title}
                  />
                  {currentQuestion.content && (
                    <div className="space-y-4 text-left bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
                      {currentQuestion.content
                        .split('\n')
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 text-slate-100 text-lg sm:text-xl leading-relaxed"
                          >
                            <span className="text-amber-400 font-black text-2xl leading-none mt-0.5">•</span>
                            <MathRenderer text={line.replace(/^[•\-\*]\s*/, '')} />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Big Question Prompt */}
                <MathRenderer
                  as="h1"
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center mb-6 max-w-4xl px-4 leading-tight drop-shadow-md"
                  text={currentQuestion.title}
                />

                {/* Optional Question Image */}
                {currentQuestion.imageUrl && (
                  <div className="w-full max-w-md mx-auto mb-6 rounded-2xl overflow-hidden border border-slate-700 shadow-xl max-h-56 flex items-center justify-center bg-slate-950">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question Visual"
                      className="w-full h-full object-cover max-h-56"
                    />
                  </div>
                )}

                {/* Visualization Stage */}
                {currentQuestion.type === 'WORD_CLOUD' ? (
                  <WordCloud
                    responses={currentQuestionResponses}
                    totalParticipants={session.participants.length}
                  />
                ) : (
                  <LiveBarChart
                    options={currentQuestion.options}
                    responses={currentQuestionResponses}
                    showCorrectAnswer={false}
                    totalParticipants={session.participants.length}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ================= 3. REVEAL ANSWER STATE ================= */}
        {session.status === 'REVEAL' && currentQuestion && (
          <div className="w-full max-w-6xl flex flex-col items-center animate-fade-in">
            <div className="w-full flex items-center justify-between mb-6 px-4">
              <span className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Results Revealed
              </span>
              <span className="text-sm font-bold text-slate-400">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </span>
            </div>

            <MathRenderer
              as="h1"
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center mb-8 max-w-4xl px-4 leading-tight"
              text={currentQuestion.title}
            />

            {currentQuestion.type === 'WORD_CLOUD' ? (
              <WordCloud
                responses={currentQuestionResponses}
                totalParticipants={session.participants.length}
              />
            ) : (
              <LiveBarChart
                options={currentQuestion.options}
                responses={currentQuestionResponses}
                showCorrectAnswer={currentQuestion.type === 'MULTIPLE_CHOICE'}
                totalParticipants={session.participants.length}
              />
            )}
          </div>
        )}

        {/* ================= 4. LEADERBOARD STATE ================= */}
        {session.status === 'LEADERBOARD' && (
          <div className="w-full max-w-5xl flex flex-col items-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-sm font-bold uppercase tracking-wider mb-4">
              <Trophy className="w-4 h-4" />
              <span>Current Leaderboard</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-6">
              Score Standings
            </h1>

            <LeaderboardPodium participants={session.participants} isFinal={false} />
          </div>
        )}

        {/* ================= 5. FINISHED STATE ================= */}
        {session.status === 'FINISHED' && (
          <div className="w-full max-w-5xl flex flex-col items-center animate-fade-in text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-950/80 border border-yellow-700 text-yellow-300 text-sm font-bold uppercase tracking-wider mb-4 animate-bounce">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Presentation Complete</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
              🏆 Final Champions!
            </h1>
            <p className="text-slate-400 text-lg mb-8">Congratulations to the top performers!</p>

            <LeaderboardPodium participants={session.participants} isFinal={true} />

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-base transition shadow-xl hover:scale-105"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Host Sticky Control Toolbar at Bottom */}
      {session.status !== 'LOBBY' && session.status !== 'FINISHED' && (
        <footer className="h-20 px-8 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-4 flex-shrink-0 z-20">
          <div className="text-sm font-semibold text-slate-400">
            Slide {session.currentQuestionIndex + 1} / {session.questions.length}
          </div>

          <div className="flex items-center gap-3">
            {session.status === 'QUESTION' && currentQuestion?.type === 'CONTENT_SLIDE' && (
              <button
                onClick={isLastQuestion ? handleEndQuiz : handleNextQuestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition shadow-lg shadow-brand-600/30 hover:scale-105"
              >
                <span>{isLastQuestion ? 'Final Results 🏆' : 'Next Slide'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {session.status === 'QUESTION' && currentQuestion?.type !== 'CONTENT_SLIDE' && (
              <button
                onClick={handleRevealAnswer}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
              >
                Reveal Answer & Results
              </button>
            )}

            {session.status === 'REVEAL' && (
              <button
                onClick={handleShowLeaderboard}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg shadow-amber-600/30"
              >
                <Trophy className="w-4 h-4" />
                <span>Show Leaderboard</span>
              </button>
            )}

            {(session.status === 'LEADERBOARD' || session.status === 'REVEAL') && (
              <button
                onClick={isLastQuestion ? handleEndQuiz : handleNextQuestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition shadow-lg shadow-brand-600/30 hover:scale-105"
              >
                <span>{isLastQuestion ? 'Final Results 🏆' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleEndQuiz}
              className="text-xs font-semibold text-slate-500 hover:text-red-400 px-3 py-2 transition"
            >
              End Quiz
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
