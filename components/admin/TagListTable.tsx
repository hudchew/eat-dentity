'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Tags,
  Edit,
  Plus,
} from 'lucide-react';
import type { Category } from '@prisma/client';

interface Tag {
  id: string;
  name: string;
  slug: string;
  category: Category;
  emoji: string;
  color: string;
  _count: {
    meals: number;
  };
}

interface TagListTableProps {
  tags: Tag[];
  total: number;
  currentPage: number;
  totalPages: number;
  search: string;
  categoryFilter: string;
}

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'COOKING_METHOD', label: 'Cooking Method' },
  { value: 'FOOD_GROUP', label: 'Food Group' },
  { value: 'TASTE', label: 'Taste' },
  { value: 'BEVERAGE', label: 'Beverage' },
];

export function TagListTable({
  tags,
  total,
  currentPage,
  totalPages,
  search,
  categoryFilter,
}: TagListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }

    if (selectedCategory && selectedCategory !== 'ALL') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    params.set('page', '1');
    router.push(`/admin/tags?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    router.push('/admin/tags');
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    router.push(`/admin/tags?${params.toString()}`);
  };

  const getCategoryBadge = (category: Category) => {
    const categoryMap: Record<Category, string> = {
      COOKING_METHOD: 'Cooking Method',
      FOOD_GROUP: 'Food Group',
      TASTE: 'Taste',
      BEVERAGE: 'Beverage',
    };
    return categoryMap[category] || category;
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Tags</h2>
            <p className="text-sm text-gray-500">Manage food tags in the system</p>
          </div>
          <Link href="/admin/tags/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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

          <div className="flex gap-2">
            <Button type="submit">Apply Filters</Button>
            {(search || categoryFilter !== 'ALL') && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {tags.length} of {total} tags
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Tag
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <Tags className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No tags found</p>
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tag.emoji}</span>
                          <span className="font-medium">{tag.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tag.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{getCategoryBadge(tag.category)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: tag.color }}
                          />
                          <code className="text-xs text-gray-500">{tag.color}</code>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-500">
                          {tag._count.meals} meal{tag._count.meals !== 1 ? 's' : ''}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/tags/${tag.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
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
      </CardContent>
    </Card>
  );
}

