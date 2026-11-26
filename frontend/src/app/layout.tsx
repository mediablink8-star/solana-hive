import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SOLANA HIVE - AI Trading Command Center',
  description: 'Autonomous AI trading organization for Solana - Paper trading only',
  keywords: ['solana', 'trading', 'AI', 'bot', 'paper trading', 'defi'],
  authors: [{ name: 'SOLANA HIVE' }],
  openGraph: {
    title: 'SOLANA HIVE - AI Trading Command Center',
    description: 'Autonomous AI trading organization for Solana',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="config:api" content="__API_BASE_URL__" />
        <meta name="config:ws" content="__WS_BASE_URL__" />
      </head>
      <body className="min-h-screen bg-hive-bg text-hive-text antialiased">
        {children}
      </body>
    </html>
  );
}