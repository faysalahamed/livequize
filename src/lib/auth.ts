import jwt from 'jsonwebtoken';
import { UserData, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'magicquize-super-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export function signToken(user: UserData | { id: string; email: string; role: UserRole; name: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
