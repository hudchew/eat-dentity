'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            Eat-dentity
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="rounded-full">
                  เข้าสู่ระบบ
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full">
                  สมัครสมาชิก
                </Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

