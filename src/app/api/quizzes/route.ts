import { NextResponse } from 'next/server';
import { getAllQuizzes, saveQuiz } from '@/lib/quiz-service';

export async function GET() {
  try {
    const quizzes = await getAllQuizzes();
    return NextResponse.json({ quizzes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Quiz title is required' }, { status: 400 });
    }

    const saved = await saveQuiz(body);
    return NextResponse.json({ quiz: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save quiz' }, { status: 500 });
  }
}
