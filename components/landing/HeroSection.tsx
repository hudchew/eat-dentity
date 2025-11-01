'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Eat-dentity
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-white/90 drop-shadow-lg">
            You Are What You Eat
          </p>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          ถ่ายรูปอาหาร 7 วัน ค้นพบตัวตนผ่านสิ่งที่คุณกิน
        </p>

        {/* CTA Buttons */}
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                size="lg" 
                className="text-xl px-12 py-7 h-auto bg-white text-black hover:bg-gray-100 rounded-full shadow-2xl font-semibold transition-all hover:scale-105 min-w-[200px]"
              >
                เข้าสู่ระบบ
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button 
                size="lg" 
                className="text-xl px-12 py-7 h-auto bg-blue-600 text-white hover:bg-blue-700 rounded-full shadow-2xl font-semibold transition-all hover:scale-105 min-w-[200px]"
              >
                สมัครสมาชิก
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="text-xl px-12 py-7 h-auto bg-blue-600 text-white hover:bg-blue-700 rounded-full shadow-2xl font-semibold transition-all hover:scale-105 min-w-[200px]"
              >
                เริ่มต้น Challenge
              </Button>
            </Link>
          </SignedIn>
        </div>

        {/* Small note at bottom */}
        <p className="text-sm text-white/60 pt-12">
          เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มต้น
        </p>
      </div>
    </section>
  );
}

