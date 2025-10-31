import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureHighlight } from '@/components/landing/FeatureHighlight';
import { PersonaShowcase } from '@/components/landing/PersonaShowcase';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureHighlight />
      <PersonaShowcase />
    </main>
  );
}
