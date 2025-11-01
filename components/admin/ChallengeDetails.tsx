'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  User,
  UtensilsCrossed,
  Sparkles,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import type { Status } from '@prisma/client';

interface Meal {
  id: string;
  imageUrl: string;
  mealTime: Date;
  dayNumber: number;
  notes: string | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      emoji: string;
      color: string;
    };
  }>;
  createdAt: Date;
}

interface ChallengeDetailsProps {
  challenge: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    startDate: Date;
    endDate: Date;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
  };
  meals: Meal[];
  persona: {
    id: string;
    title: string;
    description: string;
    statsJson: any;
    aiInsight: string | null;
    createdAt: Date;
  } | null;
  canEdit: boolean;
}

export function ChallengeDetails({
  challenge,
  meals,
  persona,
  canEdit,
}: ChallengeDetailsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(challenge.status);
  const [startDate, setStartDate] = useState(
    new Date(challenge.startDate).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(challenge.endDate).toISOString().split('T')[0]
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update challenge');
        return;
      }

      router.refresh();
      setIsEditing(false);
      alert('Challenge updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating the challenge');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/challenges/${challenge.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete challenge');
        return;
      }

      router.push('/admin/challenges');
      alert('Challenge deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the challenge');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'ABANDONED':
        return <Badge className="bg-gray-500">Abandoned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  // Group meals by day
  const mealsByDay = meals.reduce((acc, meal) => {
    const day = meal.dayNumber;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(meal);
    return acc;
  }, {} as Record<number, Meal[]>);

  const sortedDays = Object.keys(mealsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Challenge Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Challenge Information</CardTitle>
            {canEdit && (
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
                      setStatus(challenge.status);
                      setStartDate(new Date(challenge.startDate).toISOString().split('T')[0]);
                      setEndDate(new Date(challenge.endDate).toISOString().split('T')[0]);
                    }}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium">{challenge.user.name || 'No name'}</div>
              <div className="text-sm text-gray-500">{challenge.user.email}</div>
            </div>
            <Link href={`/admin/users/${challenge.user.id}`}>
              <Button variant="ghost" size="sm">View User</Button>
            </Link>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Status:</span>
            {isEditing ? (
              <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ABANDONED">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              getStatusBadge(challenge.status)
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                {isEditing ? (
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-48"
                  />
                ) : (
                  <div className="font-medium">{formatDate(challenge.startDate)}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                {isEditing ? (
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-48"
                  />
                ) : (
                  <div className="font-medium">{formatDate(challenge.endDate)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-sm text-gray-500 space-y-1">
            <div>Created: {formatDateTime(challenge.createdAt)}</div>
            <div>Updated: {formatDateTime(challenge.updatedAt)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{meals.length}</div>
            <div className="text-sm text-gray-500">
              Across {sortedDays.length} day{sortedDays.length !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        {persona && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Persona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium text-lg mb-2">{persona.title}</div>
              <div className="text-sm text-gray-500">{persona.description}</div>
              {persona.aiInsight && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  {persona.aiInsight}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Meals by Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Meals ({meals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>No meals recorded</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDays.map((day) => (
                <div key={day} className="space-y-2">
                  <h3 className="font-medium text-lg">Day {day}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mealsByDay[day].map((meal) => (
                      <div key={meal.id} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image
                            src={meal.imageUrl}
                            alt={`Meal on day ${meal.dayNumber}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition">
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex flex-wrap gap-1">
                                {meal.tags.slice(0, 3).map(({ tag }) => (
                                  <Badge key={tag.id} className="text-xs" style={{ backgroundColor: tag.color }}>
                                    {tag.emoji} {tag.name}
                                  </Badge>
                                ))}
                                {meal.tags.length > 3 && (
                                  <Badge className="text-xs bg-gray-500">
                                    +{meal.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                              {formatDateTime(meal.mealTime)}
                            </div>
                          </div>
                        </div>
                        {meal.notes && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {meal.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

