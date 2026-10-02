"use client"
import React from 'react'
import {useSearchParams} from "next/navigation"
import Link from "next/link"

const Dashboard = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "analytics"
  return (
    <div>
    <h1 className="text-2xl font-bold mb-4">
    Dashboard
    </h1>
    <div className="flex gap-4 mb-6">
      <Link
      href="/shop/dashboard?tab=analytics"
      className={tab === "analytics" ? "font-bold underline": ""}
      >
        Analytics
      </Link>
      <Link
      href="/shop/dashboard?tab=sales"
      className={tab === "sales" ? "font-bold underline": ""}
      >
        Sales
      </Link>
      <Link
      href="/shop/dashboard?tab=customers"
      className={tab === "customers" ? "font-bold underline": ""}
      >
        Customers 
      </Link>
    </div>
    <div>
      {tab === "analytics" && <p>Showing Analytics Data</p>}
      {tab === "Sales" && <p>Showing Sales Data</p>}
      {tab === "customers" && <p>Showing customers Data</p>}
    </div>
    </div>
  )
}

export default Dashboard