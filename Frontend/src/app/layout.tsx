import type { Metadata } from 'next';
import QueryProvider from '../providers/QueryProvider';
import HomeFloatingButton from '../components/HomeFloatingButton';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Researcher\'s Eden',
    default: "Researcher's Eden | Academic Research Portfolio",
  },
  description: 'Research portfolio, publications, scholarly resources, collaboration network, and academic learning community.',
  applicationName: "Researcher's Eden",
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f7f4] text-slate-950 antialiased">
        <QueryProvider>
          {children}
          <HomeFloatingButton />
        </QueryProvider>
      </body>
    </html>
  );
}
