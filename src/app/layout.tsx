import type { Metadata } from 'next';
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
    <html lang="en">
      <head>
        {/* Materialize CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
        />
        {/* Material Icons */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        {/* Materialize JS */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"
          defer
        />
      </head>
      <body>
        <nav className="teal">
          <div className="nav-wrapper container">
            <a href="/" className="brand-logo">
              Scrum Poker
            </a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
