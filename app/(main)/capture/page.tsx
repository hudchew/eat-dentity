'use client';

import { useState } from 'react';
import { CameraCapture } from '@/components/features/CameraCapture';
import { QuickTagsSelector } from '@/components/features/QuickTagsSelector';
import { Button } from '@/components/ui/button';
import { QuickTag } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { saveMeal } from '@/lib/actions/challenge';
import { getMealPrompt } from '@/lib/utils/meal-period';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

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
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save meal';
      setError(errorMessage);
      console.error('Save meal error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const prompt = getMealPrompt();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Title Center */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white relative">
        <div className="flex items-center justify-center relative h-16">
          <h1 className="text-xl font-bold">Capture Meal</h1>
        </div>
      </div>

      {/* Main Content - Scrollable with clear sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pb-6">
          {/* Prompt Section */}
          <div className="bg-white border-b border-gray-100 px-4 py-4 text-center">
            <p className="text-gray-700 font-medium text-sm">{prompt.title}</p>
          </div>

          {/* Camera Preview Section */}
          <div className="px-4">
            <CameraCapture onUploaded={handleImageUploaded} />
          </div>

          {/* Tags Section - White background with rounded top */}
          <div className="bg-white rounded-t-3xl px-4 py-6">
            <QuickTagsSelector onTagsChange={handleTagsChange} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Save Button Section */}
          <div className="px-4 space-y-2">
            <Button 
              size="lg" 
              className="w-full text-lg px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg" 
              onClick={handleSave}
              disabled={!canSave || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Meal'}
            </Button>
            {!canSave && (
              <p className="text-xs text-gray-500 text-center">
                {!uploadedImageUrl ? 'Please capture a photo' : 'Please select at least one tag'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

