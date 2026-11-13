import { NextResponse } from 'next/server';
import { getStudentQuizHistory } from '@/lib/quiz-service';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie') || '';
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      if (match) token = match[1];
    }

    let userId = 'user-student-1'; // Default demo student
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const history = await getStudentQuizHistory(userId);
    return NextResponse.json({ history });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch student history' }, { status: 500 });
  }
}
