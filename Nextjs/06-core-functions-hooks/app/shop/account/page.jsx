"use client"
import { useRouter, usePathname } from 'next/navigation'
import React from 'react'

const AccountPage = () => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">useRouter() Methods Demo</h1>
            <p className="text-sm text-gray-600">current pathname: <code>{pathname}</code></p>

            <div className="flex flex-wrap gap-2">
                <button onClick={() => router.push("/shop/dashboard")} className="border px-3 py-1 rounded">
                    push("/shop/dashboard") → back works ✅
                </button>

                <button onClick={() => router.replace("/shop/settings")} className="border px-3 py-1 rounded">
                    replace("/shop/settings") → history replace ⚠️
                </button>

                <button onClick={() => router.push("/shop/electronics/iphone", { scroll: false })} className="border px-3 py-1 rounded">
                    push with scroll:false
                </button>

                <button onClick={() => router.refresh()} className="border px-3 py-1 rounded">
                    refresh() (same URL, refetch data)
                </button>

                <button onClick={() => router.prefetch("/shop/products")} className="border px-3 py-1 rounded">
                    prefetch("/shop/products")
                </button>

                <button onClick={() => router.back()} className="border px-3 py-1 rounded">
                    back()
                </button>

                <button onClick={() => router.forward()} className="border px-3 py-1 rounded">
                    forward()
                </button>
            </div>

            <div className="text-xs text-gray-500">
                Tip: pehle push / replace karke history check karo, phir back/forward try karo.
            </div>
        </div>
    )
}

export default AccountPage