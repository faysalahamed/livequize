import { NextResponse } from 'next/server';
import { getQuizById, saveQuiz, deleteQuiz } from '@/lib/quiz-service';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const quiz = await getQuizById(params.id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({ quiz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await saveQuiz({ ...body, id: params.id });
    return NextResponse.json({ quiz: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const success = await deleteQuiz(params.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
