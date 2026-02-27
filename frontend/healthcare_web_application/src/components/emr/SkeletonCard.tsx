export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-card space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 skeleton-pulse" />
          <div className="h-7 w-16 skeleton-pulse" />
        </div>
        <div className="h-10 w-10 skeleton-pulse rounded-lg" />
      </div>
      <div className="h-3 w-24 skeleton-pulse" />
    </div>
  );
}
