import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `${appConfig.name} | ${appConfig.description}`,
  description: appConfig.description,
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
