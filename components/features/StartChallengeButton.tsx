'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { startChallenge } from '@/lib/actions/challenge';
import { useRouter } from 'next/navigation';

export function StartChallengeButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await startChallenge();
      router.refresh(); // Refresh to show the new challenge
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start challenge';
      setError(errorMessage);
      console.error('Start challenge error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        size="lg" 
        className="text-xl px-12 py-7 h-auto bg-blue-600 hover:bg-blue-700 rounded-full font-semibold"
        onClick={handleStart}
        disabled={isLoading}
      >
        {isLoading ? 'Starting...' : 'Start 7-Day Challenge'}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

