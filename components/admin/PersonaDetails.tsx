'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Sparkles, User, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface PersonaDetailsProps {
  persona: {
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
  };
  canEdit: boolean;
}

export function PersonaDetails({ persona, canEdit }: PersonaDetailsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Form state
  const [title, setTitle] = useState(persona.title);
  const [description, setDescription] = useState(persona.description);
  const [statsJson, setStatsJson] = useState(JSON.stringify(persona.statsJson, null, 2));

  const handleSave = async () => {
    try {
      let parsedStats;
      try {
        parsedStats = JSON.parse(statsJson);
      } catch (e) {
        alert('Invalid JSON format for stats');
        return;
      }

      const response = await fetch(`/api/admin/personas/${persona.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          statsJson: parsedStats,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update persona');
        return;
      }

      router.refresh();
      setIsEditing(false);
      alert('Persona updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating the persona');
    }
  };

  const handleRegenerateInsight = async () => {
    if (!confirm('Are you sure you want to regenerate the AI insight? This will replace the current insight.')) {
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/admin/personas/${persona.id}/regenerate-insight`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to regenerate AI insight');
        return;
      }

      router.refresh();
      alert('AI insight regenerated successfully!');
    } catch (error) {
      console.error('Regenerate error:', error);
      alert('An error occurred while regenerating the AI insight');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/personas/${persona.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete persona');
        return;
      }

      router.push('/admin/personas');
      alert('Persona deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the persona');
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

  const getTopStats = (stats: any) => {
    if (!stats || typeof stats !== 'object') return [];
    const entries = Object.entries(stats) as [string, number][];
    return entries.sort(([, a], [, b]) => b - a);
  };

  const topStats = getTopStats(persona.statsJson);

  return (
    <div className="space-y-6">
      {/* Persona Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Persona Information
            </CardTitle>
            {canEdit && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRegenerateInsight}
                      disabled={isRegenerating}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                      {isRegenerating ? 'Regenerating...' : 'Regenerate AI Insight'}
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setTitle(persona.title);
                        setDescription(persona.description);
                        setStatsJson(JSON.stringify(persona.statsJson, null, 2));
                      }}
                    >
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
              <div className="font-medium">{persona.challenge.user.name || 'No name'}</div>
              <div className="text-sm text-gray-500">{persona.challenge.user.email}</div>
            </div>
            <Link href={`/admin/users/${persona.challenge.user.id}`}>
              <Button variant="ghost" size="sm">View User</Button>
            </Link>
            <Link href={`/admin/challenges/${persona.challenge.id}`}>
              <Button variant="ghost" size="sm">View Challenge</Button>
            </Link>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Persona title"
              />
            ) : (
              <div className="text-lg font-bold">{persona.title}</div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Persona description"
                rows={3}
              />
            ) : (
              <div className="text-sm text-gray-600">{persona.description}</div>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <Label>Stats (JSON)</Label>
            {isEditing ? (
              <Textarea
                value={statsJson}
                onChange={(e) => setStatsJson(e.target.value)}
                placeholder="Stats as JSON"
                rows={10}
                className="font-mono text-xs"
              />
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {topStats.map(([slug, value]) => (
                    <Badge key={slug} className="text-sm">
                      {slug}: {value}%
                    </Badge>
                  ))}
                </div>
                <details className="mt-2">
                  <summary className="text-sm text-gray-500 cursor-pointer">View Full JSON</summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(persona.statsJson, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="space-y-2">
            <Label>AI Insight</Label>
            {persona.aiInsight ? (
              <div className="p-3 bg-gray-50 rounded text-sm">{persona.aiInsight}</div>
            ) : (
              <div className="text-sm text-gray-400 italic">No AI insight generated</div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-sm text-gray-500 space-y-1">
            <div>Created: {formatDateTime(persona.createdAt)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

