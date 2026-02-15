"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { CreatePostModal } from './feed/CreatePostModal';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

export function Navbar() {
  const { logout } = useAppContext();
  const pathname = usePathname();

  const navItems = [
    { href: '/feed', label: 'Feed' },
    { href: '/profile', label: 'Profile' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/feed" className="mr-6 flex items-center space-x-2">
            <span className="font-headline text-2xl font-bold text-primary">HACKMATE</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-primary/80',
                  pathname === item.href ? 'text-primary' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Link href="/feed" className="font-headline text-2xl font-bold text-primary">HM</Link>
          </div>
          <div className="flex items-center space-x-2">
            <CreatePostModal>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </CreatePostModal>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
