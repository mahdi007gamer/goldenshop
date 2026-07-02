"use client";

export default function OrderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 rounded-lg bg-white/5 animate-pulse" />
      <div className="rounded-xl border border-obsidian-lighter bg-obsidian-light p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-20 rounded bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
