import { SkeletonBox, SkeletonCircle } from "@/components/PageSkeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 h-16 flex items-center gap-3 px-4">
        <SkeletonCircle size="10" />
        <div className="space-y-1.5">
          <SkeletonBox className="w-16 h-2" />
          <SkeletonBox className="w-24 h-3.5" />
        </div>
      </div>
      <div className="pt-20 px-4 space-y-5">
        <SkeletonBox className="h-12 rounded-full mt-2" />
        <div className="grid grid-cols-3 gap-3">
          <SkeletonBox className="h-28 rounded-[24px]" />
          <SkeletonBox className="h-28 rounded-[24px]" />
          <SkeletonBox className="h-28 rounded-[24px]" />
        </div>
        <SkeletonBox className="h-12 rounded-xl" />
        <div className="space-y-4 pl-14">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-28 rounded-[24px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
