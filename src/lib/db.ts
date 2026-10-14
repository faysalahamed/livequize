import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

let cachedStatus: { connected: boolean; error?: string } | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 15000; // Cache connection status for 15 seconds

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  const now = Date.now();
  if (cachedStatus && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedStatus;
  }

  try {
    // 1.5s timeout race so it never blocks HTTP request pipelines
    const queryPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise<{ timeout: true }>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out')), 1500)
    );

    await Promise.race([queryPromise, timeoutPromise]);
    cachedStatus = { connected: true };
    lastCheckTime = now;
    return cachedStatus;
  } catch (err: any) {
    cachedStatus = { connected: false, error: err.message || 'Cannot reach PostgreSQL' };
    lastCheckTime = now;
    return cachedStatus;
  }
}
