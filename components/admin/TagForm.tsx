'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Category } from '@prisma/client';

interface TagFormProps {
  tag?: {
    id: string;
    name: string;
    slug: string;
    category: Category;
    emoji: string;
    color: string;
    _count: {
      meals: number;
    };
  };
  mode: 'create' | 'edit';
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'COOKING_METHOD', label: 'Cooking Method' },
  { value: 'FOOD_GROUP', label: 'Food Group' },
  { value: 'TASTE', label: 'Taste' },
  { value: 'BEVERAGE', label: 'Beverage' },
];

export function TagForm({ tag, mode }: TagFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [name, setName] = useState(tag?.name || '');
  const [slug, setSlug] = useState(tag?.slug || '');
  const [category, setCategory] = useState<Category>(tag?.category || 'FOOD_GROUP');
  const [emoji, setEmoji] = useState(tag?.emoji || '');
  const [color, setColor] = useState(tag?.color || '#3b82f6');

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [name, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = mode === 'create' ? '/api/admin/tags' : `/api/admin/tags/${tag?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          category,
          emoji,
          color,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || `Failed to ${mode} tag`);
        return;
      }

      router.push('/admin/tags');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      alert(`An error occurred while ${mode === 'create' ? 'creating' : 'updating'} the tag`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tag) return;

    if (tag._count.meals > 0) {
      alert(
        `Cannot delete this tag. It is currently used by ${tag._count.meals} meal(s). Please remove all usage first.`
      );
      return;
    }

    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete tag');
        return;
      }

      router.push('/admin/tags');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the tag');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{mode === 'create' ? 'Create Tag' : 'Edit Tag'}</CardTitle>
          <Link href="/admin/tags">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ทอด, ผัก, หวาน"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., fried, vegetable, sweet"
              required
            />
            <p className="text-xs text-gray-500">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji *</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="e.g., 🍳, 🥬, 🍰"
              maxLength={2}
              required
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <div className="flex gap-4 items-center">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
                required
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-500">Preview</span>
            </div>
          </div>

          {/* Usage Info (for edit mode) */}
          {mode === 'edit' && tag && (
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">
                <strong>Usage:</strong> Used in {tag._count.meals} meal{tag._count.meals !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create Tag' : 'Save Changes'}
            </Button>
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || (tag?._count?.meals ?? 0) > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

