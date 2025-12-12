export default function RoomCardSkeleton() {
  return (
    <div className="animate-pulse bg-white/60 rounded-3xl overflow-hidden shadow-md">
      <div className="h-48 bg-slate-200"></div>

      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
        <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}
