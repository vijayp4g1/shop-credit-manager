export default function CustomersLoading() {
  return (
    <div className="min-h-screen bg-surface pb-24 px-margin-mobile pt-20 max-w-5xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 h-16 flex items-center justify-between px-margin-mobile">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high/50 animate-pulse"></div>
          <div className="space-y-1.5">
            <div className="w-16 h-2 bg-surface-container-high/50 rounded animate-pulse"></div>
            <div className="w-28 h-3.5 bg-surface-container-highest rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-high/50 animate-pulse"></div>
      </div>

      {/* Search Input Skeleton */}
      <div className="w-full h-14 bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] animate-pulse"></div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-20 h-8 rounded-full bg-surface-container-lowest border border-outline-variant/30 animate-pulse shrink-0"></div>
        ))}
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] p-5 flex flex-col justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-high/50"></div>
              <div className="w-16 h-3 bg-surface-container-high/50 rounded"></div>
            </div>
            <div className="w-28 h-8 bg-surface-container-highest/60 rounded"></div>
          </div>
        ))}
      </div>

      {/* List Items Skeleton */}
      <div className="space-y-3.5 pt-2">
        <div className="w-32 h-4 bg-surface-container-highest rounded mb-4 animate-pulse"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high/50"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-surface-container-highest rounded"></div>
                <div className="w-24 h-2.5 bg-surface-container-high/50 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-surface-container-highest rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
