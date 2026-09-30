import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UCL Cohort Network | Co-founder & Project Partner Matching',
  description:
    'A lightweight matching platform for the UCL founder cohort to find co-founders, project partners, and network. Direct 1-on-1 handoff to WhatsApp.',
  keywords: [
    'UCL',
    'University College London',
    'Co-founder matching',
    'Startup team',
    'Cohort directory',
    'Hackathon partners',
    'Tech founders',
  ],
  authors: [{ name: 'UCL Cohort' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
