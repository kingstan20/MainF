import type { Metadata } from 'next';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export const metadata: Metadata = {
  title: 'HackMate',
  description: 'Collaborate, build, and conquer hackathons.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ThemeProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
