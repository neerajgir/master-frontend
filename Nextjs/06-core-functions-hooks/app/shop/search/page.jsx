"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";

const SearchContent = () => {
    const searchParams = useSearchParams()
    const router = useRouter()

    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const tags = searchParams.getAll("tag")
    const allEntries = [...searchParams.entries()]

    const [text, setText] = useState(query ?? "")

    const handleSubmit = (e) => {
        e.preventDefault()
        router.push(`/shop/search?q=${encodeURIComponent(text)}`)
    }

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/shop/search?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Search Results (useSearchParams)</h1>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Search products..."
                    className="border p-2 rounded"
                />
                <button type="submit" className="bg-black text-white px-4 rounded">
                    Search
                </button>
            </form>

            <div className="space-y-1 text-sm">
                <p>q = <b>{query ?? "null"}</b></p>
                <p>category = <b>{category ?? "null"}</b></p>
                <p>tag (getAll) = <b>{tags.length ? tags.join(", ") : "null"}</b></p>
                <p>all entries = <code>{JSON.stringify(allEntries)}</code></p>
                <p>toString() = <code>{searchParams.toString() || "(empty)"}</code></p>
            </div>

            <div className="flex gap-2">
                <button onClick={() => updateParam("category", "electronics")} className="border px-3 py-1 rounded">
                    category = electronics
                </button>
                <button onClick={() => updateParam("category", "")} className="border px-3 py-1 rounded">
                    category clear
                </button>
            </div>
        </div>
    )
}

const SearchPage = () => {
    return (
        <Suspense fallback={<p>Loading search params...</p>}>
            <SearchContent />
        </Suspense>
    )
}

export default SearchPage