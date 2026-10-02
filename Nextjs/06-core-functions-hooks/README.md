
# Core Functions & Hooks — `next/navigation` (Navigation Deep Dive)

> **Series #06 — Next.js App Router ke navigation tools.**
> Yahan hum seekhenge ki `useParams`, `usePathname`, `useSearchParams`, `useRouter`, `redirect()` — ye sab kaise kaam karte hain, kab kaunsa use karna hai, aur `redirect()` vs `router.push()` mein asli farak kya hai. Sab kuch **Hinglish** mein, repo ke **real code** ke saath, diagrams aur real-life use cases ke saath.

![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=flat-square)
![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square)
![App Router](https://img.shields.io/badge/Router-App%20Router-000000?style=flat-square)

---

## 📚 Table of Contents

| # | Topic | Kya milega |
|---|-------|-----------|
| 1 | [Introduction — Router kya hai?](#1-introduction--router-kya-hai) | Problem + solution |
| 2 | [Project Structure](#2-project-structure-is-repo-ka) | Kaunsi file kahan hai |
| 3 | [`next/navigation` vs `next/router`](#3-nextnavigation-vs-nextrouter) | App Router vs Pages Router |
| 4 | [`"use client"` — golden rule](#4-use-client--golden-rule) | Kab hook lagana hai |
| 5 | [`usePathname()`](#5-usepathname) | Current URL path |
| 6 | [`useParams()`](#6-useparams) | Dynamic route params |
| 7 | [`useSearchParams()`](#7-usesearchparams) | Query string `?a=1` |
| 8 | [`useRouter()` + all methods](#8-userouter--all-methods) | push, replace, back, forward, refresh, prefetch |
| 9 | [`redirect()` function](#9-redirect-function) | Server + client redirect |
| 10 | [**redirect vs router.push** — full comparison](#10-redirect-vs-routerpush--full-comparison) | Table + diagram + code |
| 11 | [`notFound()` + `permanentRedirect()`](#11-notfound--permanentredirect) | Error flow |
| 12 | [Server side navigation tools](#12-server-side-navigation-tools) | `params`, cookies, headers |
| 13 | [Link vs router.push vs redirect](#13-link-vs-routerpush-vs-redirect) | Kab kya |
| 14 | [Scroll behaviour & smooth UX](#14-scroll-behaviour--smooth-ux) | `scroll: false` |
| 15 | [Common Mistakes & Pitfalls](#15-common-mistakes--pitfalls) | Real galtiyan |
| 16 | [Diagram Explanations](#16-diagram-explanations) | Flow charts |
| 17 | [Real-Life Usages](#17-real-life-usages) | Production patterns |
| 18 | [Quick Cheat Sheet](#18-quick-cheat-sheet) | Revision |
| 19 | [Running This Project](#19-running-this-project) | Setup |
| 20 | [Practice Tasks & Next Steps](#20-practice-tasks--next-steps) | Homework 🙂 |

---

## 1. Introduction — Router kya hai?

### Problem kya hai?

Browser mein URL badalna hota hai page badalne ke liye. Lekin Next.js mein hum **directly `window.location.href = "/shop"` set nahi karte**. Kyun? Kyunki poora page reload ho jayega, poori React app dobara bundle hogi, aur App Router ka magic (layout preserve, streaming, prefetching) barbaad ho jayega.

Next.js ko ek **smart router** chahiye jo:

1. Sirf badla hua part render kare (layout/sidebar dobara na bane)
2. Data pehle se fetch kare (prefetch) — click karte hi instant feel ho
3. Server aur Client dono mein kaam kare
4. Params/query strings ko React state ki tarah expose kare

**Yahi `next/navigation` deta hai.**

### Ek line mein

> `next/navigation` = App Router ka navigation API. Client side par ye **hooks** deta hai (`usePathname`, `useParams`, `useSearchParams`, `useRouter`), aur Server side par ye **functions** deta hai (`redirect`, `permanentRedirect`, `notFound`).

### Sabse simple example

```jsx
// app/page.js  (Server Component)
import { redirect } from "next/navigation";

const Home = () => {
  const isLoggedIn = true;      // maan lo user logged in NAHI hai
  if (!isLoggedIn) {
    redirect("/login");          // browser ko bhej do /login par
  }
  return <div>Dashboard</div>;
};
export default Home;
```

---

## 2. Project Structure (is repo ka)

```
06-core-functions-hooks/
├── app/
│   ├── layout.js                      → Root layout (html/body)
│   ├── page.js                        → redirect() demo (toggle isLoggedIn)
│   ├── not-found.jsx                  → Custom 404 page 🆕
│   ├── login/
│   │   └── page.jsx                   → redirect ka destination
│   └── shop/
│       ├── layout.jsx                 → Shop layout (Sidebar + children)
│       ├── page.jsx                   → Server Component demo
│       ├── dashboard/page.jsx         → useSearchParams tabs (Suspense ke saath)
│       ├── orders/page.jsx            → useRouter() methods demo
│       ├── products/page.jsx
│       ├── settings/page.jsx
│       ├── search/page.jsx            → useSearchParams() full demo 🆕
│       ├── account/page.jsx           → push/replace/back/forward/refresh demo 🆕
│       └── [tag]/
│           └── [item]/
│               └── page.jsx           → useParams + usePathname demo
├── components/
│   └── sidebar.jsx                    → Active link (usePathname)
└── README.md
```

> ⚠️ Ek important seekne wali baat: is repo ka pehla build **fail** hua tha kyunki `dashboard/page.jsx` mein `useSearchParams()` bina `<Suspense>` ke use ho raha tha. Usne prerender error diya. Fix karke hi build pass hua — isliye README mein Suspense section detail se hai.

### Flow samjho

```
User clicks "/shop"
        │
        ▼
app/shop/layout.jsx  ──►  <Sidebar /> + <main>{children}</main>
        │                       │
        │                       └── usePathname() → active link highlight
        ▼
children page render hota hai
        │
        ▼
Sidebar ka Link click → Next.js router intercept karta hai (full reload NAHI)
        │
        ├── hover pe prefetch → data pehle se ready
        ▼
app/shop/dashboard/page.jsx render (layout NAHI dobara bana)
```

**Key point:** Layout sirf ek baar banta hai, page badalta hai. Isiliye `sidebar.jsx` mein `usePathname()` se active state update hota hai — component dobara mount nahi hota, sirf re-render hota hai.

---

## 3. `next/navigation` vs `next/router`

| Feature | `next/navigation` (App Router ✅) | `next/router` (Pages Router ❌) |
|---|---|---|
| Import | `from "next/navigation"` | `from "next/router"` |
| Current path | `usePathname()` | `router.pathname` |
| Params | `useParams()` | `router.query` |
| Query string | `useSearchParams()` | `router.query` |
| Merged `query` object | ❌ (dono alag) | ✅ |
| Redirect | `redirect()` (server + client) | ❌ (custom hota tha) |
| `isReady` check | ❌ zaruri nahi | ✅ |
| `router.events` | ❌ | ✅ |

> ⚠️ **Interview trap:** `router.query` Pages Router mein hai, App Router mein **nahi**. Yahan params aur query params **alag-alag hooks** se aate hain.

---

## 4. `"use client"` — golden rule

App Router mein **har component by default Server Component hai**. Hooks (`useState`, `useEffect`, `useParams`, `usePathname`…) sirf Client Component mein chalte hain.

```jsx
"use client"   // ← file ki PEHLI line, imports se bhi pehle
import { usePathname } from "next/navigation";
```

### 3 Rules yaad rakho

```
RULE 1: "use client" file ke bilkul upar hona chahiye (imports se pehle)
RULE 2: File "use client" ho gayi toh uske SAARE imports usi client bundle mein chale jaate hain
RULE 3: Server → Client data transfer hota hai PROPS se, hooks se nahi
```

### `redirect()` exception

Hooks sirf Client Component mein chalte hain — lekin `redirect()` **server-first** function hai:

```jsx
// app/page.js — Server Component (no "use client")
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/login");    // ✅ Server par legal — yahi official tarika hai
}
```

```jsx
// Client Component mein turant navigate karna ho toh router use karo
"use client";
import { useRouter } from "next/navigation";

export default function ClientNav() {
  const router = useRouter();
  return <button onClick={() => router.push("/login")}>Login</button>;
}
```

> 📌 Client Component mein `redirect()` official tarike se Server Action ke through handle hota hai. Event handler ke andar turant navigate karna ho toh `router.push()` hi sahi choice hai.

---

## 5. `usePathname()`

### Kya hai?

Current URL ka **path** (query string ke bina) — aur yeh **reactive** hai. Path badalte hi component re-render hota hai.

```jsx
"use client";
import { usePathname } from "next/navigation";

const Home = () => {
  const pathname = usePathname();
  return <h1>Current PathName: {pathname}</h1>;
};
export default Home;
```

### Real output examples

| URL user ne open kiya | `usePathname()` returns |
|---|---|
| `http://localhost:3000/` | `/` |
| `http://localhost:3000/shop/products` | `/shop/products` |
| `http://localhost:3000/shop/electronics/iphone?sort=asc` | `/shop/electronics/iphone` |

**Query string nahi aata** — sirf path.

### Real-Life Use #1: Active sidebar link (is repo mein!)

```jsx
// components/sidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/shop/dashboard" },
    { name: "Orders",    href: "/shop/orders" },
    { name: "Products",  href: "/shop/products" },
    { name: "Settings",  href: "/shop/settings" },
  ];

  return (
    <nav>
      {navItems.map((item) => {
        const isActive = pathname === item.href;   // ← yahi kaam
        return (
          <Link
            href={item.href}
            key={item.name}
            className={`p-2 rounded-md ${
              isActive ? "bg-white text-black font-semibold" : "hover:bg-gray-700"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};
export default Sidebar;
```

### Smart Active Check (nested routes ke liye)

```jsx
const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
```

`/shop/orders/123` par bhi "Orders" highlight hona chahiye — upar wala simple `===` se ye nahi hota. Real production apps mein `startsWith` wala pattern use karo.

### Real-Life Use #2: Breadcrumb

```jsx
"use client";
import { usePathname } from "next/navigation";

const Breadcrumb = () => {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && " / "}
          <span className={i === parts.length - 1 ? "font-bold" : "text-gray-500"}>
            {p}
          </span>
        </span>
      ))}
    </nav>
  );
};
export default Breadcrumb;
```

### Real-Life Use #3: Route guards ke liye path check

```jsx
const pathname = usePathname();
const isPublic = ["/login", "/signup"].includes(pathname);
if (!isPublic && !token) router.replace("/login");
```

### ⚠️ Note

`usePathname()` ko `"use client"` chahiye. Agar tumhe sirf pathname chahiye **render ke liye** (sidebar styling, breadcrumb), toh ek chhota Client Component bana do — poori page ko client banana zaroori nahi.

---

## 6. `useParams()`

### Kya hai?

Dynamic route segments (`[tag]`, `[id]`) ke **URL params** ko ek object ke roop mein deta hai. Key folder se banti hai: `[id]` → `params.id`.

### Setup — dynamic route banao

```
app/shop/[tag]/[item]/page.jsx
          └──┬──┘ └──┬──┘
       folder ka naam = param ka key
```

### Repo ka real code

```jsx
// app/shop/[tag]/[item]/page.jsx
"use client";
import { useParams, usePathname } from "next/navigation";

const ShopTagItem = () => {
  const params = useParams();          // { tag: "electronics", item: "iphone" }
  const pathname = usePathname();      // "/shop/electronics/iphone"

  console.log(params);
  return <div>ShopTagItem: {pathname}</div>;
};
export default ShopTagItem;
```

### Real output examples

| URL | `useParams()` returns |
|---|---|
| `/shop/electronics/iphone` | `{ tag: "electronics", item: "iphone" }` |
| `/shop/fashion/shoes` | `{ tag: "fashion", item: "shoes" }` |
| `/blog/hello-world` (route `[slug]`) | `{ slug: "hello-world" }` |

### `params` object vs single value

```jsx
const params = useParams();      // poora object (recommended)
const tag = useParams().tag;    // specific value (rarely used)
```

### Real-Life Use #1: Detail page fetch

```jsx
"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProductPage() {
  const { item } = useParams();            // item = "iphone"
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${item}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [item]);                              // ← dependency bahut zaroori

  if (!product) return <p>Loading...</p>;
  return <div><h1>{product.name}</h1><p>₹{product.price}</p></div>;
}
```

⚠️ `useEffect` dependency array mein `[item]` daalna mat bhoolna — warna stale product dikhega.

### Real-Life Use #2: Catch-all route `[...slug]`

```
app/docs/[...slug]/page.jsx
```

| URL | `useParams()` |
|---|---|
| `/docs/a` | `{ slug: ["a"] }` |
| `/docs/a/b/c` | `{ slug: ["a", "b", "c"] }` |

```jsx
const { slug } = useParams();
const path = slug?.join("/") ?? "";
```

### Real-Life Use #3: Optional catch-all `[[...slug]]`

```
app/shop/[[...filters]]/page.jsx
```

| URL | `useParams()` |
|---|---|
| `/shop` | `{}` (params mein `filters` **undefined** hai) |
| `/shop/electronics/phone` | `{ filters: ["electronics", "phone"] }` |

Isliye hamesha `slug?.join()` use karo, `slug.join()` nahi.

### Server Component mein (better for SEO)

Server Component mein hook nahi lagta — wahan `params` **prop** hota hai:

```jsx
// app/shop/[tag]/[item]/page.jsx  (NO "use client")
export default async function Page({ params }) {
  const { tag, item } = await params;    // Next 15+ : params async hai
  const product = await fetch(`/api/products/${item}`).then((r) => r.json());

  return <h1>{product.name}</h1>;        // SEO friendly, no loading state needed
}
```

**Rule of thumb:** Data fetch ke liye **Server Component + `params` prop**, sirf interactivity ke liye Client Component + `useParams()`.

---

## 7. `useSearchParams()`

### Kya hai?

URL ke `?` ke baad wala part — **query string** — ko `URLSearchParams` object mein deta hai.

```
/shop/products?category=electronics&sort=asc&page=2
                 └──────────────┬──────────────┘
                          useSearchParams() ka data
```

### Demo page (is repo mein)

```jsx
// app/shop/search/page.jsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query   = searchParams.get("q");        // string | null
  const all     = searchParams.getAll("tag");   // string[]
  const entries = [...searchParams.entries()];   // [["q","iphone"], ...]

  const [text, setText] = useState(query ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/shop/search?q=${encodeURIComponent(text)}`);
  };

  return (
    <div>
      <h1>Search Results</h1>
      <p>Query: {query ?? "kuch nahi"}</p>
      <form onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search products..."
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};
export default SearchPage;
```

### Saare Useful Methods

| Method | Kya karta hai | Example URL: `?q=iphone&tag=a&tag=b` |
|---|---|---|
| `.get("q")` | pehli value (string \| null) | `"iphone"` |
| `.getAll("tag")` | saari values (array) | `["a", "b"]` |
| `.has("q")` | key hai ya nahi (boolean) | `true` |
| `.toString()` | poora query string | `"q=iphone&tag=a&tag=b"` |
| `.entries()` | `[key, value]` pairs | — |
| `.keys()` | sirf keys | `["q","tag","tag"]` |

### `useParams()` vs `useSearchParams()` — confusion mat karo

| | `useParams()` | `useSearchParams()` |
|---|---|---|
| URL part | `/shop/[tag]/[item]` | `?tag=x&sort=y` |
| Folder se banta hai? | ✅ Haan (`[tag]`) | ❌ Nahi |
| Change hone par rerender? | ✅ | ✅ |
| SEO friendly? | ✅ | ⚠️ (mostly) |

```jsx
const params = useParams();          // { tag: "electronics", item: "iphone" }  ← path se
const search = useSearchParams();     // ?sort=asc&page=2                        ← query se
```

### Real-Life Usage: Filters + Sorting + Pagination

```jsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";

const ProductFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // helper: URL update karo naye params ke saath
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const sort = searchParams.get("sort") ?? "newest";

  return (
    <div>
      <button onClick={() => updateParam("sort", "price_asc")}>Price ↑</button>
      <button onClick={() => updateParam("sort", "price_desc")}>Price ↓</button>
      <p>Currently sorting by: <b>{sort}</b></p>
    </div>
  );
};
export default ProductFilters;
```

**`new URLSearchParams(searchParams.toString())`** — yehi pattern har jagah use hota hai taaki existing filters na udein.

### ⚠️ Suspense Warning

`useSearchParams()` static-rendered (prerendered) pages par error de sakta hai:
`useSearchParams() should be wrapped in a suspense boundary`

Fix:

```jsx
import { Suspense } from "react";

```jsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SearchContent />
    </Suspense>
  );
}
```

### Server Component mein searchParams

```jsx
// app/shop/search/page.jsx  (Server Component — hooks nahi!)
export default async function Page({ searchParams }) {
  const { q, category } = await searchParams;   // Next 15+ async
  const results = await searchDB(q, category);
  return <div>{results.length} results for {q}</div>;
}
```

---

## 8. `useRouter()` + all methods

### Kya hai?

`useRouter()` ek lightweight object deta hai jisme navigation + route-change related properties/methods hote hain.

```jsx
"use client";
import { useRouter } from "next/navigation";

const Nav = () => {
  const router = useRouter();
  return <button onClick={() => router.push("/shop/dashboard")}>Go</button>;
};
```

### Available Methods & Properties

| Method / Property | Type | Kya karta hai |
|---|---|---|
| `router.push(href)` | method | Naya route push karta hai, **browser history mein entry add** hoti hai |
| `router.replace(href)` | method | Same route replace karta hai, **history entry add nahi** hoti |
| `router.refresh()` | method | Current page ka data dobara fetch karta hai (server components) |
| `router.back()` | method | History mein peeche |
| `router.forward()` | method | History mein aage |
| `router.prefetch(href)` | method | Data pehle se load karta hai |
| `router.push(href, { scroll })` | options | `scroll: false` → scroll position bacha lo |
| `pathname` | property | Current path |
| `searchParams` | property | Current query string object |

### push vs replace — asli farak

```
History stack:  [ /home ]  [ /login ]  [ /shop/products ]
                                        ↑ current

router.push("/cart")   → [ /home ] [ /login ] [ /shop/products ] [ /cart ]
                         Back button → /shop/products  ✅

router.replace("/cart") → [ /home ] [ /login ] [ /cart ]
                           Back button → /login  ⚠️ (shop/products hat gaya)
```

**Kab kya?**
- `push` → naya page, user wapas aa sakta hai (nav links, product detail)
- `replace` → replacement flow, wapas nahi aana (login → dashboard, step 2 → step 3)

### Real-Life Example: Login flow with replace

```jsx
"use client";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.replace("/dashboard");   // ← replace, taaki back se login page na dikhe
      router.refresh();                // ← server data fresh karo (auth state)
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
};
```

### Real-Life Example: Multi-step form with replace

```jsx
const router = useRouter();

const next = () => router.replace(`/onboarding?step=${step + 1}`, { scroll: false });
// step 1 → 2 → 3, back button se step nahi ghata
```

### `refresh()` kab use karte hain?

Jab server data change ho but URL same rahe:

```jsx
"use client";
import { useRouter } from "next/navigation";

const AddToCartButton = () => {
  const router = useRouter();

  const addToCart = async () => {
    await fetch("/api/cart", { method: "POST", body: JSON.stringify({ item }) });
    router.refresh();   // page ke server components dobara fetch honge → cart count update
  };

  return <button onClick={addToCart}>Add to Cart</button>;
};
```

### `prefetch()` manually

Usually `<Link>` khud prefetch kar deta hai (viewport par / hover par). Manual prefetch tab karo jab tumhe custom trigger chahiye:

```jsx
"use client";
import { useRouter } from "next/navigation";

const HoverPrefetch = ({ slug }) => {
  const router = useRouter();
  return <div onMouseEnter={() => router.prefetch(`/product/${slug}`)}>...</div>;
};
```

---

## 9. `redirect()` function

### Definition

`redirect()` ek **server-side** function hai jo browser ko turant kisi aur URL par bhej deta hai. Ye render ko **interrupt** karta hai — page ka baqi render hota hi nahi.

### Server Component mein (official + recommended)

```jsx
// app/page.js  (repo ka real code)
import { redirect } from "next/navigation";

const Home = () => {
  const isLoggedIn = true;
  if (!isLoggedIn) {
    redirect("/login");
  }
  return <div>Current Pathname</div>;
};
export default Home;
```

### Server Action mein

```jsx
// app/actions.js
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProduct(formData) {
  await db.products.create({ name: formData.get("name") });

  revalidatePath("/shop/products");   // cache refresh
  redirect("/shop/products");         // naye product ke saath list par bhejo
}
```

### Auth guard + Server Component pattern (real production)

```jsx
// app/shop/dashboard/page.jsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/shop/dashboard");   // login ke baad wapas yahi
  }

  return <h1>Welcome, {session.user.name}</h1>;
}
```

### Client side action ke baad navigate

```jsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DeleteButton = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch("/api/products/" + id, { method: "DELETE" });

    if (res.ok) {
      router.replace("/shop/products");
      router.refresh();
    } else {
      setLoading(false);
      alert("Delete failed");
    }
  };

  return <button onClick={handleDelete} disabled={loading}>
    {loading ? "Deleting..." : "Delete"}
  </button>;
};
```

### `redirect` vs `permanentRedirect`

| | `redirect()` | `permanentRedirect()` |
|---|---|---|
| HTTP status | `307 Temporary Redirect` | `308 Permanent Redirect` |
| SEO | Search engine follow karega | Search engine URL replace kar dega |
| Kab use | Temporary (login, error) | `/old-page` → `/new-page` migrate |

```jsx
import { permanentRedirect } from "next/navigation";

// Purane blog URL ko naye par migrate kar rahe ho
permanentRedirect("/blog/2023/hello-world");
```

---

## 10. redirect vs router.push — full comparison

Yeh sabse important section hai. Dhyaan se padho.

### Core difference

| Aspect | `redirect()` | `router.push()` |
|---|---|---|
| **Kahan kaam karta hai** | Server Component / Server Action | Sirf Client Component |
| **Kab run hota hai** | Render ke dauraan (render phase) | Event handler / click ke baad |
| **History** | Replace-style | **Push** — nayi entry add hoti hai |
| **Browser Back** | Redirect ke baad back = seedha pehle wale page par | Back se wapas jaate ho ✅ |
| **JS bundle** | Server par, extra JS nahi | Client par JS chahiye |
| **Interactivity** | ❌ Sirf render flow | ✅ Events ke andar |
| **Async** | Ho sakta hai (data fetch ke baad) | Normal |
| **Condition timing** | Render-time | Jab tum call karo |
| **"use client"** | ❌ nahi chahiye | ✅ chahiye |

### Diagram: `redirect()` flow

```
Request: GET /
   │
   ▼
Server render start (app/page.js)
   │
   ├─ const isLoggedIn = false
   ├─ if (!isLoggedIn) redirect("/login")
   │        │
   │        ▼
   │   redirect() THROWS a special error
   │        │
   │        ▼
   │   Render TURANT interrupt
   │        │
   │        ▼
   │   Browser ko 307 response → Location: /login
   │        │
   │        ▼
Browser URL = /login, Server renders LoginPage
   │
   ▼
User sees LoginPage (intermediate page NEVER rendered)
```

**Key:** Yeh render ke **beech** mein hota hai. Kyunki `redirect()` throw karta hai, uske neeche ka code (`return <div>`) kabhi execute nahi hota.

### Diagram: `router.push()` flow

```
App already loaded: Server + Client dono ready
   │
   ▼
User clicks "Login"
   │
   ▼
Event handler runs (client JS)
   │
   ├─ await fetch("/api/login")  → server round-trip
   ├─ router.push("/dashboard")  → App Router ko bolo: navigate karo
   │        │
   │        ▼
   │   Client router intercepts (NO full page reload)
   │        │
   │        ├─ fetch RSC payload for /dashboard
   │        ├─ update history stack  [ / , /login , /dashboard ]
   │        ├─ re-render only page components (layouts kept)
   │        └─ scroll to top
   │        ▼
   │   New UI rendered
   ▼
State preserved, React tree intact
```

### Side-by-side code

```jsx
// ══════════ redirect() ══════════
// app/dashboard/page.jsx  (SERVER component — no "use client")
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");   // server decide karta hai
  return <h1>Dashboard</h1>;
}
```

```jsx
// ══════════ router.push() ══════════
// components/LoginButton.jsx  (CLIENT component)
### Decision Tree — kab kya?

```
Kya tum Server Component ho (no "use client")?
   │
   ├─ YES → redirect() ✅
   │        (auth check, 404, data ke baad redirect, Server Action)
   │
   └─ NO (Client Component)
        │
        Kya user ke action ke baad navigate karna hai?
        │   (button click, form submit, API success ke baad)
        │
        ├─ YES → router.push() ya router.replace()
        │
        Kya yeh render-time guard hai
        (component load hote hi check)?
        │
        └─ Server ho to redirect(), client me router.replace()
```

### Practical scenarios table

| Scenario | Kya use karein | Kyun |
|---|---|---|
| Auth check before render | `redirect()` | Server pe decide, page flash nahi hona chahiye |
| Login submit ke baad | `router.replace()` | Client action, back na chale login pe |
| Sidebar/nav links | `<Link>` | Declarative + prefetch |
| Form submit success → list | `redirect()` (Server Action) ya `router.replace()` | Action ke baad navigate |
| Data fetch ke baad redirect | `redirect()` | Async render flow |
| Modal open/close with URL | `router.replace()` | History clean rakhte hain |
| Sidebar link active highlight | `usePathname()` | Sirf read karna hai |
| Filter apply karte waqt | `router.push(..., { scroll: false })` | Query update, scroll jump nahi |

### Sabse bada confusion: "history behaviour"

```jsx
// redirect() — server se
// Browser history: back button se wapas nahi ja sakte
// Kyunki server ne 307 bheja, browser ne redirect follow kiya

// router.push() — client se
// Browser history: back button se WAPAS ja sakte ho ✅
// Kyunki yeh ek navigation history entry add karta hai
```

> **Yaad rakho:**
> `router.push()` → History mein naya entry → Back se wapas aa sakte ho.
> `redirect()` → Server-level redirect → effectively replace → Back se wapas nahi (usually).

### ⚠️ Trap: condition ki direction

```jsx
// ❌ WRONG — condition ulat di
export default async function Page() {
  if (session) redirect("/login");   // logged-in ko login par bhej raha?!
}

// ✅ RIGHT — guard condition
export default async function Page() {
  if (!session) redirect("/login");
}
```

### ⚠️ Trap: `redirect()` ko try/catch mein mat pakdo

```jsx
// ❌ WRONG
try {
  redirect("/login");
} catch (e) {
  console.log(e);   // yeh error PAKAD lega → redirect ruk jayega!
}

// ✅ RIGHT — redirect ke baad try/catch use mat karo
if (!session) redirect("/login");
```

`redirect()` internally ek error **throw** karta hai. Isiliye upar ka `try/catch` use karne se redirect kaam hi nahi karega.

---

## 11. `notFound()` + related error functions

### `notFound()`

Resource exist nahi karta → 404 page render karo. Server Component mein.

```jsx
// app/shop/[tag]/[item]/page.jsx
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { item } = await params;
  const product = await getProduct(item);

  if (!product) {
    notFound();   // 404
  }

  return <h1>{product.name}</h1>;
}
```

`notFound()` bhi `redirect()` ki tarah **throw** karta hai aur render interrupt karta hai.

```jsx
// app/not-found.jsx  (custom 404)
export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Product not found</p>
      <Link href="/shop/products">Back to products</Link>
    </div>
  );
}
```

### Poora error function family

| Function | HTTP Status |Kab use |
|---|---|---|
| `redirect()` | 307 | Temporary redirect (login, guard) |
| `permanentRedirect()` | 308 | Permanent URL migration (SEO) |
| `notFound()` | 404 | Resource nahi mila |
| `forbidden()` | 403 | Authenticated but not allowed |
| `unauthorized()` | 401 | Login hi nahi kiya |

```jsx
import { forbidden, unauthorized } from "next/navigation";

export default async function Page() {
  const user = await getUser();
  if (!user) unauthorized();                 // 401

  if (user.role !== "admin") forbidden();    // 403

  return <AdminPanel />;
}
```

### `notFound()` vs `redirect()`

| | `notFound()` | `redirect()` |
|---|---|---|
| Status | 404 | 307 |
| User ko dikhta hai | Custom `not-found.jsx` page | Destination page |
| Kab | Record nahi mila | Access nahi hai / flow move karna hai |

```jsx
// ✅ Pattern: check → notFound
const product = await getProduct(id);
if (!product) notFound();

// ✅ Pattern: check → redirect
const session = await getSession();
if (!session) redirect("/login");
```

---

## 12. Server side navigation tools

Server Components mein hooks nahi lagte — wahan **props aur async functions** kaam karte hain.

### `params` (Server Component)

```jsx
// app/blog/[slug]/page.jsx
export default async function BlogPost({ params }) {
  const { slug } = await params;      // Next 15+ : await zaroori hai
  const post = await getPost(slug);
  if (!post) notFound();
  return <article>{post.content}</article>;
}
```

> ⚠️ Next.js 15+ mein `params` aur `searchParams` **Promise** ban gaye hain. `await params` likhna mat bhoolna. Pages Router aur Next 14 mein ye synchronous the.

### `searchParams` (Server Component)

```jsx
// app/shop/products/page.jsx
export default async function Products({ searchParams }) {
  const { sort, page = "1" } = await searchParams;
  const products = await getProducts({ sort, page });
  return <ProductList products={products} />;
}
```

### Server-only helpers

```jsx
import { cookies, headers } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();     // Next 15+ : async
  const token = cookieStore.get("token")?.value;

  const h = await headers();
  const ua = h.get("user-agent");

  if (!token) redirect("/login");
  return <Dashboard token={token} ua={ua} />;
}
```

### Server vs Client — mapping table

| Kaam | Server Component | Client Component |
|---|---|---|
| Current path | `headers()` se request URL | `usePathname()` |
| Dynamic params | `params` prop | `useParams()` |
| Query params | `searchParams` prop | `useSearchParams()` |
| Navigate | `redirect()` | `router.push()` |
| Token read | `cookies()` | `document.cookie` (sirf non-httpOnly) |

### Kab kya choose karein?

```
Data fetching / SEO / auth guard chahiye   → SERVER Component (params prop, redirect)
Interactive UI (tabs, modals, filters)     → CLIENT Component (useParams, useSearchParams)
Dono chahiye                               → Server se data lo, Client ko props do
```

---

## 13. Link vs router.push vs redirect

| | `<Link>` | `router.push()` | `redirect()` |
|---|---|---|---|
| Type | Component | Method | Function |
| Where | Server + Client | Client only | Server (SC/SA) |
| Prefetch | ✅ Automatic | Manual `prefetch()` | N/A |
| SEO | ✅ `<a href>` render hota hai | ❌ | ✅ |
| Middle-click / new tab | ✅ Kaam karta hai | ❌ | ❌ |
| Best for | Links, nav menus | Programmatic nav after action | Auth guards, server flows |

### Rule of thumb

```
User ko dikhne wala link        → <Link href="/x">
Button click ke baad navigate   → router.push() / router.replace()
Server par guard / data ke baad → redirect()
```

---

## 14. Scroll behaviour & smooth UX

### Default behaviour

`router.push()` aur `<Link>` dono **navigate hone ke baad top pe scroll** kar dete hain. Ye aksar chahiye nahi hota, especially filters/pagination mein.

### Scroll control

```jsx
// router.push with options
router.push("/shop/products?page=2", { scroll: false });   // scroll position bacha lo
router.push("/shop/products?page=2");                       // default: top pe jao
router.replace("/dashboard", { scroll: false });             // replace + no scroll

// Link component
<Link href="/shop/products?page=2" scroll={false}>Next page</Link>
```

### Kab `scroll: false` lagana hai

| Situation | `scroll: false` |
|---|---|
| Pagination / infinite scroll | ✅ |
| Filter / sort change | ✅ |
| Tab switch (same page) | ✅ |
| Modal open (URL change but same view) | ✅ |
| Different page navigation | ❌ top pe jao |
| Login → Dashboard | ❌ naya page hai |

### Smooth hash anchor

```jsx
// app/docs/page.jsx
<Link href="#installation">Installation</Link>   // same page anchor

router.push("#installation");                   // programmatic anchor
```

### Loading states ke saath smooth UX

```jsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SubmitButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);                       // instant feedback
    await fetch("/api/submit", { method: "POST" });
    router.replace("/success");             // navigate
    router.refresh();
  };

  return (
    <button onClick={submit} disabled={loading}>
      {loading ? "Submitting..." : "Submit"}
    </button>
  );
};
```

---

## 15. Common Mistakes & Pitfalls

### ❌ Mistake 1: Server Component mein hooks use karna

```jsx
// app/shop/page.jsx  (NO "use client")
import { usePathname } from "next/navigation";   // ❌ ERROR

export default function ShopPage() {
  const pathname = usePathname();                // ❌ Server Component mein hook nahi chalta
}
```

**Fix:** ya `"use client"` add karo, ya `headers()` use karo.

---

### ❌ Mistake 2: `useParams` ko folder name ke bina sochna

```jsx
// app/shop/[tag]/page.jsx
const params = useParams();
params.tag      // ✅ folder [tag]
params.name     // ❌ folder [name] nahi hai!
```

---

### ❌ Mistake 3: `useParams` vs `useSearchParams` mix karna

```jsx
// URL: /shop/electronics?sort=asc
const params = useParams();          // { tag: "electronics" }  ← path
const search = useSearchParams();    // ?sort=asc               ← query
params.sort                          // ❌ undefined!
```

---

### ❌ Mistake 4: `useEffect` mein missing dependency

```jsx
const { item } = useParams();

useEffect(() => {
  fetch(`/api/products/${item}`).then(r => r.json()).then(setProduct);
}, []);   // ❌ item change hoga toh stale data
```

```jsx
useEffect(() => { ... }, [item]);   // ✅
```

---

### ❌ Mistake 5: `redirect()` ko try/catch mein pakadna

```jsx
try {
  if (!session) redirect("/login");   // ❌ throw ho jayega, catch karega → redirect fail
} catch (e) {
  console.log("error", e);
}
```

---

### ❌ Mistake 6: `router.push` se form data bhejna bhool jana

```jsx
// ❌ URL mein data dalna = data leak + URL limit
router.push(`/search?q=${query}`);

// ✅ Data URL mein tabhi jab shareable/searchable hona chahiye
// ✅ warna POST body / form state mein rakho
```

---

## 16. Diagram Explanations

### Big Picture — App Router Navigation Flow

```
                         ┌──────────────────────────┐
                         │      BROWSER (URL)        │
                         │  /shop/electronics/      │
                         │  iphone?sort=asc         │
                         └────────────┬─────────────┘
                                      │ URL change (push/replace/redirect)
                                      ▼
                         ┌──────────────────────────┐
                         │   NEXT.JS APP ROUTER     │
                         │  (Client router +        │
                         │   Server render engine)  │
                         └────────────┬─────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐          ┌────────────────────┐        ┌────────────────────┐
│  useParams()  │          │  usePathname()     │        │ useSearchParams()  │
│ { tag, item } │          │  "/shop/..."       │        │ ?sort=asc          │
│ PATH segments │          │  current path      │        │ QUERY string       │
└───────────────┘          └────────────────────┘        └────────────────────┘
```

### Server vs Client rendering cycle

```
┌─────────────────────── SERVER ───────────────────────┐
│ Request ──► Match route segment                     │
│               │                                     │
│               ├─ layout.js (ONCE per segment)       │
│               ├─ page.js   (EVERY navigation)       │
│               ├─ data fetch (params / searchParams) │
│               ├─ if (!auth) redirect("/login") ──────┼──┐
│               └─ if (!data) notFound()  ─────────────│──┤
└─────────────────────────────────────────────────────┘  │
        │ HTML + RSC payload                              │
        ▼                                                 │
┌─────────────────────── BROWSER ───────────────────────┐ │
│  Hydration → Client Components interactive             │ │
│  useParams / usePathname / useSearchParams / useRouter│ │
│  User clicks <Link> ──► router intercepts             │ │
└───────────────────────────────────────────────────────┘ │
        (307 / 404 response) ◄──────────────────────────-┘
        browser follows redirect
```

### `redirect()` — render interrupt diagram

```
app/page.js render start
        │
        ▼
const isLoggedIn = false
        │
        ▼
if (!isLoggedIn) {
        │
        ▼
  redirect("/login")
        │
### `router.push()` — client navigation diagram

```
Browser loaded: [ Server HTML + RSC payload + Client JS ]  ✅ ready
        │
        ▼
Click "Login" button  →  event handler fires
        │
        ├─ await fetch("/api/login", { method: "POST" })
        │        │
        │        ▼
        │   Server: validates → sets cookie → 200 OK
        │
        ▼
  router.push("/dashboard")
        │
        ├──► History stack update:
        │     [ / , /login , /dashboard ]   ← nayi entry ADD
        │
        ├──► Client router fetches RSC payload for /dashboard
        │
        ├──► Re-renders ONLY the page component
        │     (layout.js + sidebar.jsx NAHI dobara bane)
        │
        ├──► React state preserved (open modal, typed form, etc.)
        │
        └──► Scroll to top (unless scroll:false)
        │
        ▼
  UI updated — NO full page reload, NO flash
```

### History behaviour comparison

```
Scenario: User at /login → action → go to /dashboard

╔══════════════════════════════════════════════════════════╗
║ router.push("/dashboard")                                ║
╠══════════════════════════════════════════════════════════╣
║ History: [ /home ] → [ /login ] → [ /dashboard ]         ║
║                                      ↑ current           ║
║ Back button → /login  ✅  (user can undo)                 ║
╚══════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════╗
║ redirect("/dashboard")  (server se)                      ║
╠══════════════════════════════════════════════════════════╣
║ History: [ /home ] → [ /dashboard ]  (replace ho gaya)   ║
║                                      ↑ current           ║
║ Back button → /home  ⚠️  (login page skip)               ║
╚══════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════╗
║ router.replace("/dashboard")                              ║
╠══════════════════════════════════════════════════════════╣
║ History: [ /home ] → [ /dashboard ]                      ║
║                                      ↑ current           ║
║ Back button → /home  ⚠️  (same as redirect)              ║
╚══════════════════════════════════════════════════════════╝
```

## 17. Real-Life Usages

### 🛒 E-commerce — Product listing (params + searchParams + usePathname)

```
/shop/electronics/phones?brand=apple&sort=price_asc&page=2

app/shop/[category]/[sub]/page.jsx   → useParams()      → category, sub
components/filter-bar.jsx            → useSearchParams() → brand, sort, page
components/breadcrumb.jsx            → usePathname()    → crumbs
```

```jsx
// app/shop/[category]/[sub]/page.jsx
import { Suspense } from "react";

async function ProductList({ params, searchParams }) {
  const { category, sub } = await params;
  const { brand, sort, page = "1" } = await searchParams;

  const products = await getProducts({ category, sub, brand, sort, page });
  return <Grid products={products} />;
}

export default function Page(props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <ProductList {...props} />
    </Suspense>
  );
}
```

```jsx
// components/breadcrumb.jsx
"use client";
import { usePathname } from "next/navigation";

const crumbs = ["Shop", "Electronics", "Phones"];

export default function Breadcrumb() {
  const pathname = usePathname();
  return (
    <nav>
      {crumbs.map((c, i) => (
        <span key={c}>
          {i > 0 && " / "}
          <span className={pathname.includes(c.toLowerCase()) ? "font-bold" : "text-gray-500"}>
            {c}
          </span>
        </span>
      ))}
    </nav>
  );
}
```

### 🔐 Auth flow (redirect + replace)

```jsx
// middleware.js — edge level guard (sabse fast)
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;
  const protectedRoutes = ["/shop/dashboard", "/shop/settings", "/account"];

  if (protectedRoutes.includes(pathname) && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);   // login ke baad wapas
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shop/dashboard/:path*", "/shop/settings", "/account"],
};
```

```jsx
// app/login/page.jsx  (Server Component)
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;

  const session = await getSession();       // already logged in?
  if (session) redirect(next || "/shop/dashboard");

  return <LoginForm nextPath={next} />;
}
```

```jsx
// app/login/login-form.jsx  (Client Component)
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
### 📊 Dashboard — live filters + refresh

```jsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

const DateRangePicker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setRange = (range) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`/dashboard?${params}`, { scroll: false });
  };

  const range = searchParams.get("range") ?? "7d";
  return (
    <div>
      {["24h", "7d", "30d"].map((r) => (
        <button key={r} onClick={() => setRange(r)} className={range === r ? "active" : ""}>
          {r}
        </button>
      ))}
    </div>
  );
};
```

```jsx
// Server side — same URL, different data
// app/dashboard/page.jsx
export default async function Dashboard({ searchParams }) {
  const { range = "7d" } = await searchParams;
  const data = await getAnalytics(range);
  return <Chart data={data} />;
}
```

### 💬 Modal with URL (Shareable UI state)

```jsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quickViewId = searchParams.get("quickview");

  return (
    <>
      <button
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("quickview", product.id);
          router.replace(`?${params}`, { scroll: false });   // history clean
        }}
      >
        Quick View
      </button>

      {quickViewId === product.id && <Modal onClose={() => router.back()}>...</Modal>}
    </>
  );
};
```

Isse modal ka URL **shareable** ho jata hai — user `/product/1?quickview=true` bhej sakta hai.

### 🧭 Multi-step onboarding

```jsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function StepIndicator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = Number(searchParams.get("step") ?? "1");

  const goTo = (n) => router.replace(`/onboarding?step=${n}`, { scroll: false });

  return (
    <div className="steps">
      {[1, 2, 3].map((n) => (
        <button key={n} onClick={() => goTo(n)}
          className={n === step ? "active" : n < step ? "done" : ""}>
          {n}
        </button>
      ))}
    </div>
  );
}
```

### 🔄 Old → New URL migration

```jsx
// app/old-blog/[id]/page.jsx
import { permanentRedirect, notFound } from "next/navigation";
import { getNewSlug } from "@/lib/redirects";

export default async function OldBlog({ params }) {
  const { id } = await params;
  const newSlug = await getNewSlug(id);

  if (newSlug) permanentRedirect(`/blog/${newSlug}`);
  notFound();
}
```

### 📑 Real-Life summary table

| Industry | `useParams` | `useSearchParams` | `usePathname` | `redirect` | `router.push` |
|---|---|---|---|---|---|
| E-commerce | product/category | filters, sort | breadcrumb, active nav | auth guard | add to cart → /cart |
| SaaS Dashboard | orgId, tab | date range, page | sidebar highlight | login redirect | filter change |
| Blog / Docs | slug | search query | TOC active link | old URL migration | search submit |
| Social | username, postId | tab, filter | nav active | private profile | follow → profile |
| Booking | hotelId, roomId | checkin/checkout | stepper | payment fail | slot select |

---

## 18. Quick Cheat Sheet

### Imports — ek hi jagah se

```jsx
"use client";
import {
  useRouter,
  usePathname,
  useParams,
  useSearchParams,
  redirect,
  permanentRedirect,
  notFound,
  forbidden,
  unauthorized,
} from "next/navigation";
```

### Server-side helpers (no hooks)

```jsx
import { cookies, headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
```

### One-liner summary

| Tool | Type | One line |
|---|---|---|
| `usePathname()` | Client hook | Current URL ka path (query ke bina) |
| `useParams()` | Client hook | `[dynamic]` folder segments ka object |
| `useSearchParams()` | Client hook | `?query=string` ka URLSearchParams |
| `useRouter()` | Client hook | `push`, `replace`, `refresh`, `back`, `forward`, `prefetch` |
| `redirect(url)` | Server function | Turant bhej do (307), render interrupt |
| `permanentRedirect(url)` | Server function | 308 + SEO friendly migration |
| `notFound()` | Server function | 404 render karo |
| `<Link href>` | Component | Declarative link + prefetch + SEO |
| `params` | Server prop | `{ slug }` (await karo) |
| `searchParams` | Server prop | `{ q, page }` (await karo) |

### Decision cheat card

```
Server Component hai?
  ├─ haan → redirect() / notFound() / permanentRedirect()
  └─ nahi (client)
       ├─ Sirf padhna hai? → usePathname / useParams / useSearchParams
       ├─ User click ke baad jaana hai? → push() (back ✅) / replace() (back ❌)
       ├─ Link hai UI mein? → <Link>
       └─ Same page pe data refresh? → router.refresh()
```

### History cheat card

```
push()      → nayi entry → back se wapas ✅
replace()   → entry badal → back pehle wala ⚠️
redirect()  → server 307 → effectively replace ⚠️
back()      → ek step peeche
refresh()   → same URL, data dobara fetch
```

### ⚡ Sabse common 5 patterns

```jsx
// 1. Auth guard (server)
if (!session) redirect("/login");

// 2. Not found (server)
if (!item) notFound();

// 3. Active link (client)
const active = pathname === href;

// 4. Filter update (client)
router.push(`?${params}`, { scroll: false });

// 5. Action ke baad navigate (client)
router.replace("/dashboard");
router.refresh();
```

---

## 19. Running This Project

```bash
npm install
npm run dev
# Browser: http://localhost:3000
```

### Try karne ke URLs

| URL | Kya dikhega |
|---|---|
| `/` | `redirect()` demo (isLoggedIn = true rakhne do) |
| `/login` | redirect ka destination |
| `/shop` | Shop layout + sidebar |
| `/shop/dashboard` | Sidebar active link highlight |
| `/shop/orders` | Same layout, different active item |
| `/shop/search?q=iphone&category=mobile` | `useSearchParams()` output |
| `/shop/account` | `useRouter()` methods demo |
| `/shop/electronics/iphone` | `useParams()` + `usePathname()` |

### Console se verify karo

```jsx
// app/shop/[tag]/[item]/page.jsx mein already hai
console.log(params);
// Browser console: { tag: "electronics", item: "iphone" }
```

### Build check

```bash
npm run build     # production build + prerender check
npm run lint      # eslint
npm run start     # production server
```

---

## 20. Practice Tasks & Next Steps

### 🟢 Easy

- [ ] `app/shop/about/page.jsx` banao aur `usePathname()` se current path print karo
- [ ] Sidebar mein ek "Search" link add karo
- [ ] `useParams()` se `[tag]` folder ka value ek heading mein dikhao
- [ ] `/shop/search?q=hello` par `q` ko heading mein print karo

### 🟡 Medium

- [ ] **FilterBar** banao jo `category` query param update kare bina full reload ke
- [ ] **Breadcrumb** component banao `usePathname()` se (nested shop routes ke liye)
- [ ] `/shop/[[...filters]]` optional catch-all route banao + undefined handle karo
- [ ] Dynamic route `/products/[id]` mein data fetch + `loading.jsx` banao
- [ ] `not-found.jsx` custom 404 banao aur `notFound()` se call karo

### 🔴 Advanced

- [ ] **Auth flow** end-to-end: `middleware.js` guard + `redirect("/login?next=...")` + login form mein `router.replace(next)`
- [ ] **Multi-step onboarding** with `?step=` query params + `scroll: false`
- [ ] **URL-backed modal** — quick view modal URL se controlled ho, shareable bhi ho
- [ ] `permanentRedirect()` se purane blog URLs naye par migrate karo
- [ ] `middleware.js` mein role-based access (`/admin` sirf admin ke liye) + `forbidden()`
- [ ] Server Action + `revalidatePath()` + `redirect()` — full CRUD flow
- [ ] `useSearchParams` ko Suspense ke saath wrap karke static rendering fix karo

### 🧠 Deep-dive questions (khud se poochho)

1. `redirect()` throw kyun karta hai, return kyun nahi?
2. Server Component mein `useParams()` kyun nahi chalta?
3. `useSearchParams()` ko Suspense ki zarurat kyun padti hai?
4. `router.push()` aur `router.replace()` mein history stack kaise alag hota hai?
5. Next 15 mein `params` Promise kyun banaya? Isse kya fayda hua?
6. Middleware-level redirect aur `redirect()` mein performance kaunsa better hai?
7. Shareable UI state (modal, filters) URL mein rakhne ke kya fayde hain?
8. SEO ke liye `permanentRedirect()` (308) kyun better hai `redirect()` (307) se?

### 📚 Next Series ke topics

- **Server Actions** — `useActionState`, `useFormStatus`, progressive enhancement
- **Caching & Revalidation** — `revalidatePath`, `revalidateTag`
- **Middleware** — edge runtime, rewrites, redirects, matcher
- **Forms** — Server Actions + `redirect()` ka full combo
- **Metadata & SEO** — dynamic `generateMetadata`
- **i18n & locale routing** — `[locale]` dynamic segment

---

## 📝 Summary (Ek page)

```
┌──────────────────────────────────────────────────────────────┐
│  next/navigation = App Router ka navigation API              │
├──────────────────────────────────────────────────────────────┤
│  CLIENT HOOKS (need "use client")                            │
│   usePathname()      → "/shop/products"                      │
│   useParams()        → { tag, item }  (from [folder])        │
│   useSearchParams()  → ?sort=asc     (from ?query)           │
│   useRouter()        → push/replace/refresh/back/prefetch    │
│                                                              │
│  SERVER FUNCTIONS (no "use client")                          │
│   redirect()         → 307, render interrupt                 │
│   permanentRedirect()→ 308, SEO migration                     │
│   notFound()         → 404                                    │
│   forbidden()        → 403    unauthorized() → 401           │
│                                                              │
│  SERVER PROPS (async in Next 15+)                            │
│   params, searchParams, cookies(), headers()                 │
│                                                              │
│  GOLDEN RULE                                                  │
│   Link     → user-visible links (prefetch + SEO)             │
│   push     → programmatic nav, back chahiye                   │
│   replace  → programmatic nav, back nahi chahiye              │
│   redirect → server-side guard / data-ke-baad navigation     │
└──────────────────────────────────────────────────────────────┘
```

---

**Happy Learning! 🚀** — Har hook manually try karo, phir [Series #07 — Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) padho.

Official docs: [nextjs.org/docs/app/api-reference/functions](https://nextjs.org/docs/app/api-reference/functions)
```jsx
// 1. Auth guard (server)
if (!session) redirect("/login");

// 2. Not found (server)
if (!item) notFound();

// 3. Active link (client)
const active = pathname === href;

// 4. Filter update (client)
router.push(`?${params}`, { scroll: false });

// 5. Action ke baad navigate (client)
router.replace("/dashboard");
router.refresh();
```

---
        </button>
      ))}
    </div>
  );
}
```

### 🔄 Old → New URL migration

```jsx
// app/old-blog/[id]/page.jsx
import { permanentRedirect, notFound } from "next/navigation";
import { getNewSlug } from "@/lib/redirects";

export default async function OldBlog({ params }) {
  const { id } = await params;
  const newSlug = await getNewSlug(id);

  if (newSlug) permanentRedirect(`/blog/${newSlug}`);
  notFound();
}
```

### 📑 Real-Life summary table

| Industry | `useParams` | `useSearchParams` | `usePathname` | `redirect` | `router.push` |
|---|---|---|---|---|---|
| E-commerce | product/category | filters, sort | breadcrumb, active nav | auth guard | add to cart → /cart |
| SaaS Dashboard | orgId, tab | date range, page | sidebar highlight | login redirect | filter change |
| Blog / Docs | slug | search query | TOC active link | old URL migration | search submit |
| Social | username, postId | tab, filter | nav active | private profile | follow → profile |
| Booking | hotelId, roomId | checkin/checkout | stepper | payment fail | slot select |

---
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/shop/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.replace(nextPath);   // replace → login page back mein nahi aayega
      router.refresh();            // server components fresh
    }
  };

  return <form onSubmit={handleLogin}>{/* ... */}</form>;
}
```

---
### params vs searchParams — visual split

```
Full URL: https://shop.example.com/shop/electronics/iphone?sort=asc&page=2
                                            ─────────────────  ─────────────
                                            path segments      query string

useParams()       → { tag: "electronics", item: "iphone" }
                    ▲               ▲
                    │               └── from folder [item]
                    └────────────────── from folder [tag]

useSearchParams() → ?sort=asc&page=2
                    ▲           ▲
                    │           └── from ?page=2
                    └────────────── from ?sort=asc

usePathname()     → "/shop/electronics/iphone"   (dono ke beech)
```

---
        ├──► THROWS NEXT_REDIRECT error
        │
        ▼
  ✖ render() ABORTED  (return <div> kabhi execute nahi hua)
        │
        ▼
  Response: 307 + Location: /login
        │
        ▼
  Browser: GET /login → app/login/page.jsx render
        │
        ▼
  User sees ONLY LoginPage
```

---
### ❌ Mistake 7: `searchParams.get()` ka result directly render karna

```jsx
const q = useSearchParams().get("q");   // q = null ho sakta hai

return <h1>{q}</h1>;                   // khali page dikhega
return <h1>{q ?? "No query"}</h1>;      // ✅ null-safe
```

---

### ❌ Mistake 8: Multiple dynamic folders ka structure galat banana

```
// ❌ GALAT — nesting galat
app/shop/[tag]/[tag]/page.jsx   // dobara [tag]?!

// ✅ SAHI
app/shop/[tag]/[item]/page.jsx
```

---

### ❌ Mistake 9: `params` ko `await` nahi karna (Next 15+)

```jsx
export default async function Page({ params }) {
  const { id } = params;        // ❌ Promise hai ab
  const { id } = await params;  // ✅
}
```

---

### ❌ Mistake 10: Suspense ke bina `useSearchParams`

```
Error: useSearchParams() should be wrapped in a suspense boundary
```

```jsx
<Suspense fallback={<Skeleton />}>
  <SearchResults />
</Suspense>
```

---
User ko dikhne wala link        → <Link href="/x">
Button click ke baad navigate   → router.push() / router.replace()
Server par guard / data ke baad → redirect()
```

### Kab `router.push()` instead of `<Link>`?

```jsx
// ✅ Form submit ke baad, ya API response ke baad
onClick={async () => {
  const res = await fetch("/api/x", { method: "POST" });
  if (res.ok) router.replace("/x");
}}

// ✅ Programmatic redirect based on computed value
useEffect(() => {
  if (user && !user.onboarded) router.replace("/onboarding");
}, [user]);

// ❌ Regular navigation ke liye router.push mat use karo
// <Link> better hai: prefetch + SEO + new-tab support
```

### `Link` ke extra options

```jsx
import Link from "next/link";

<Link href="/shop/products" scroll={false}>Products</Link>   // scroll na karo
<Link href="/docs" prefetch={false}>Docs</Link>              // prefetch band karo
<Link href="/report.pdf" target="_blank" rel="noopener">PDF</Link>  // external file
<Link href={{ pathname: "/shop", query: { sort: "asc" } }}>Shop</Link> // object href
```

---

---

export default function LoginButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/login", { method: "POST" });
        router.push("/dashboard");     // client decide, action ke baad
      }}
    >
      Login
    </button>
  );
}
```

---
    if (res.ok) {
      router.replace("/shop/products");
      router.refresh();
    } else {
      setLoading(false);
      alert("Delete failed");
    }
  };

  return <button onClick={handleDelete} disabled={loading}>
    {loading ? "Deleting..." : "Delete"}
  </button>;
};
```

