"use client";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-obsidian text-gray-200">
      <div className="smoke" />
      <div className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="h-10 w-48 rounded-lg bg-white/5 animate-pulse mb-10" />
        <div className="flex items-center gap-2 mt-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" />
              <div className="h-3 w-16 rounded bg-white/5 animate-pulse hidden sm:block" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                </div>
                <div className="h-8 w-20 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-white/5 animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
