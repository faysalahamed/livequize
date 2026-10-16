import { prisma, checkDatabaseConnection } from './db';
import { SAMPLE_QUIZZES } from './seed-data';
import { QuizData, SessionState, ParticipantData, ResponseData, SessionStatus } from './types';

// In-memory fallback repository for instant development/preview when PostgreSQL is booting or offline
class MemoryStore {
  quizzes: Map<string, QuizData> = new Map();
  sessions: Map<string, SessionState> = new Map(); // key is PIN

  constructor() {
    for (const quiz of SAMPLE_QUIZZES) {
      this.quizzes.set(quiz.id, JSON.parse(JSON.stringify(quiz)));
    }
  }

  generatePin(): string {
    let pin: string;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.sessions.has(pin));
    return pin;
  }
}

const memoryStore = (globalThis as any)._mentiMemoryStore || new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any)._mentiMemoryStore = memoryStore;
}

export async function getAllQuizzes(): Promise<QuizData[]> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const dbQuizzes = await prisma.quiz.findMany({
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbQuizzes.length > 0) {
        return dbQuizzes.map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          theme: q.theme,
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
          questions: q.questions.map((quest) => ({
            id: quest.id,
            title: quest.title,
            type: quest.type as any,
            timeLimit: quest.timeLimit,
            points: quest.points,
            order: quest.order,
            imageUrl: quest.imageUrl || undefined,
            content: quest.content || undefined,
            options: quest.options.map((opt) => ({
              id: opt.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
              color: opt.color || undefined,
              order: opt.order,
            })),
          })),
        }));
      }
    }
  } catch (error) {
    console.warn('[QuizService] Using in-memory fallback store:', error);
  }

  return Array.from(memoryStore.quizzes.values());
}

export async function getQuizById(id: string): Promise<QuizData | null> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const q = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
      if (q) {
        return {
          id: q.id,
          title: q.title,
          description: q.description,
          theme: q.theme,
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
          questions: q.questions.map((quest) => ({
            id: quest.id,
            title: quest.title,
            type: quest.type as any,
            timeLimit: quest.timeLimit,
            points: quest.points,
            order: quest.order,
            imageUrl: quest.imageUrl || undefined,
            content: quest.content || undefined,
            options: quest.options.map((opt) => ({
              id: opt.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
              color: opt.color || undefined,
              order: opt.order,
            })),
          })),
        };
      }
    }
  } catch (error) {
    console.warn('[QuizService] Falling back to memory for getQuizById');
  }

  return memoryStore.quizzes.get(id) || null;
}

export async function saveQuiz(quizData: QuizData): Promise<QuizData> {
  const quizId = quizData.id || `quiz-${Date.now()}`;
  const quizToSave: QuizData = {
    ...quizData,
    id: quizId,
    updatedAt: new Date().toISOString(),
    createdAt: quizData.createdAt || new Date().toISOString(),
  };

  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      // Upsert in PostgreSQL
      const existing = await prisma.quiz.findUnique({ where: { id: quizId } });
      if (existing) {
        await prisma.quiz.delete({ where: { id: quizId } });
      }

      await prisma.quiz.create({
        data: {
          id: quizId,
          title: quizToSave.title,
          description: quizToSave.description,
          theme: quizToSave.theme,
          questions: {
            create: quizToSave.questions.map((quest, qIdx) => ({
              id: quest.id?.startsWith('temp') ? undefined : quest.id,
              title: quest.title,
              type: quest.type,
              timeLimit: quest.timeLimit,
              points: quest.points,
              imageUrl: quest.imageUrl || null,
              content: quest.content || null,
              order: qIdx,
              options: {
                create: quest.options.map((opt, oIdx) => ({
                  id: opt.id?.startsWith('temp') ? undefined : opt.id,
                  text: opt.text,
                  isCorrect: opt.isCorrect || false,
                  color: opt.color,
                  order: oIdx,
                })),
              },
            })),
          },
        },
      });
    }
  } catch (error) {
    console.warn('[QuizService] Persisted to memory store:', error);
  }

  memoryStore.quizzes.set(quizId, quizToSave);
  return quizToSave;
}

export async function deleteQuiz(id: string): Promise<boolean> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      await prisma.quiz.delete({ where: { id } });
    }
  } catch (error) {
    console.warn('[QuizService] Delete failed on DB, checking memory store');
  }
  return memoryStore.quizzes.delete(id);
}

// ============ GAME SESSIONS ============

