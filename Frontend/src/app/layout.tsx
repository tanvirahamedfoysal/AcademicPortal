import type { Metadata } from 'next';
import QueryProvider from '../providers/QueryProvider';
import HomeFloatingButton from '../components/HomeFloatingButton';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Dr. Tania Islam',
    default: "Dr. Tania Islam | Academic Research Portfolio",
  },
  description: 'Research portfolio, publications, scholarly resources, collaboration network, and academic learning community.',
  applicationName: "Dr. Tania Islam",
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fffaf7] text-slate-950 antialiased">
        <QueryProvider>
          {children}
          <HomeFloatingButton />
        </QueryProvider>
      </body>
    </html>
  );
}
