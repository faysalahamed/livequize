export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  rollNumber?: string | null;
  className?: string | null;
  department?: string | null;
  phone?: string | null;
  createdAt?: string | Date;
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'POLL' | 'WORD_CLOUD' | 'RATING' | 'CONTENT_SLIDE';

export interface OptionData {
  id: string;
  text: string;
  isCorrect?: boolean;
  color?: string;
  order: number;
}

export interface QuestionData {
  id: string;
  title: string;
  type: QuestionType;
  timeLimit: number;
  points: number;
  order: number;
  imageUrl?: string | null;
  content?: string | null;
  options: OptionData[];
}

export interface QuizData {
  id: string;
  title: string;
  description?: string | null;
  theme: string;
  creatorId?: string | null;
  creatorName?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  questions: QuestionData[];
}

export type SessionStatus = 'LOBBY' | 'QUESTION' | 'REVEAL' | 'LEADERBOARD' | 'FINISHED';

export interface ParticipantData {
  id: string;
  userId?: string | null;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  socketId?: string;
  joinedAt?: string | Date;
}

export interface ResponseData {
  id: string;
  sessionId: string;
  questionId: string;
  participantId: string;
  optionId?: string | null;
  textAnswer?: string | null;
  isCorrect: boolean;
  scoreAwarded: number;
  timeTakenSeconds: number;
  createdAt?: string | Date;
}

export interface SessionState {
  id: string;
  pin: string;
  quizId: string;
  quizTitle: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  questionStartedAt?: string | Date | null;
  participants: ParticipantData[];
  questions: QuestionData[];
  responses: ResponseData[];
  createdAt?: string | Date;
}

export interface StudentQuizHistoryItem {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  participantId: string;
  score: number;
  rank: number;
  totalParticipants: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string | Date;
}
