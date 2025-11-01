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
  Sparkles,
  Edit,
  Trash2,
} from 'lucide-react';

interface Persona {
  id: string;
  title: string;
  description: string;
  statsJson: any;
  aiInsight: string | null;
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
}

interface PersonaListTableProps {
  personas: Persona[];
  total: number;
  currentPage: number;
  totalPages: number;
  search: string;
  userFilter: string;
  dateFrom: string;
  dateTo: string;
  users: Array<{ id: string; label: string }>;
}

export function PersonaListTable({
  personas,
  total,
  currentPage,
  totalPages,
  search,
  userFilter,
  dateFrom,
  dateTo,
  users,
}: PersonaListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedUser, setSelectedUser] = useState(userFilter);
  const [fromDate, setFromDate] = useState(dateFrom);
  const [toDate, setToDate] = useState(dateTo);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
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
    router.push(`/admin/personas?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedUser('ALL');
    setFromDate('');
    setToDate('');
    router.push('/admin/personas');
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (userFilter) params.set('user', userFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    router.push(`/admin/personas?${params.toString()}`);
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

  const getTopStats = (statsJson: any, count: number = 3) => {
    if (!statsJson || typeof statsJson !== 'object') return [];
    const entries = Object.entries(statsJson) as [string, number][];
    return entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([slug, value]) => ({ slug, value }));
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by user email or persona title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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
            {(search || userFilter !== 'ALL' || dateFrom || dateTo) && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {personas.length} of {total} personas
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Top Stats
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    AI Insight
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {personas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No personas found</p>
                    </td>
                  </tr>
                ) : (
                  personas.map((persona) => {
                    const topStats = getTopStats(persona.statsJson);
                    return (
                      <tr key={persona.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{persona.title}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-sm">
                              {persona.challenge.user.name || 'No name'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {persona.challenge.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {persona.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {topStats.map((stat) => (
                              <Badge key={stat.slug} className="text-xs">
                                {stat.slug}: {stat.value}%
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {persona.aiInsight ? (
                            <Badge className="bg-green-500">Yes</Badge>
                          ) : (
                            <Badge className="bg-gray-400">No</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDateTime(persona.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/personas/${persona.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

