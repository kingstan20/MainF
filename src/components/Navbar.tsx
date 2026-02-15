"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { CreatePostModal } from './feed/CreatePostModal';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PlusCircle, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import React from 'react';

export function Navbar() {
  const { logout } = useAppContext();
  const pathname = usePathname();

  const navItems = [
    { href: '/feed', label: 'Feed' },
    { href: '/profile', label: 'Profile' },
    { href: '/settings', label: 'Settings' },
  ];
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Desktop nav */}
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
                  pathname.startsWith(item.href) ? 'text-primary' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end">
            {/* Mobile nav */}
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                    <div className="flex flex-col h-full">
                        <div className="border-b pb-4">
                            <Link href="/feed" onClick={() => setIsSheetOpen(false)}>
                                <h2 className="font-headline text-2xl font-bold text-primary">HACKMATE</h2>
                            </Link>
                        </div>
                        <nav className="flex-grow py-4 flex flex-col gap-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSheetOpen(false)}
                                    className={cn(
                                    'text-lg transition-colors hover:text-primary',
                                    pathname.startsWith(item.href) ? 'text-primary font-semibold' : 'text-foreground/80'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto">
                            <Button variant="outline" onClick={() => { logout(); setIsSheetOpen(false); }} className="w-full">
                                Logout
                            </Button>
                        </div>
                    </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center space-x-2">
                <CreatePostModal>
                <Button>
                    <PlusCircle className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Create Post</span>
                </Button>
                </CreatePostModal>
                <Button variant="outline" onClick={logout} className="hidden md:flex">
                Logout
                </Button>
            </div>
        </div>
      </div>
    </header>
  );
}
