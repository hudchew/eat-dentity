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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">เลือกแท็กอาหาร</h3>
      {Object.entries(groupedTags).map(([category, tags]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
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
                    ${isSelected ? tag.color : ''}
                    ${isSelected ? 'text-white border-2' : ''}
                    transition-all
                  `}
                >
                  <span className="mr-2">{tag.emoji}</span>
                  {tag.name}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-sm text-gray-500">
        เลือกได้หลายแท็กต่อ 1 มื้ออาหาร ({selectedTags.length} แท็กที่เลือก)
      </p>
    </div>
  );
}

