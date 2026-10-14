const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SAMPLE_QUIZZES = [
  {
    title: '🚀 Tech & Web Dev Live Challenge',
    description: 'Test your knowledge on JavaScript, React, Web Architecture and Computing history!',
    theme: 'vibrant',
    questions: [
      {
        title: 'Which language runs natively in modern web browsers alongside JavaScript?',
        type: 'MULTIPLE_CHOICE',
        timeLimit: 20,
        points: 1000,
        order: 0,
        options: [
          { text: 'Python', isCorrect: false, color: '#EF4444', order: 0 },
          { text: 'WebAssembly (Wasm)', isCorrect: true, color: '#3B82F6', order: 1 },
          { text: 'Ruby', isCorrect: false, color: '#EAB308', order: 2 },
          { text: 'Java', isCorrect: false, color: '#10B981', order: 3 },
        ],
      },
      {
        title: 'Live Poll: What is your preferred frontend framework or library in 2026?',
        type: 'POLL',
        timeLimit: 25,
        points: 0,
        order: 1,
        options: [
          { text: 'Next.js / React', isCorrect: false, color: '#3B82F6', order: 0 },
          { text: 'Svelte / SvelteKit', isCorrect: false, color: '#EF4444', order: 1 },
          { text: 'Vue / Nuxt', isCorrect: false, color: '#10B981', order: 2 },
          { text: 'Astro / Solid', isCorrect: false, color: '#8B5CF6', order: 3 },
        ],
      },
      {
        title: 'Word Cloud: In one word, what makes great developer experience (DX)?',
        type: 'WORD_CLOUD',
        timeLimit: 30,
        points: 0,
        order: 2,
        options: [],
      },
      {
        title: 'What HTTP status code represents "Teapot" in RFC 2324?',
        type: 'MULTIPLE_CHOICE',
        timeLimit: 15,
        points: 1000,
        order: 3,
        options: [
          { text: '404', isCorrect: false, color: '#EF4444', order: 0 },
          { text: '500', isCorrect: false, color: '#3B82F6', order: 1 },
          { text: '418', isCorrect: true, color: '#10B981', order: 2 },
          { text: '403', isCorrect: false, color: '#EAB308', order: 3 },
        ],
      },
      {
        title: 'What does "ACID" stand for in relational database management (like PostgreSQL)?',
        type: 'MULTIPLE_CHOICE',
        timeLimit: 25,
        points: 1000,
        order: 4,
        options: [
          { text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true, color: '#10B981', order: 0 },
          { text: 'Asynchronous, Clustered, Indexed, Distributed', isCorrect: false, color: '#EF4444', order: 1 },
          { text: 'Access, Control, Identity, Data', isCorrect: false, color: '#3B82F6', order: 2 },
          { text: 'Authentication, Cryptography, Integrity, Decryption', isCorrect: false, color: '#EAB308', order: 3 },
        ],
      },
    ],
  },
  {
    title: '📊 Team Pulse & Interactive All-Hands',
    description: 'Engage audience members with interactive polls, word clouds, and instant feedback.',
    theme: 'ocean',
    questions: [
      {
        title: 'How is your energy level heading into today’s presentation?',
        type: 'POLL',
        timeLimit: 20,
        points: 0,
        order: 0,
        options: [
          { text: '⚡ Super Charged & Ready', isCorrect: false, color: '#10B981', order: 0 },
          { text: '☕ Need one more coffee', isCorrect: false, color: '#EAB308', order: 1 },
          { text: '🧘 Calm & Focused', isCorrect: false, color: '#3B82F6', order: 2 },
          { text: '😴 Half-asleep but listening', isCorrect: false, color: '#EF4444', order: 3 },
        ],
      },
      {
        title: 'Word Cloud: What is one goal or ambition you want to accomplish this month?',
        type: 'WORD_CLOUD',
        timeLimit: 30,
        points: 0,
        order: 1,
        options: [],
      },
    ],
  },
];

async function main() {
  console.log('Seeding PostgreSQL database...');
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
    console.log(`Created Quiz: ${quiz.title} (${quiz.id})`);
  }
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
