import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MentiPulse | Live Interactive Quizzes & Real-time Polls',
  description: 'Create and host live quizzes, audience polls, and interactive word clouds like Mentimeter.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
