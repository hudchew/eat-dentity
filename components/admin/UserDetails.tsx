'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface UserDetailsProps {
  user: {
    id: string;
    email: string;
    name: string;
    clerkId: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  stats: {
    totalChallenges: number;
    totalMeals: number;
    totalPersonas: number;
  };
  challenges: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
    mealsCount: number;
    hasPersona: boolean;
    persona: {
      id: string;
      title: string;
      createdAt: Date;
    } | null;
    createdAt: Date;
  }>;
}

export function UserDetails({ user, stats, challenges }: UserDetailsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      ABANDONED: 'bg-gray-100 text-gray-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Information</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.imageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Clerk ID</label>
                <p className="text-sm font-mono text-gray-600">{user.clerkId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">
                    {new Date(user.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.totalChallenges}</div>
              <div className="text-sm text-gray-600 mt-1">Total Challenges</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalMeals}</div>
              <div className="text-sm text-gray-600 mt-1">Total Meals</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{stats.totalPersonas}</div>
              <div className="text-sm text-gray-600 mt-1">Total Personas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Challenges ({challenges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No challenges yet</p>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">
                        {new Date(challenge.startDate).toLocaleDateString()} -{' '}
                        {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                      <Badge className={getStatusBadge(challenge.status)}>
                        {challenge.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>{challenge.mealsCount} meals</span>
                      {challenge.hasPersona && challenge.persona && (
                        <span className="text-pink-600">
                          Persona: {challenge.persona.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/challenges/${challenge.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
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

