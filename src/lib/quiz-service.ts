import { prisma, checkDatabaseConnection } from './db';
import { SAMPLE_QUIZZES } from './seed-data';
import { QuizData, SessionState, ParticipantData, ResponseData, SessionStatus, UserData, StudentQuizHistoryItem } from './types';
import bcrypt from 'bcryptjs';

// Default mock users for zero-setup demo
export const DEFAULT_USERS: Array<UserData & { passwordHash: string }> = [
  {
    id: 'user-admin-1',
    name: 'Syed Rahman (Admin)',
    email: 'admin@magicquize.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    avatar: '👨‍💼',
    department: 'Administration',
    phone: '+880 1711-000111',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-teacher-1',
    name: 'Dr. Fatima Noor',
    email: 'teacher@magicquize.com',
    passwordHash: bcrypt.hashSync('teacher123', 10),
    role: 'TEACHER',
    avatar: '👩‍🏫',
    department: 'Computer Science & Math',
    phone: '+880 1722-111222',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-student-1',
    name: 'Rahim Al-Hasan',
    email: 'student@magicquize.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'STUDENT',
    avatar: '👨‍🎓',
    rollNumber: 'CS-2026-042',
    className: 'Class 10 / Semester 2',
    department: 'Science & Computing',
    phone: '+880 1733-222333',
    createdAt: new Date().toISOString(),
  },
];

// In-memory fallback repository for instant development/preview when PostgreSQL is booting or offline
class MemoryStore {
  quizzes: Map<string, QuizData> = new Map();
  sessions: Map<string, SessionState> = new Map(); // key is PIN
  users: Map<string, UserData & { passwordHash: string }> = new Map();
  studentHistory: StudentQuizHistoryItem[] = [];

  constructor() {
    for (const quiz of SAMPLE_QUIZZES) {
      this.quizzes.set(quiz.id, JSON.parse(JSON.stringify(quiz)));
    }
    for (const user of DEFAULT_USERS) {
      this.users.set(user.email.toLowerCase(), JSON.parse(JSON.stringify(user)));
    }
    // Seed some initial quiz participation history for student demo
    this.studentHistory.push(
      {
        sessionId: 'session-demo-1',
        quizId: 'quiz-tech-trivia',
        quizTitle: '🚀 Tech & Web Dev Live Challenge',
        participantId: 'p-demo-student',
        score: 3850,
        rank: 1,
        totalParticipants: 18,
        totalQuestions: 5,
        correctAnswers: 4,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        sessionId: 'session-demo-2',
        quizId: 'quiz-math-challenge',
        quizTitle: '📐 Mathematics & Science Live Challenge',
        participantId: 'p-demo-student',
        score: 2900,
        rank: 3,
        totalParticipants: 24,
        totalQuestions: 4,
        correctAnswers: 3,
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    );
  }

  generatePin(): string {
    let pin: string;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.sessions.has(pin));
    return pin;
  }
}

const memoryStore: MemoryStore = (globalThis as any)._mentiMemoryStore || new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any)._mentiMemoryStore = memoryStore;
}

// ============ USER & AUTHENTICATION ============

export async function findUserByEmail(email: string): Promise<(UserData & { passwordHash: string }) | null> {
  const normalized = email.trim().toLowerCase();
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const dbUser = await prisma.user.findUnique({
        where: { email: normalized },
      });
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as any,
          avatar: dbUser.avatar,
          rollNumber: dbUser.rollNumber,
          className: dbUser.className,
          department: dbUser.department,
          phone: dbUser.phone,
          passwordHash: dbUser.password,
          createdAt: dbUser.createdAt.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('[QuizService] User query falling back to memoryStore:', err);
  }
  return memoryStore.users.get(normalized) || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar?: string;
  rollNumber?: string;
  className?: string;
  department?: string;
  phone?: string;
}): Promise<UserData> {
  const normalized = data.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(data.password, 10);
  const avatar = data.avatar || (data.role === 'STUDENT' ? '👨‍🎓' : data.role === 'TEACHER' ? '👩‍🏫' : '👨‍💼');

  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const dbUser = await prisma.user.create({
        data: {
          name: data.name,
          email: normalized,
          password: passwordHash,
          role: data.role,
          avatar,
          rollNumber: data.rollNumber,
          className: data.className,
          department: data.department,
          phone: data.phone,
        },
      });
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as any,
        avatar: dbUser.avatar,
        rollNumber: dbUser.rollNumber,
        className: dbUser.className,
        department: dbUser.department,
        phone: dbUser.phone,
        createdAt: dbUser.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('[QuizService] Creating user in memoryStore:', err);
  }

  const newUser: UserData & { passwordHash: string } = {
    id: `user-${Date.now()}`,
    name: data.name,
    email: normalized,
    passwordHash,
    role: data.role,
    avatar,
    rollNumber: data.rollNumber,
    className: data.className,
    department: data.department,
    phone: data.phone,
    createdAt: new Date().toISOString(),
  };
  memoryStore.users.set(normalized, newUser);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as any,
          avatar: u.avatar,
          rollNumber: u.rollNumber,
          className: u.className,
          department: u.department,
          phone: u.phone,
          createdAt: u.createdAt.toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn('[QuizService] Getting users from memoryStore:', err);
  }

  return Array.from(memoryStore.users.values()).map(({ passwordHash: _, ...user }) => user);
}

