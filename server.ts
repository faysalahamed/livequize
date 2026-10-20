import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import * as quizService from './src/lib/quiz-service';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod') || process.argv.includes('--production');
const dev = !isProd;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server Unhandled Rejection]', reason);
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Make IO accessible globally
  (globalThis as any).io = io;

  io.on('connection', (socket) => {
    let currentPin: string | null = null;
    let participantId: string | null = null;

    // Join room
    socket.on('join_room', ({ pin, role, nickname, avatar, participantId: existingParticipantId }) => {
      currentPin = pin;
      socket.join(`room:${pin}`);

      let session = quizService.getSessionByPin(pin);

      if (!session) {
        socket.emit('error_message', { message: 'Session not found or expired. Please check your PIN.' });
        return;
      }

      if (role === 'player') {
        let participant = null;
        if (existingParticipantId) {
          participant = session.participants.find((p) => p.id === existingParticipantId);
          if (participant) {
            participant.socketId = socket.id;
            participantId = participant.id;
          }
        }

        if (!participant && nickname) {
          const result = quizService.addParticipantToSession(pin, nickname, avatar || '🚀', socket.id);
          if (result) {
            session = result.session;
            participant = result.participant;
            participantId = participant.id;
          }
        }

        if (participant) {
          socket.emit('joined_successfully', {
            participant,
            session,
          });

          // Broadcast to everyone in the room (host and players)
          io.to(`room:${pin}`).emit('participant_joined', {
            participant,
            participants: session.participants,
          });
        }
      } else {
        // Host joining
        socket.emit('session_synced', { session });
      }
    });

    // Host: Start quiz
    socket.on('start_quiz', ({ pin }) => {
      const session = quizService.updateSessionStatus(pin, 'QUESTION');
      if (session) {
        io.to(`room:${pin}`).emit('quiz_started', {
          session,
          currentQuestion: session.questions[session.currentQuestionIndex],
          startedAt: session.questionStartedAt,
        });
      }
    });

    // Host: Next question
    socket.on('next_question', ({ pin }) => {
      const session = quizService.nextQuestion(pin);
      if (session) {
        if (session.status === 'FINISHED') {
          const ranked = [...session.participants].sort((a, b) => b.score - a.score);
          io.to(`room:${pin}`).emit('quiz_finished', {
            session,
            podium: ranked.slice(0, 3),
            leaderboard: ranked,
          });
        } else {
          io.to(`room:${pin}`).emit('question_changed', {
            session,
            currentQuestion: session.questions[session.currentQuestionIndex],
            startedAt: session.questionStartedAt,
          });
        }
      }
    });

    // Host: Reveal answers / poll results
    socket.on('reveal_answer', ({ pin }) => {
      const session = quizService.updateSessionStatus(pin, 'REVEAL');
      if (session) {
        const question = session.questions[session.currentQuestionIndex];
        const currentResponses = session.responses.filter((r) => r.questionId === question.id);

        io.to(`room:${pin}`).emit('answer_revealed', {
          session,
          question,
          responses: currentResponses,
        });
      }
    });

    // Host: Show leaderboard
    socket.on('show_leaderboard', ({ pin }) => {
      const session = quizService.updateSessionStatus(pin, 'LEADERBOARD');
      if (session) {
        const ranked = [...session.participants].sort((a, b) => b.score - a.score);
        io.to(`room:${pin}`).emit('leaderboard_updated', {
          session,
          leaderboard: ranked,
        });
      }
    });

    // Host: End quiz immediately
    socket.on('end_quiz', ({ pin }) => {
      const session = quizService.updateSessionStatus(pin, 'FINISHED');
      if (session) {
        const ranked = [...session.participants].sort((a, b) => b.score - a.score);
        io.to(`room:${pin}`).emit('quiz_finished', {
          session,
          podium: ranked.slice(0, 3),
          leaderboard: ranked,
        });
      }
    });

    // Player: Submit answer
    socket.on('submit_answer', ({ pin, participantId: pId, questionId, optionId, textAnswer }) => {
      const result = quizService.submitParticipantResponse(pin, pId, questionId, {
        optionId,
        textAnswer,
      });

      if (result) {
        const { session, response, isCorrect, pointsAwarded } = result;

        // Notify specific participant
        socket.emit('answer_confirmed', {
          response,
          isCorrect,
          pointsAwarded,
          totalScore: session.participants.find((p) => p.id === pId)?.score || 0,
        });

        // Broadcast updated response tallies to host
        const currentResponses = session.responses.filter((r) => r.questionId === questionId);
        io.to(`room:${pin}`).emit('live_response_received', {
          totalResponses: currentResponses.length,
          totalParticipants: session.participants.length,
          responses: currentResponses,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentPin && participantId) {
        const session = quizService.getSessionByPin(currentPin);
        if (session && session.status === 'LOBBY') {
          const result = quizService.removeParticipantBySocketId(socket.id);
          if (result) {
            io.to(`room:${currentPin}`).emit('participant_left', {
              participant: result.participant,
              participants: result.session.participants,
            });
          }
        }
      }
    });
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [PORT CONFLICT] Port ${port} is already in use by another running server!`);
      console.error(`💡 Fix: Close your other terminal or run: Stop-Process -Name node -Force\n`);
      process.exit(1);
    }
    console.error('[Server Error]', err);
  });

  server.listen(port, () => {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'MagicQuize';
    console.log(`\n======================================================`);
    console.log(`🚀 ${appName} Live Server is RUNNING!`);
    console.log(`📍 Web URL: http://localhost:${port}`);
    console.log(`📱 Join Page: http://localhost:${port}/join`);
    console.log(`🎯 Host Dashboard: http://localhost:${port}/dashboard`);
    console.log(`======================================================\n`);
  });
});
