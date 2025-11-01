import { Navbar } from '@/components/layout/Navbar';
import { FooterNav } from '@/components/layout/FooterNav';
import { SignedIn } from '@clerk/nextjs';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex justify-center bg-gray-50 min-h-screen pb-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      <SignedIn>
        <FooterNav />
      </SignedIn>
    </>
  );
}

