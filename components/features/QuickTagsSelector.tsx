'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QUICK_TAGS, TAG_CATEGORIES } from '@/lib/constants';
import { QuickTag } from '@/lib/constants';

interface QuickTagsSelectorProps {
  onTagsChange?: (selectedTags: QuickTag[]) => void;
}

export function QuickTagsSelector({ onTagsChange }: QuickTagsSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const toggleTag = (tagId: number) => {
    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelected);

    const selectedTagObjects = QUICK_TAGS.filter((tag) =>
      newSelected.includes(tag.id)
    );
    onTagsChange?.(selectedTagObjects);
  };

  const groupedTags = QUICK_TAGS.reduce(
    (acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    },
    {} as Record<string, QuickTag[]>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Select Tags</h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
        </p>
      </div>
      {Object.entries(groupedTags).map(([category, tags]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]}
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <Button
                  key={tag.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    rounded-full px-4
                    ${isSelected ? tag.color + ' text-white border-0 shadow-md' : 'bg-gray-50 hover:bg-gray-100'}
                    transition-all
                  `}
                >
                  {tag.name}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

