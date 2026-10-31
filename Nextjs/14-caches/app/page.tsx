import Image from "next/image";

export default function Home() {
  // Mock data representing standard cache operations
  const metrics = [
    { label: "Hit Rate", value: "94.2%", change: "+2.1%", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Miss Rate", value: "5.8%", change: "-0.4%", color: "text-rose-600 dark:text-rose-400" },
    { label: "Total Requests", value: "1.2M", change: "+12%", color: "text-blue-600 dark:text-blue-400" },
  ];

  const recentEvents = [
    { id: 1, action: "Cache Purged", target: "/api/products", time: "2 mins ago", status: "Success" },
    { id: 2, action: "Warm Up", target: "/blog/nextjs-cache", time: "15 mins ago", status: "Success" },
    { id: 3, action: "Eviction Rule Triggered", target: "LRU Policy", time: "1 hour ago", status: "System" },
  ];

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans text-zinc-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen">
      
      {/* Header Panel */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
            $
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cache Engine</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Next.js Data & ISR Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors">
            View Logs
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/10 transition-colors">
            Purge All Cache
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Metric Cards Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, i) => (
            <div key={i} className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold tracking-tight">{metric.value}</span>
                <span className={`text-xs font-semibold ${metric.color}`}>{metric.change}</span>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Operations Controls Panel */}
          <section className="md:col-span-1 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">On-Demand Revalidation Path</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="/shop/products" 
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800" 
                  />
                  <button className="px-3 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors">
                    Revalidate
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Cache Handler:</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Redis Cluster</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Stale-While-Revalidate:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Activity Log Table */}
          <section className="md:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold tracking-tight">Recent Cache Events</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">Target Path / Source</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{event.action}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{event.target}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{event.time}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.status === "Success" 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        
      </main>
    </div>
  );
}