### `redirect` vs `permanentRedirect`

| | `redirect()` | `permanentRedirect()` |
|---|---|---|
| HTTP status | `307 Temporary Redirect` | `308 Permanent Redirect` |
| SEO | Search engine follow karega | Search engine URL replace kar dega |
| Kab use | Temporary (login, error) | `/old-page` → `/new-page` migrate |

```jsx
import { permanentRedirect } from "next/navigation";

// Purane blog URL ko naye par migrate kar rahe ho
permanentRedirect("/blog/2023/hello-world");
```

---
  return <div onMouseEnter={() => router.prefetch(`/product/${slug}`)}>...</div>;
};
```

---
export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SearchContent />
    </Suspense>
  );
}
```

### Server Component mein searchParams

```jsx
// app/shop/search/page.jsx  (Server Component — hooks nahi!)
export default async function Page({ searchParams }) {
  const { q, category } = await searchParams;   // Next 15+ async
  const results = await searchDB(q, category);
  return <div>{results.length} results for {q}</div>;
}
```

---

Server Component mein hook nahi lagta — wahan `params` **prop** hota hai:

```jsx
// app/shop/[tag]/[item]/page.jsx  (NO "use client")
export default async function Page({ params }) {
  const { tag, item } = await params;    // Next 15+ : params async hai
  const product = await fetch(`/api/products/${item}`).then((r) => r.json());

  return <h1>{product.name}</h1>;        // SEO friendly, no loading state needed
}
```

