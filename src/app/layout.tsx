import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GitWizard - Never Commit Secrets Again',
  description: 'Automatically detect and alert developers when they accidentally commit API keys/secrets to GitHub.',
  keywords: 'GitHub, security, secrets, API keys, monitoring, alerts',
  authors: [{ name: 'GitWizard Team' }],
  openGraph: {
    title: 'GitWizard - Never Commit Secrets Again',
    description: 'Automatically detect and alert developers when they accidentally commit API keys/secrets to GitHub.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
