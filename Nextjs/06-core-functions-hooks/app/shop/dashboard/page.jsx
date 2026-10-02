"use client"
import React, { Suspense } from 'react'
import { useSearchParams } from "next/navigation"
import Link from "next/link"

// ── Tabs ka content: useSearchParams() use karta hai ──────────────
const DashboardTabs = () => {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "analytics"

  const tabs = [
    { key: "analytics", label: "Analytics" },
    { key: "sales", label: "Sales" },
    { key: "customers", label: "Customers" },
  ]

  return (
    <>
      <div className="flex gap-4 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/shop/dashboard?tab=${t.key}`}
            scroll={false}
            className={tab === t.key ? "font-bold underline" : "text-gray-400"}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div>
        {tab === "analytics" && <p>Showing Analytics Data</p>}
        {tab === "sales" && <p>Showing Sales Data</p>}
        {tab === "customers" && <p>Showing customers Data</p>}
      </div>
    </>
  )
}

const Dashboard = () => {
  // ⚠️ useSearchParams() ko Suspense boundary ke andar wrap karna ZAROORI hai,
  //    warna build time par prerender error aata hai:
  //    "useSearchParams() should be wrapped in a suspense boundary"
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard — useSearchParams() tabs</h1>
      <Suspense fallback={<p>Loading tabs...</p>}>
        <DashboardTabs />
      </Suspense>
    </div>
  )
}

export default Dashboard