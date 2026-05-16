// Reusable skeleton building blocks
export function SkeletonBox({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

export function SkeletonCircle({ size = "10" }: { size?: string }) {
  return <div className={`skeleton-shimmer rounded-full w-${size} h-${size} shrink-0`} />;
}

// Generic page shell for list-style pages (customers, ledger, expenses)
export function ListPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* AppBar skeleton */}
      <div className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle size="10" />
          <div className="space-y-1.5">
            <SkeletonBox className="w-16 h-2" />
            <SkeletonBox className="w-28 h-3.5" />
          </div>
        </div>
        <SkeletonCircle size="10" />
      </div>

      <div className="pt-20 px-4 max-w-5xl mx-auto space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <SkeletonBox className="h-28 rounded-[28px]" />
          <SkeletonBox className="h-28 rounded-[28px]" />
        </div>

        {/* Search bar */}
        <SkeletonBox className="h-14 rounded-[24px]" />

        {/* List items */}
        <div className="space-y-3 pt-2">
          <SkeletonBox className="w-36 h-3.5 mb-4" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-[24px]">
              <SkeletonCircle size="12" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="w-32 h-4" />
                <SkeletonBox className="w-20 h-2.5" />
              </div>
              <SkeletonBox className="w-20 h-7 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ledger-specific skeleton (has timeline dots)
export function LedgerPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 h-16 flex items-center gap-3 px-4">
        <SkeletonCircle size="10" />
        <div className="space-y-1.5">
          <SkeletonBox className="w-16 h-2" />
          <SkeletonBox className="w-28 h-3.5" />
        </div>
      </div>

      <div className="pt-20 px-4 max-w-5xl mx-auto space-y-5">
        {/* Hero balance card */}
        <SkeletonBox className="h-44 rounded-[32px] mt-2" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <SkeletonBox className="h-28 rounded-[28px]" />
          <SkeletonBox className="h-28 rounded-[28px]" />
        </div>

        {/* Search + filters */}
        <SkeletonBox className="h-12 rounded-2xl" />
        <div className="flex gap-2">
          <SkeletonBox className="flex-1 h-9 rounded-xl" />
          <SkeletonBox className="flex-1 h-9 rounded-xl" />
          <SkeletonBox className="flex-1 h-9 rounded-xl" />
        </div>

        {/* Timeline items */}
        <div className="space-y-4 pl-14 relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-surface-container-high rounded-full" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-[24px] space-y-2">
              <div className="flex justify-between">
                <SkeletonBox className="w-28 h-4" />
                <SkeletonBox className="w-16 h-6 rounded-full" />
              </div>
              <SkeletonBox className="w-40 h-2.5" />
              <SkeletonBox className="w-24 h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile skeleton
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Hero */}
      <div className="skeleton-shimmer h-[300px]" />
      <div className="px-4 -mt-12 flex items-end gap-4 mb-6">
        <SkeletonCircle size="24" />
        <div className="pb-2 space-y-2 flex-1">
          <SkeletonBox className="w-36 h-5" />
          <SkeletonBox className="w-48 h-3" />
        </div>
      </div>
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBox className="h-24 rounded-[24px]" />
          <SkeletonBox className="h-24 rounded-[24px]" />
          <SkeletonBox className="h-24 rounded-[24px]" />
          <SkeletonBox className="h-24 rounded-[24px]" />
        </div>
        <SkeletonBox className="h-48 rounded-[28px]" />
        <SkeletonBox className="h-36 rounded-[28px]" />
      </div>
    </div>
  );
}

// Reports skeleton
export function ReportsPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 h-16 flex items-center gap-3 px-4">
        <SkeletonCircle size="10" />
        <div className="space-y-1.5">
          <SkeletonBox className="w-16 h-2" />
          <SkeletonBox className="w-24 h-3.5" />
        </div>
      </div>
      <div className="pt-20 px-4 max-w-5xl mx-auto space-y-5">
        <SkeletonBox className="h-56 rounded-[32px] mt-2" />
        <SkeletonBox className="h-20 rounded-[32px]" />
        <SkeletonBox className="w-36 h-3.5" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-[24px]">
            <SkeletonCircle size="12" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="w-32 h-4" />
              <SkeletonBox className="w-20 h-2.5" />
            </div>
            <SkeletonBox className="w-20 h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