export async function createGameSession(quizId: string): Promise<SessionState> {
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const pin = memoryStore.generatePin();
  const session: SessionState = {
    id: `session-${Date.now()}`,
    pin,
    quizId: quiz.id,
    quizTitle: quiz.title,
    status: 'LOBBY',
    currentQuestionIndex: 0,
    questionStartedAt: null,
    participants: [],
    responses: [],
    questions: quiz.questions,
  };

  memoryStore.sessions.set(pin, session);
  return session;
}

export function getSessionByPin(pin: string): SessionState | null {
  return memoryStore.sessions.get(pin) || null;
}

export function addParticipantToSession(
  pin: string,
  nickname: string,
  avatar: string,
  socketId?: string
): { session: SessionState; participant: ParticipantData } | null {
  const session = memoryStore.sessions.get(pin);
  if (!session) return null;

  // Check if nickname already exists, append random digit if so
  let finalNickname = nickname.trim();
  const existingNames = new Set(session.participants.map((p) => p.nickname.toLowerCase()));
  if (existingNames.has(finalNickname.toLowerCase())) {
    finalNickname = `${finalNickname} ${Math.floor(Math.random() * 99) + 1}`;
  }

  const participant: ParticipantData = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nickname: finalNickname,
    avatar: avatar || '🚀',
    score: 0,
    streak: 0,
    socketId,
    joinedAt: new Date().toISOString(),
  };

  session.participants.push(participant);
  return { session, participant };
}

export function removeParticipantBySocketId(socketId: string): { session: SessionState; participant: ParticipantData } | null {
  for (const session of memoryStore.sessions.values()) {
    const index = session.participants.findIndex((p) => p.socketId === socketId);
    if (index !== -1) {
      const [participant] = session.participants.splice(index, 1);
      return { session, participant };
    }
  }
  return null;
}

export function updateSessionStatus(pin: string, status: SessionStatus): SessionState | null {
  const session = memoryStore.sessions.get(pin);
  if (!session) return null;

  session.status = status;
  if (status === 'QUESTION') {
    session.questionStartedAt = Date.now();
  }
  return session;
}

export function nextQuestion(pin: string): SessionState | null {
  const session = memoryStore.sessions.get(pin);
  if (!session) return null;

  if (session.currentQuestionIndex < session.questions.length - 1) {
    session.currentQuestionIndex += 1;
    session.status = 'QUESTION';
    session.questionStartedAt = Date.now();
  } else {
    session.status = 'FINISHED';
  }
  return session;
}

export function submitParticipantResponse(
  pin: string,
  participantId: string,
  questionId: string,
  data: { optionId?: string; textAnswer?: string }
): { session: SessionState; response: ResponseData; isCorrect: boolean; pointsAwarded: number } | null {
  const session = memoryStore.sessions.get(pin);
  if (!session) return null;

  const question = session.questions.find((q) => q.id === questionId);
  if (!question) return null;

  const participant = session.participants.find((p) => p.id === participantId);
  if (!participant) return null;

  // Prevent multiple answers for same question
  const existingResponse = session.responses.find(
    (r) => r.questionId === questionId && r.participantId === participantId
  );
  if (existingResponse) {
    return null;
  }

  const timeElapsedMs = session.questionStartedAt ? Date.now() - session.questionStartedAt : 0;
  const timeTakenSeconds = Math.max(0.5, Math.min(question.timeLimit, timeElapsedMs / 1000));

  let isCorrect = false;
  let pointsAwarded = 0;

  if (question.type === 'MULTIPLE_CHOICE') {
    const selectedOption = question.options.find((o) => o.id === data.optionId);
    if (selectedOption?.isCorrect) {
      isCorrect = true;
      // Mentimeter / Kahoot speed calculation formula:
      // Points = BasePoints * (1 - (timeTaken / totalTime) / 2)
      // Faster answers get up to 100% points, minimum 50% for correct answers.
      const speedRatio = Math.max(0, 1 - (timeTakenSeconds / question.timeLimit) * 0.5);
      pointsAwarded = Math.round(question.points * speedRatio);
      participant.streak += 1;
      participant.score += pointsAwarded;
    } else {
      participant.streak = 0;
    }
  } else if (question.type === 'POLL' || question.type === 'WORD_CLOUD' || question.type === 'RATING') {
    isCorrect = true;
    pointsAwarded = question.points || 0;
    participant.score += pointsAwarded;
  }

  const response: ResponseData = {
    id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId: session.id,
    questionId,
    participantId,
    optionId: data.optionId || null,
    textAnswer: data.textAnswer?.trim() || null,
    isCorrect,
    scoreAwarded: pointsAwarded,
    timeTakenSeconds,
    createdAt: new Date().toISOString(),
  };

  session.responses.push(response);

  return { session, response, isCorrect, pointsAwarded };
}
