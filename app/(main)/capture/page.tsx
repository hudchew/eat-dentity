'use client';

import { useState } from 'react';
import { CameraCapture } from '@/components/features/CameraCapture';
import { QuickTagsSelector } from '@/components/features/QuickTagsSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuickTag } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { saveMeal } from '@/lib/actions/challenge';
import { getMealPrompt } from '@/lib/utils/meal-period';

export default function CapturePage() {
  const router = useRouter();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<QuickTag[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUploaded = (blobUrl: string) => {
    setUploadedImageUrl(blobUrl);
  };

  const handleTagsChange = (tags: QuickTag[]) => {
    setSelectedTags(tags);
  };

  const canSave = uploadedImageUrl && selectedTags.length > 0;

  const handleSave = async () => {
    if (!uploadedImageUrl || selectedTags.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const tagSlugs = selectedTags.map((tag) => tag.slug);
      await saveMeal(uploadedImageUrl, tagSlugs);
      router.push('/dashboard');
      router.refresh(); // Refresh to show new meal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save meal';
      setError(errorMessage);
      console.error('Save meal error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">บันทึกมื้ออาหาร</h1>
          {(() => {
            const prompt = getMealPrompt();
            return (
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-xl" aria-hidden>{prompt.emoji}</span>
                <span>{prompt.title} · {prompt.subtitle}</span>
              </p>
            );
          })()}
        </div>

        <CameraCapture onUploaded={handleImageUploaded} />

        <Card>
          <CardContent className="p-6">
            <QuickTagsSelector onTagsChange={handleTagsChange} />
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">❌ {error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            size="lg" 
            className="flex-1 text-lg" 
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? '⏳ กำลังบันทึก...' : '✅ บันทึกมื้ออาหาร'}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="flex-1" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    </div>
  );
}

