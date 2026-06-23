import type { Metadata } from 'next';
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';
import '@/styles/portfolio.css';
import ScrollProgressBar from '@/components/layout/scroll-progress-bar';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lucas Lobeu — Diretor & Fotógrafo',
  description: 'Diretor, fotógrafo e diretor de social. São Paulo, 2019—.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body>
        <ScrollProgressBar />
        {children}
      </body>
    </html>
  );
}
