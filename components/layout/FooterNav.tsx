'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Camera, Award, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/challenge',
    label: 'Challenge',
    icon: Trophy,
  },
  {
    href: '/capture',
    label: 'Capture',
    icon: Camera,
    featured: true, // Capture button is featured/prominent
  },
  {
    href: '/badge',
    label: 'My Badge',
    icon: Award,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export function FooterNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors',
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {item.featured ? (
                  // Featured button (Capture) - bigger with background
                  <div className={cn(
                    'rounded-full p-2.5 transition-all',
                    active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                  )}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                ) : (
                  // Regular button
                  <Icon className={cn(
                    'w-6 h-6',
                    active ? 'stroke-[2.5]' : 'stroke-2'
                  )} />
                )}
                <span className={cn(
                  'text-[10px] font-medium',
                  active && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

