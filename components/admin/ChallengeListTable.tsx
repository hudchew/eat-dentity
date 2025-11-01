'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  Target,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Status } from '@prisma/client';

interface Challenge {
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
  _count: {
    meals: number;
  };
  persona: {
    id: string;
    title: string;
  } | null;
}

interface ChallengeListTableProps {
  challenges: Challenge[];
  total: number;
  currentPage: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
}

export function ChallengeListTable({
  challenges,
  total,
  currentPage,
  totalPages,
  search,
  statusFilter,
  dateFrom,
  dateTo,
}: ChallengeListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedStatus, setSelectedStatus] = useState(statusFilter);
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
    
    if (selectedStatus && selectedStatus !== 'ALL') {
      params.set('status', selectedStatus);
    } else {
      params.delete('status');
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
    router.push(`/admin/challenges?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setFromDate('');
    setToDate('');
    router.push('/admin/challenges');
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    router.push(`/admin/challenges?${params.toString()}`);
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
      month: 'short',
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
                placeholder="Search by user email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ABANDONED">Abandoned</SelectItem>
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
            {(search || statusFilter !== 'ALL' || dateFrom || dateTo) && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {challenges.length} of {total} challenges
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Meals
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Persona
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
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <Target className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No challenges found</p>
                    </td>
                  </tr>
                ) : (
                  challenges.map((challenge) => (
                    <tr key={challenge.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">
                            {challenge.user.name || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {challenge.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(challenge.startDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {formatDate(challenge.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(challenge.status)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {challenge._count.meals}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {challenge.persona ? (
                          <span className="text-green-600 font-medium">
                            {challenge.persona.title}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(challenge.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/challenges/${challenge.id}`}>
                            <Button variant="outline" size="sm">
                              View
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

