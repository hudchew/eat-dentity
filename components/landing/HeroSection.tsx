'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16">
      <div className="text-center space-y-6 max-w-4xl">
        {/* Main Title with Animation */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="inline-block animate-bounce">🍔</span>
            <span className="mx-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Eat-dentity
            </span>
            <span className="inline-block animate-bounce animation-delay-200">🧑</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 font-semibold">
            You Are What You Eat!
          </p>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          ถ่ายรูปอาหารที่คุณกินทุกมื้อเป็นเวลา 7 วัน
          <br />
          แล้วค้นพบตัวตนของคุณผ่านอาหารที่คุณกิน!
        </p>

        {/* CTA Button */}
        <div className="pt-8">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                🚀 เริ่มต้น 7-Day Challenge
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                🚀 เริ่มต้น 7-Day Challenge
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}

