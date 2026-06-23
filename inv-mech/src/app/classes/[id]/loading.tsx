export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-3 w-32 animate-pulse rounded bg-black/5" />
      <div className="h-9 w-3/4 animate-pulse rounded bg-black/5" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-black/5" />
      <div className="space-y-2 pt-4">
        <div className="h-4 w-full animate-pulse rounded bg-black/5" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-black/5" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-black/5" />
      </div>
      <div className="h-11 w-32 animate-pulse rounded bg-black/5" />
    </div>
  );
}
