import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrum Poker',
  description: 'Real-time Scrum Poker estimation tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light dark' }}>
      <head>
        {/* Theme detection - runs before render to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('theme');
            if (!theme) {
              theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            document.documentElement.setAttribute('theme', theme);
          })();
        `}} />
        {/* Preconnect hints for faster CDN loading */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

        {/* Materialize CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
        />

      </head>
      <body>
        {children}
        <Footer />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
