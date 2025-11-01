'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Image as ImageIcon,
  Edit,
  Trash2,
} from 'lucide-react';
import { MealDetailsDialog } from './MealDetailsDialog';

interface Meal {
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
      emoji: string;
      color: string;
    };
  }>;
}

interface ChallengeOption {
  id: string;
  label: string;
}

interface UserOption {
  id: string;
  label: string;
}

interface MealGridProps {
  meals: Meal[];
  total: number;
  currentPage: number;
  totalPages: number;
  search: string;
  challengeFilter: string;
  userFilter: string;
  dateFrom: string;
  dateTo: string;
  challenges: ChallengeOption[];
  users: UserOption[];
}

export function MealGrid({
  meals,
  total,
  currentPage,
  totalPages,
  search,
  challengeFilter,
  userFilter,
  dateFrom,
  dateTo,
  challenges,
  users,
}: MealGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedChallenge, setSelectedChallenge] = useState(challengeFilter);
  const [selectedUser, setSelectedUser] = useState(userFilter);
  const [fromDate, setFromDate] = useState(dateFrom);
  const [toDate, setToDate] = useState(dateTo);
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }

    if (selectedChallenge && selectedChallenge !== 'ALL') {
      params.set('challenge', selectedChallenge);
    } else {
      params.delete('challenge');
    }

    if (selectedUser && selectedUser !== 'ALL') {
      params.set('user', selectedUser);
    } else {
      params.delete('user');
    }

    if (fromDate) {
      params.set('from', fromDate);
    } else {
      params.delete('from');
    }

    if (toDate) {
      params.set('to', toDate);
    } else {
      params.delete('to');
    }

    params.set('page', '1');
    router.push(`/admin/meals?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedChallenge('ALL');
    setSelectedUser('ALL');
    setFromDate('');
    setToDate('');
    router.push('/admin/meals');
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (challengeFilter) params.set('challenge', challengeFilter);
    if (userFilter) params.set('user', userFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    router.push(`/admin/meals?${params.toString()}`);
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

  const toggleSelectMeal = (mealId: string) => {
    const newSelected = new Set(selectedMeals);
    if (newSelected.has(mealId)) {
      newSelected.delete(mealId);
    } else {
      newSelected.add(mealId);
    }
    setSelectedMeals(newSelected);
  };

  const selectAllMeals = () => {
    if (selectedMeals.size === meals.length) {
      setSelectedMeals(new Set());
    } else {
      setSelectedMeals(new Set(meals.map((m) => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMeals.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedMeals.size} meal(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/meals/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mealIds: Array.from(selectedMeals) }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete meals');
        return;
      }

      router.refresh();
      setSelectedMeals(new Set());
      alert('Meals deleted successfully!');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('An error occurred while deleting meals');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Challenge Filter */}
            <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
              <SelectTrigger>
                <SelectValue placeholder="All Challenges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Challenges</SelectItem>
                {challenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              placeholder="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            {/* Date To */}
            <Input
              type="date"
              placeholder="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Apply Filters</Button>
            {(search || challengeFilter !== 'ALL' || userFilter !== 'ALL' || dateFrom || dateTo) && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </form>

        {/* Bulk Actions */}
        {selectedMeals.size > 0 && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-orange-800">
              {selectedMeals.size} meal(s) selected
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {meals.length} of {total} meals
        </div>

        {/* Table View */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMeals.size === meals.length && meals.length > 0}
                      onChange={selectAllMeals}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Time
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {meals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No meals found</p>
                    </td>
                  </tr>
                ) : (
                  meals.map((meal) => (
                    <tr
                      key={meal.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedMealId(meal.id)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMeals.has(meal.id)}
                          onChange={() => toggleSelectMeal(meal.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative h-16 w-16 rounded overflow-hidden">
                          <Image
                            src={meal.imageUrl}
                            alt={`Meal ${meal.id}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm">
                            {meal.challenge.user.name || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {meal.challenge.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>Day {meal.dayNumber}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {meal.tags.slice(0, 3).map(({ tag }) => (
                            <Badge key={tag.id} className="text-xs" style={{ backgroundColor: tag.color }}>
                              {tag.emoji} {tag.name}
                            </Badge>
                          ))}
                          {meal.tags.length > 3 && (
                            <Badge className="text-xs bg-gray-500">+{meal.tags.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(meal.mealTime)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMealId(meal.id);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Meal Details Dialog */}
        {selectedMealId && (
          <MealDetailsDialog
            mealId={selectedMealId}
            open={!!selectedMealId}
            onOpenChange={(open) => {
              if (!open) setSelectedMealId(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

