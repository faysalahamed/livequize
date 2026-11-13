import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { appConfig } from '@/config/app';
import { AuthProvider } from '@/lib/auth-context';

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
    <html lang="en">
      <body className="bg-[#F0F5FA] text-slate-800 min-h-screen flex flex-col antialiased selection:bg-sky-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
