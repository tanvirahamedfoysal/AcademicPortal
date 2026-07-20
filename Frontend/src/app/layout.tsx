import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import QueryProvider from '../providers/QueryProvider';
import HomeFloatingButton from '@/components/HomeFloatingButton';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | Academic Research Portal',
    default: 'Academic Research Portal',
  },
  description: 'A centralized platform for academic publications, research collaborations, and document management.',
  applicationName: 'Academic Portal',
  manifest: '/manifest.json', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <QueryProvider>
          {children}
          <HomeFloatingButton />
        </QueryProvider>
      </body>
    </html>
  );
}