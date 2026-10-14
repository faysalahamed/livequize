import { NextResponse } from 'next/server';
import { createGameSession } from '@/lib/quiz-service';

export async function POST(req: Request) {
  try {
    const { quizId } = await req.json();
    if (!quizId) {
      return NextResponse.json({ error: 'quizId is required' }, { status: 400 });
    }

    const session = await createGameSession(quizId);
    return NextResponse.json({ pin: session.pin, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create session' }, { status: 500 });
  }
}
