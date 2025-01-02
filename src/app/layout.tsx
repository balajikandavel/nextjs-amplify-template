'use client';

import './globals.css';
import { Inter } from 'next/font/google';
//import { Amplify } from 'aws-amplify';
import './config/amplify';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Hello Amplify</title>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
