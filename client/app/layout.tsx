import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Synctask — Collaborative Task Manager',
  description: 'Real-time collaborative task management for modern teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} font-body bg-ink text-slate-100 antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1A1F',
                color: '#e2e8f0',
                border: '1px solid #2A2A32',
                borderRadius: '12px',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#0D0D1A' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: '#0D0D1A' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
