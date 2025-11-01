export default function ResultLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2 mb-8">
          <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Persona Card Skeleton */}
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />

        {/* Buttons Skeleton */}
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

