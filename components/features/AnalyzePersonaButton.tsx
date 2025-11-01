'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { completeChallenge } from '@/lib/actions/challenge';

interface AnalyzePersonaButtonProps {
  eligible: boolean;
  reasons: string[];
}

export function AnalyzePersonaButton({ eligible, reasons }: AnalyzePersonaButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeChallenge();
      // Redirect to result page after successful analysis
      router.push('/result');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'วิเคราะห์ไม่สำเร็จ';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}
      <Button 
        onClick={onAnalyze} 
        size="lg" 
        className="w-full text-lg px-8 py-6 h-auto bg-green-600 hover:bg-green-700 font-semibold shadow-2xl" 
        disabled={!eligible || loading}
      >
        {loading ? 'Analyzing...' : 'Analyze My Persona'}
      </Button>
    </div>
  );
}
