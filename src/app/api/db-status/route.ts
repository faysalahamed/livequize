import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkDatabaseConnection();
  return NextResponse.json({
    ...status,
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  });
}
