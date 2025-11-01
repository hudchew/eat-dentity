import { PersonaCollectionWrapper } from '@/components/features/PersonaCollectionWrapper';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function CollectionSkeleton() {
  return <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />;
}

export default function BadgePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white relative">
        <div className="flex items-center justify-center relative h-16">
          <h1 className="text-xl font-bold">My Badge</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <Suspense fallback={<CollectionSkeleton />}>
            <PersonaCollectionWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

