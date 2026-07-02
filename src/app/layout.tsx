import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RaeburnAI Proposal Generator',
  description: 'AI proposal and solution generator for consultants.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
