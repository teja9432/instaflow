import React from 'react';
import { ThemeRegistry } from '@/lib/theme-registry';

export const metadata = {
  title: 'InstaFlow | Instagram Comment & DM Automation',
  description: 'Scale your conversions on Instagram. Instantly reply to comments, verify followers, and dispatch links and assets automatically to DMs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#070a13' }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
