export default function CaptureLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Camera Card Skeleton */}
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />

        {/* Tags Skeleton */}
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />

        {/* Buttons Skeleton */}
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

