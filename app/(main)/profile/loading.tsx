export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Profile Header Skeleton */}
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

