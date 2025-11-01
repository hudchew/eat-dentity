'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  History,
  Download,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

interface ActivityLogTableProps {
  activities: Activity[];
  total: number;
  currentPage: number;
  totalPages: number;
  search: string;
  adminFilter: string;
  entityTypeFilter: string;
  actionFilter: string;
  dateFrom: string;
  dateTo: string;
  admins: Array<{ id: string; label: string }>;
}

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'VIEW', label: 'View' },
  { value: 'EXPORT', label: 'Export' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Entities' },
  { value: 'User', label: 'User' },
  { value: 'Challenge', label: 'Challenge' },
  { value: 'Meal', label: 'Meal' },
  { value: 'Persona', label: 'Persona' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Admin', label: 'Admin' },
];

export function ActivityLogTable({
  activities,
  total,
  currentPage,
  totalPages,
  search,
  adminFilter,
  entityTypeFilter,
  actionFilter,
  dateFrom,
  dateTo,
  admins,
}: ActivityLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedAdmin, setSelectedAdmin] = useState(adminFilter);
  const [selectedEntityType, setSelectedEntityType] = useState(entityTypeFilter);
  const [selectedAction, setSelectedAction] = useState(actionFilter);
  const [fromDate, setFromDate] = useState(dateFrom);
  const [toDate, setToDate] = useState(dateTo);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }

    if (selectedAdmin && selectedAdmin !== 'ALL') {
      params.set('admin', selectedAdmin);
    } else {
      params.delete('admin');
    }

    if (selectedEntityType && selectedEntityType !== 'ALL') {
      params.set('entityType', selectedEntityType);
    } else {
      params.delete('entityType');
    }

    if (selectedAction && selectedAction !== 'ALL') {
      params.set('action', selectedAction);
    } else {
      params.delete('action');
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
    router.push(`/admin/activities?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAdmin('ALL');
    setSelectedEntityType('ALL');
    setSelectedAction('ALL');
    setFromDate('');
    setToDate('');
    router.push('/admin/activities');
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (adminFilter) params.set('admin', adminFilter);
    if (entityTypeFilter) params.set('entityType', entityTypeFilter);
    if (actionFilter) params.set('action', actionFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    router.push(`/admin/activities?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (adminFilter !== 'ALL') params.set('admin', adminFilter);
      if (entityTypeFilter !== 'ALL') params.set('entityType', entityTypeFilter);
      if (actionFilter !== 'ALL') params.set('action', actionFilter);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);

      const response = await fetch(`/api/admin/activities/export?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to export activities');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting activities');
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-500',
      UPDATE: 'bg-blue-500',
      DELETE: 'bg-red-500',
      VIEW: 'bg-gray-500',
      EXPORT: 'bg-purple-500',
    };
    return (
      <Badge className={colors[action] || 'bg-gray-500'}>{action}</Badge>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Activity Log</h2>
            <p className="text-sm text-gray-500">View all admin actions and activities</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by admin name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Admin Filter */}
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="All Admins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Admins</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Entity Type Filter */}
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Filter */}
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
            {(search || adminFilter !== 'ALL' || entityTypeFilter !== 'ALL' || actionFilter !== 'ALL' || dateFrom || dateTo) && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {activities.length} of {total} activities
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Entity ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <History className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No activities found</p>
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(activity.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm">{activity.admin.name}</div>
                          <div className="text-xs text-gray-500">{activity.admin.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getActionBadge(activity.action)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{activity.entityType}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {activity.entityId ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {activity.entityId.slice(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {activity.ipAddress || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedActivity(activity)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
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

        {/* Activity Details Dialog */}
        {selectedActivity && (
          <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Activity Details</DialogTitle>
                <DialogDescription>View detailed information about this activity</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Admin</Label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedActivity.admin.name}</div>
                    <div className="text-sm text-gray-500">{selectedActivity.admin.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Action</Label>
                    <div className="mt-1">{getActionBadge(selectedActivity.action)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Entity Type</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedActivity.entityType}</Badge>
                    </div>
                  </div>
                </div>

                {selectedActivity.entityId && (
                  <div>
                    <Label className="text-sm font-medium">Entity ID</Label>
                    <div className="mt-1">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {selectedActivity.entityId}
                      </code>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <div className="mt-1 text-sm">
                    {formatDateTime(selectedActivity.createdAt)}
                  </div>
                </div>

                {selectedActivity.ipAddress && (
                  <div>
                    <Label className="text-sm font-medium">IP Address</Label>
                    <div className="mt-1 text-sm">{selectedActivity.ipAddress}</div>
                  </div>
                )}

                {selectedActivity.userAgent && (
                  <div>
                    <Label className="text-sm font-medium">User Agent</Label>
                    <div className="mt-1 text-sm text-gray-600 break-all">
                      {selectedActivity.userAgent}
                    </div>
                  </div>
                )}

                {selectedActivity.details && (
                  <div>
                    <Label className="text-sm font-medium">Details</Label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedActivity.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

