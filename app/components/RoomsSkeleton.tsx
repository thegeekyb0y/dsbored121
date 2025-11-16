// app/components/RoomsSkeleton.tsx
export function RoomsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-10 bg-gray-800 w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-800 w-48 animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-800 w-40 animate-pulse"></div>
      </div>

      {/* Rooms Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-krakedblue/20 border border-gray-800 p-6 animate-pulse"
          >
            {/* Room Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-800 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 w-20"></div>
              </div>
              <div className="h-6 bg-gray-800 w-12"></div>
            </div>

            {/* Room Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-800"></div>
                <div className="h-4 bg-gray-800 w-24"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-800"></div>
                <div className="h-4 bg-gray-800 w-32"></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="h-4 bg-gray-800 w-20"></div>
              <div className="h-5 w-5 bg-gray-800"></div>
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading rooms...</span>
    </div>
  );
}

// Room Detail Page Skeleton
export function RoomDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Back Button Skeleton */}
      <div className="h-6 bg-gray-800 w-32 mb-6 animate-pulse"></div>

      {/* Room Header Skeleton */}
      <div className="bg-[#1a1a1a] border border-gray-800 shadow-lg p-8 mb-6 animate-pulse">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="h-8 bg-gray-800 w-64 mb-2"></div>
            <div className="h-4 bg-gray-800 w-40"></div>
          </div>
          <div className="bg-gray-800/50 p-4 w-40 h-20"></div>
        </div>
        <div className="h-16 bg-gray-800/30"></div>
      </div>

      {/* Members Section Skeleton */}
      <div className="bg-[#1a1a1a] border border-gray-800 shadow-lg p-8 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-6 bg-gray-800"></div>
          <div className="h-7 bg-gray-800 w-48"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700"
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-gray-700"></div>

              {/* Member Info */}
              <div className="flex-1">
                <div className="h-5 bg-gray-700 w-32 mb-2"></div>
                <div className="h-4 bg-gray-700 w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading room details...</span>
    </div>
  );
}
