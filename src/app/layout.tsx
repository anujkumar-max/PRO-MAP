import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PRO-MAP | Tech Services',
  description: 'Project, Role, Outcome & Manpower Assessment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-[#0F172A] text-white min-h-screen flex flex-col md:flex-row overflow-hidden")}>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