// ============ STUDENT QUIZ HISTORY ============

export async function getStudentQuizHistory(userId: string): Promise<StudentQuizHistoryItem[]> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const participations = await prisma.participant.findMany({
        where: { userId },
        include: {
          session: {
            include: {
              quiz: true,
              participants: {
                orderBy: { score: 'desc' },
              },
              responses: {
                where: { participant: { userId } },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });

      if (participations.length > 0) {
        return participations.map((p) => {
          const sorted = [...p.session.participants].sort((a, b) => b.score - a.score);
          const rank = sorted.findIndex((part) => part.id === p.id) + 1;
          const correct = p.session.responses.filter((r) => r.isCorrect).length;
          return {
            sessionId: p.session.id,
            quizId: p.session.quizId,
            quizTitle: p.session.quiz.title,
            participantId: p.id,
            score: p.score,
            rank: rank > 0 ? rank : 1,
            totalParticipants: p.session.participants.length,
            totalQuestions: p.session.responses.length,
            correctAnswers: correct,
            date: p.joinedAt.toISOString(),
          };
        });
      }
    }
  } catch (err) {
    console.warn('[QuizService] Student history from memoryStore fallback:', err);
  }

  return memoryStore.studentHistory;
}

export function recordStudentQuizCompletion(item: StudentQuizHistoryItem) {
  memoryStore.studentHistory.unshift(item);
}

// ============ QUIZZES ============

export async function getAllQuizzes(): Promise<QuizData[]> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      const dbQuizzes = await prisma.quiz.findMany({
        include: {
          creator: true,
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
          creatorId: q.creatorId,
          creatorName: q.creator?.name || 'Faculty Member',
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
          creator: true,
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
          creatorId: q.creatorId,
          creatorName: q.creator?.name,
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
    console.warn('[QuizService] Using in-memory fallback for quiz id:', id);
  }

  return memoryStore.quizzes.get(id) || null;
}

export async function saveQuiz(quizData: Partial<QuizData> & { id?: string; title: string }): Promise<QuizData> {
  const isNew = !quizData.id || quizData.id.startsWith('new') || !memoryStore.quizzes.has(quizData.id);
  const quizId = isNew ? `quiz-${Date.now()}` : quizData.id!;

  const formattedQuestions = (quizData.questions || []).map((q, idx) => ({
    id: q.id || `q-${idx}-${Date.now()}`,
    title: q.title,
    type: q.type,
    timeLimit: q.timeLimit ?? 20,
    points: q.points ?? 1000,
    order: idx,
    imageUrl: q.imageUrl || undefined,
    content: q.content || undefined,
    options: (q.options || []).map((opt, oIdx) => ({
      id: opt.id || `opt-${idx}-${oIdx}-${Date.now()}`,
      text: opt.text,
      isCorrect: Boolean(opt.isCorrect),
      color: opt.color || '#3B82F6',
      order: oIdx,
    })),
  }));

  const fullQuiz: QuizData = {
    id: quizId,
    title: quizData.title,
    description: quizData.description || null,
    theme: quizData.theme || 'default',
    creatorId: quizData.creatorId || 'user-teacher-1',
    creatorName: quizData.creatorName || 'Dr. Fatima Noor',
    createdAt: quizData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: formattedQuestions,
  };

  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      if (!isNew) {
        await prisma.question.deleteMany({ where: { quizId } });
        await prisma.quiz.update({
          where: { id: quizId },
          data: {
            title: fullQuiz.title,
            description: fullQuiz.description,
            theme: fullQuiz.theme,
            questions: {
              create: formattedQuestions.map((q) => ({
                title: q.title,
                type: q.type,
                timeLimit: q.timeLimit,
                points: q.points,
                order: q.order,
                imageUrl: q.imageUrl,
                content: q.content,
                options: {
                  create: q.options.map((opt) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    color: opt.color,
                    order: opt.order,
                  })),
                },
              })),
            },
          },
        });
      } else {
        await prisma.quiz.create({
          data: {
            id: quizId,
            title: fullQuiz.title,
            description: fullQuiz.description,
            theme: fullQuiz.theme,
            creatorId: fullQuiz.creatorId,
            questions: {
              create: formattedQuestions.map((q) => ({
                title: q.title,
                type: q.type,
                timeLimit: q.timeLimit,
                points: q.points,
                order: q.order,
                imageUrl: q.imageUrl,
                content: q.content,
                options: {
                  create: q.options.map((opt) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    color: opt.color,
                    order: opt.order,
                  })),
                },
              })),
            },
          },
        });
      }
    }
  } catch (error) {
    console.warn('[QuizService] Database save failed, saving to memoryStore:', error);
  }

  memoryStore.quizzes.set(quizId, fullQuiz);
  return fullQuiz;
}

