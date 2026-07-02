"use client";

export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="h-48 bg-white/5 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
            <div className="h-8 w-24 rounded bg-white/5 animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
