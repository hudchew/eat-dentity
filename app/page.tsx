import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureHighlight } from '@/components/landing/FeatureHighlight';
import { PersonaShowcase } from '@/components/landing/PersonaShowcase';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeatureHighlight />
      <PersonaShowcase />
    </main>
  );
}
