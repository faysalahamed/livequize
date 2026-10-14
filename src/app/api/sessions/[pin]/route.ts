import { NextResponse } from 'next/server';
import { getSessionByPin } from '@/lib/quiz-service';

export async function GET(req: Request, { params }: { params: { pin: string } }) {
  try {
    const session = getSessionByPin(params.pin);
    if (!session) {
      return NextResponse.json({ error: 'Session not found or inactive' }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
