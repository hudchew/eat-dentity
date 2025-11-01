'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/capture', label: '📸 ถ่ายรูป', icon: '📸' },
    { href: '/profile', label: '👤 โปรไฟล์', icon: '👤' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            🍔 Eat-dentity
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <SignedIn>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive(link.href) ? 'default' : 'ghost'}
                    className={cn(
                      'transition-all',
                      isActive(link.href) && 'bg-orange-500 hover:bg-orange-600'
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="ml-2 pl-2 border-l">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">เข้าสู่ระบบ</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  สมัครสมาชิก
                </Button>
              </SignUpButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <SignedIn>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-xl"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <SignedIn>
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.href) ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start text-lg',
                      isActive(link.href) && 'bg-orange-500 hover:bg-orange-600'
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </SignedIn>
        )}
      </div>
    </nav>
  );
}

