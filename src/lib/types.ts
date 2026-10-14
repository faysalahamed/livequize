export type QuestionType = 'MULTIPLE_CHOICE' | 'POLL' | 'WORD_CLOUD' | 'RATING';

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
  options: OptionData[];
}

export interface QuizData {
  id: string;
  title: string;
  description?: string | null;
  theme: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  questions: QuestionData[];
}

export type SessionStatus = 'LOBBY' | 'QUESTION' | 'REVEAL' | 'LEADERBOARD' | 'FINISHED';

export interface ParticipantData {
  id: string;
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
  questionStartedAt: number | null;
  participants: ParticipantData[];
  responses: ResponseData[];
  questions: QuestionData[];
}
