'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const { data: session } = useSession();

  // Only show for admin users
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/admin">
        <Button
          variant="outline"
          size="sm"
          className="shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <Shield className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </Link>
    </div>
  );
}
