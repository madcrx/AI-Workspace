'use client';

import { SessionProvider } from 'next-auth/react';
import { Footer } from '@/components/layout/footer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Footer />
    </SessionProvider>
  );
}
