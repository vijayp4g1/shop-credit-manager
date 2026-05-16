export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
        <p className="font-label-lg text-label-lg text-on-surface-variant">Loading...</p>
      </div>
    </div>
  );
}
