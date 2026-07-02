"use client";

export default function AdminOrdersSkeleton() {
  return (
    <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-gray-500">
              {["Order", "User", "Total", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="px-3 py-2.5"><div className="h-4 w-24 rounded bg-white/5 animate-pulse" /></td>
                <td className="px-3 py-2.5"><div className="h-4 w-20 rounded bg-white/5 animate-pulse" /></td>
                <td className="px-3 py-2.5"><div className="h-4 w-16 rounded bg-white/5 animate-pulse" /></td>
                <td className="px-3 py-2.5"><div className="h-4 w-20 rounded bg-white/5 animate-pulse" /></td>
                <td className="px-3 py-2.5"><div className="h-4 w-16 rounded bg-white/5 animate-pulse" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
