export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

