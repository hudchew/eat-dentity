'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { completeChallenge } from '@/lib/actions/challenge';

interface AnalyzePersonaButtonProps {
  eligible: boolean;
  reasons: string[];
}

export function AnalyzePersonaButton({ eligible, reasons }: AnalyzePersonaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeChallenge();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'วิเคราะห์ไม่สำเร็จ';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          ❌ {error}
        </div>
      )}
      <Button onClick={onAnalyze} size="lg" className="text-lg" disabled={!eligible || loading}>
        {loading ? '⏳ กำลังวิเคราะห์...' : '🧠 วิเคราะห์ Persona'}
      </Button>
      {!eligible && reasons.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc pl-5">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