**Rule of thumb:** Data fetch ke liye **Server Component + `params` prop**, sirf interactivity ke liye Client Component + `useParams()`.

---
  );
};
export default Breadcrumb;
```

### Real-Life Use #3: Route guards ke liye path check

```jsx
const pathname = usePathname();
const isPublic = ["/login", "/signup"].includes(pathname);
if (!isPublic && !token) router.replace("/login");
```

### ⚠️ Note

`usePathname()` ko `"use client"` chahiye. Agar tumhe sirf pathname chahiye **render ke liye** (sidebar styling, breadcrumb), toh ek chhota Client Component bana do — poori page ko client banana zaroori nahi.

---
`redirect()` **dono** jagah kaam karta hai:

```jsx
// app/page.js — Server Component (no "use client")
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/login");    // ✅ Server par legal
}
```

```jsx
// components/ClientNav.jsx — Client Component
"use client";
import { redirect } from "next/navigation";
export default function ClientNav() {
  // ⚠️ Client component mein redirect() ka official kaam Server component
  //    ke liye hai. Client par navigation ke liye router.push() use karo.
  redirect("/login");
}
```

> 📌 Official docs ke mutabik `redirect()` **Server Component ke liye** hai. Client Component mein `redirect()` call karne par Next.js use Server Action ke through handle karta hai, but **tabhi jab wo kisi server function ke andar ho**. Event handler ke andar turant navigate karna ho toh `router.push()` sahi hai.

---

export default Home;
```

```jsx
// app/login/page.jsx  (destination)
const LoginPage = () => <div>LoginPage</div>;
export default LoginPage;
```

User `/` par aata hai → server sochta hai "login nahi hai" → turant `/login` par bhej deta hai. User ko intermediate page kabhi dikhai nahi deta.

---
