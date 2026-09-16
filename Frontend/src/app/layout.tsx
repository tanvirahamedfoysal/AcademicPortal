import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import QueryProvider from '../providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Dr. Tania Islam',
    default: 'Dr. Tania Islam | Academic Research Portfolio',
  },
  description: 'Research portfolio, publications, scholarly resources, collaboration network, and lab members.',
  applicationName: 'Dr. Tania Islam',
  manifest: '/manifest.json',
  other: {
    'color-scheme': 'light',
    'darkreader-lock': '',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#fffaf7',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <Script id="mathjax-configuration" strategy="beforeInteractive">
          {`window.MathJax = {
            tex: {
              inlineMath: [['\\(', '\\)'], ['$', '$']],
              displayMath: [['\\[', '\\]'], ['$$', '$$']],
              processEscapes: true,
              processEnvironments: true
            },
            options: {
              enableMenu: false,
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            },
            startup: { typeset: false }
          };`}
        </Script>
        <Script id="mathjax-runtime" src="/mathjax/es5/tex-mml-chtml.js" strategy="afterInteractive" />
      </head>
      <body className="min-h-screen bg-[#fffaf7] text-slate-950 antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
