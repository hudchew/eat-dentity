'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface MealDetailsDialogProps {
  mealId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MealData {
  id: string;
  imageUrl: string;
  mealTime: Date;
  dayNumber: number;
  notes: string | null;
  createdAt: Date;
  challenge: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      emoji: string;
      color: string;
      category: string;
    };
  }>;
}

export function MealDetailsDialog({
  mealId,
  open,
  onOpenChange,
}: MealDetailsDialogProps) {
  const router = useRouter();
  const [meal, setMeal] = useState<MealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; emoji: string; slug: string }>>([]);

  // Form state
  const [mealTime, setMealTime] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && mealId) {
      loadMeal();
      loadTags();
    }
  }, [open, mealId]);

  const loadMeal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/meals/${mealId}`);
      if (!response.ok) {
        throw new Error('Failed to load meal');
      }
      const data = await response.json();
      setMeal(data.meal);
      
      // Set form values
      const mealDate = new Date(data.meal.mealTime);
      setMealTime(mealDate.toISOString().slice(0, 16)); // Format for datetime-local
      setDayNumber(data.meal.dayNumber);
      setSelectedTagIds(data.meal.tags.map((t: any) => t.tag.id));
      setNotes(data.meal.notes || '');
    } catch (error) {
      console.error('Load meal error:', error);
      alert('Failed to load meal details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      if (response.ok) {
        const data = await response.json();
        setAllTags(data.tags || []);
      }
    } catch (error) {
      console.error('Load tags error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/meals/${mealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealTime: new Date(mealTime).toISOString(),
          dayNumber,
          tagIds: selectedTagIds,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update meal');
        return;
      }

      router.refresh();
      setIsEditing(false);
      loadMeal(); // Reload meal data
      alert('Meal updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating the meal');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meal? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete meal');
        return;
      }

      router.refresh();
      onOpenChange(false);
      alert('Meal deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the meal');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!meal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8 text-red-500">Meal not found</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Meal Details</DialogTitle>
          <DialogDescription>View and edit meal information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <Image
              src={meal.imageUrl}
              alt={`Meal on day ${meal.dayNumber}`}
              fill
              className="object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium">{meal.challenge.user.name || 'No name'}</div>
              <div className="text-sm text-gray-500">{meal.challenge.user.email}</div>
            </div>
            <Link href={`/admin/users/${meal.challenge.user.id}`}>
              <Button variant="ghost" size="sm">View User</Button>
            </Link>
            <Link href={`/admin/challenges/${meal.challenge.id}`}>
              <Button variant="ghost" size="sm">View Challenge</Button>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  // Reset form
                  if (meal) {
                    const mealDate = new Date(meal.mealTime);
                    setMealTime(mealDate.toISOString().slice(0, 16));
                    setDayNumber(meal.dayNumber);
                    setSelectedTagIds(meal.tags.map(t => t.tag.id));
                    setNotes(meal.notes || '');
                  }
                }}>
                  Cancel
                </Button>
              </>
            )}
          </div>

          {/* Meal Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meal Time
            </Label>
            {isEditing ? (
              <Input
                type="datetime-local"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
              />
            ) : (
              <div className="text-sm">{formatDateTime(meal.mealTime)}</div>
            )}
          </div>

          {/* Day Number */}
          <div className="space-y-2">
            <Label>Day Number</Label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="7"
                value={dayNumber}
                onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
              />
            ) : (
              <div className="text-sm">
                <Badge>Day {meal.dayNumber}</Badge>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Select
                  value={selectedTagIds.join(',')}
                  onValueChange={(value) => setSelectedTagIds(value ? value.split(',') : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tags" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.emoji} {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500">
                  Note: Multi-select coming soon. For now, you can edit tags via API.
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {meal.tags.map(({ tag }) => (
                  <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
                    {tag.emoji} {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            {isEditing ? (
              <textarea
                className="w-full min-h-[100px] border rounded px-3 py-2 text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this meal..."
              />
            ) : (
              <div className="text-sm text-gray-500">
                {meal.notes || <span className="italic">No notes</span>}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-400 space-y-1">
            <div>Created: {formatDateTime(meal.createdAt)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

