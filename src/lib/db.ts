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
const SUCCESS_CACHE_TTL_MS = 30000; // 30 seconds if connected
const FAILED_CACHE_TTL_MS = 60000;  // 60 seconds if failed to prevent recurring delays

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  // Instant bypass if user explicitly configured in-memory mode
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    return { connected: false, error: 'In-memory mode enabled via USE_IN_MEMORY_DB' };
  }

  const now = Date.now();
  const ttl = cachedStatus?.connected ? SUCCESS_CACHE_TTL_MS : FAILED_CACHE_TTL_MS;
  if (cachedStatus && now - lastCheckTime < ttl) {
    return cachedStatus;
  }

  try {
    // 700ms fast timeout so requests and startup are near-instantaneous
    const queryPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise<{ timeout: true }>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out')), 700)
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
