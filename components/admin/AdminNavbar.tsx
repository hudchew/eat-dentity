'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface AdminNavbarProps {
  admin: {
    id: string;
    email: string;
    name: string;
  };
}

export function AdminNavbar({ admin }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/challenges', label: 'Challenges', icon: '🎯' },
    { href: '/admin/meals', label: 'Meals', icon: '🍽️' },
    { href: '/admin/personas', label: 'Personas', icon: '🎴' },
    { href: '/admin/tags', label: 'Tags', icon: '🏷️' },
    { href: '/admin/activities', label: 'Activities', icon: '📜' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <Link 
            href="/admin/dashboard" 
            className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"
          >
            🔐 Admin Panel
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'transition-all',
                    isActive(link.href) && 'bg-orange-500 hover:bg-orange-600'
                  )}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">{admin.name}</div>
              <div className="text-xs text-gray-500">{admin.email}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 pt-3 border-t">
          <div className="flex flex-wrap gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'text-xs',
                    isActive(link.href) && 'bg-orange-500 hover:bg-orange-600'
                  )}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

