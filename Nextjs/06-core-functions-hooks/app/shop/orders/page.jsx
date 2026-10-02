"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const Orders = () => {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders — useRouter() methods</h1>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => router.push("/shop/products")} className="border px-3 py-1 rounded">
          push("/shop/products") — back works ✅
        </button>

        <button onClick={() => router.replace("/shop/products")} className="border px-3 py-1 rounded">
          replace("/shop/products") — history replace ⚠️
        </button>

        <button onClick={() => router.refresh()} className="border px-3 py-1 rounded">
          refresh() — same URL, data refetch
        </button>

        <button onClick={() => router.back()} className="border px-3 py-1 rounded">
          back()
        </button>

        <button onClick={() => router.forward()} className="border px-3 py-1 rounded">
          forward()
        </button>

        <button onClick={() => router.prefetch("/shop/dashboard")} className="border px-3 py-1 rounded">
          prefetch("/shop/dashboard")
        </button>
      </div>
    </div>
  )
}

export default Orders