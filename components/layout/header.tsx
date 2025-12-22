'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AI Workspace</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/tools">
            <Button variant="ghost">Explore Tools</Button>
          </Link>
          <Link href="/tutorials">
            <Button variant="ghost">Tutorials</Button>
          </Link>
          {session ? (
            <>
              <Link href="/workspace">
                <Button variant="ghost">My Workspace</Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