export async function deleteQuiz(id: string): Promise<boolean> {
  try {
    const { connected } = await checkDatabaseConnection();
    if (connected) {
      await prisma.quiz.delete({ where: { id } });
    }
  } catch (error) {
    console.warn('[QuizService] Database delete failed:', error);
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
  socketId?: string,
  userId?: string | null
): { session: SessionState; participant: ParticipantData } | null {
  const session = memoryStore.sessions.get(pin);
  if (!session) return null;

  let finalNickname = nickname.trim();
  const existingNames = new Set(session.participants.map((p) => p.nickname.toLowerCase()));
  if (existingNames.has(finalNickname.toLowerCase())) {
    finalNickname = `${finalNickname} ${Math.floor(Math.random() * 99) + 1}`;
  }

  const participant: ParticipantData = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: userId || null,
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
  for (const session of Array.from(memoryStore.sessions.values())) {
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
    session.questionStartedAt = new Date().toISOString();
  } else if (status === 'FINISHED') {
    // Save completion record for registered student participants
    const sortedParticipants = [...session.participants].sort((a, b) => b.score - a.score);
    sortedParticipants.forEach((p, idx) => {
      if (p.userId) {
        const correctCount = session.responses.filter((r) => r.participantId === p.id && r.isCorrect).length;
        recordStudentQuizCompletion({
          sessionId: session.id,
          quizId: session.quizId,
          quizTitle: session.quizTitle,
          participantId: p.id,
          score: p.score,
          rank: idx + 1,
          totalParticipants: sortedParticipants.length,
          totalQuestions: session.questions.length,
          correctAnswers: correctCount,
          date: new Date().toISOString(),
        });
      }
    });
  }
  return session;
}

export function nextQuestion(pin: string): SessionState | null {
  const session = memoryStore.sessions.get(pin);
  if (!session) return null;

  if (session.currentQuestionIndex < session.questions.length - 1) {
    session.currentQuestionIndex += 1;
    session.status = 'QUESTION';
    session.questionStartedAt = new Date().toISOString();
  } else {
    updateSessionStatus(pin, 'FINISHED');
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

  const existingResponse = session.responses.find(
    (r) => r.questionId === questionId && r.participantId === participantId
  );
  if (existingResponse) {
    return null;
  }

  const startTime = session.questionStartedAt ? new Date(session.questionStartedAt).getTime() : Date.now();
  const timeElapsedMs = Math.max(0, Date.now() - startTime);
  const timeTakenSeconds = Math.max(0.5, Math.min(question.timeLimit, timeElapsedMs / 1000));

  let isCorrect = false;
  let pointsAwarded = 0;

  if (question.type === 'MULTIPLE_CHOICE') {
    const selectedOption = question.options.find((o) => o.id === data.optionId);
    if (selectedOption?.isCorrect) {
      isCorrect = true;
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
