import { NextResponse } from 'next/server';
import { prisma, checkDatabaseConnection } from '@/lib/db';
import { SAMPLE_QUIZZES } from '@/lib/seed-data';

export async function POST() {
  try {
    const { connected } = await checkDatabaseConnection();
    if (!connected) {
      return NextResponse.json({
        message: 'PostgreSQL is not connected. Loaded sample quizzes into active memory.',
        quizzes: SAMPLE_QUIZZES,
      });
    }

    const created = [];
    for (const q of SAMPLE_QUIZZES) {
      const quiz = await prisma.quiz.create({
        data: {
          title: q.title,
          description: q.description,
          theme: q.theme,
          questions: {
            create: q.questions.map((question) => ({
              title: question.title,
              type: question.type,
              timeLimit: question.timeLimit,
              points: question.points,
              order: question.order,
              options: {
                create: question.options.map((opt) => ({
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
      created.push(quiz);
    }

    return NextResponse.json({
      message: 'Successfully seeded sample quizzes into PostgreSQL!',
      quizzes: created,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
