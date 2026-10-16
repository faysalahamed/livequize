/**
 * Application Configuration
 *
 * Customize your application name, descriptions, and branding here.
 * You can also override the name at runtime by setting NEXT_PUBLIC_APP_NAME in your .env file!
 */

export const appConfig = {
  // Application display name (reads from .env if present, otherwise defaults)
  name: process.env.NEXT_PUBLIC_APP_NAME || 'MagicQuize',

  // Application short description
  description:
    process.env.NEXT_PUBLIC_APP_DESC ||
    'Live Interactive Quizzes & Real-time Polls',

  // Tagline shown under logo
  tagline: 'Live Interactive Quiz',

  // Footer label
  footerText: 'Interactive Presentation Platform',
};
