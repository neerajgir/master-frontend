import Link from "next/link";
import { Suspense } from "react";

// app/shop/page.jsx  →  Server Component (no "use client")
//
// Yahan dekho:
//  - Server Component mein usePathname()/useParams() NAHI lagte (hooks client-only hain)
//  - Suspense import kiya gaya hai kyunki niche SearchBox client component hai
//    jo useSearchParams() use karta hai
const ShopPage = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shop Home</h1>
      <p className="text-gray-600">
        Ye ek Server Component hai. Params ke liye{" "}
        <Link href="/shop/electronics/iphone" className="underline">
          /shop/electronics/iphone
        </Link>{" "}
        jaise dynamic route par jao.
      </p>

      <Suspense fallback={<p>Loading search box...</p>}>
        <SearchBox />
      </Suspense>
    </div>
  );
};

export default ShopPage;

// ── Client child component (Suspense ke andar) ────────────────────
function SearchBox() {
  return (
    <p className="text-sm">
      Quick links:{" "}
      <Link href="/shop/search?q=iphone&category=electronics" className="underline">
        search with query params
      </Link>
    </p>
  );
}