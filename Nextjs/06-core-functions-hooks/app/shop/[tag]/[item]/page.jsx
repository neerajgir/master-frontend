"use client"
import { useParams, usePathname, useRouter } from 'next/navigation'
import React from 'react'

const ShopTagItem = () => {
    const params = useParams()          // { tag: "electronics", item: "iphone" }
    const pathname = usePathname()      // "/shop/electronics/iphone"
    const router = useRouter()

    console.log(params)

    const related = ["electronics", "fashion", "grocery", "books"]
    const active = params?.tag

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">useParams() + usePathname() demo</h1>

            <div className="space-y-1 text-sm">
                <p>usePathname() → <code>{pathname}</code></p>
                <p>useParams()   → <code>{JSON.stringify(params)}</code></p>
                <p>params.tag    → <b>{params?.tag}</b></p>
                <p>params.item   → <b>{params?.item}</b></p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {related.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => router.push(`/shop/${tag}/mobile`)}
                        className={`border px-3 py-1 rounded ${tag === active ? "bg-black text-white" : ""}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <p className="text-xs text-gray-500">
                Tip: URL badlo → component re-render hoga, params naye values ke saath aayenge.
            </p>
        </div>
    )
}

export default ShopTagItem