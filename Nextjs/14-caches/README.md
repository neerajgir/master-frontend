# 🚀 14-caches — Caching in Next.js 16 (Complete Learning Repo)

> **Next.js:** `16.4.3` | **React:** `19.3.0` | **Feature flags:** `cacheComponents: true` + `partialPrefetching: true`
> **Language of this README:** Hinglish (Hindi in Latin script + English technical terms)

---

## 📖 Intro — Ye Repo Kya Hai?

Doston, ye ek **learning repo** hai jahan maine **Next.js ki caching** ko scratch se samjha hai — theory ke saath saath **working code snippets** ke saath.

Caching ka matlab simple hai:

> **Kisi kaam ka result ek baar calculate karo, store karo, aur agli baar wahi result turant serve karo — bina dobara kaam kiye.**

Next.js mein caching sirf "speed ke liye" nahi hai — ye **architecture ka core decision** hai:

- ⚡ **Instant page loads** — static shell CDN se serve hota hai
- 💰 **Kam server cost** — har request pe API/DB hit nahi hota
- 🎯 **Fresh data control** — tum decide karo data kitni der purana chalega
- 🧠 **Better UX** — `Suspense` fallback turant dikhta hai, content stream hota hai

### Is Repo Mein Kya-Kya Covered Hai

| # | Topic | Kya Seekhoge |
|---|-------|--------------|
| 1 | Caching in Next.js | Caching kya hai, kyun zaroori hai |
| 2 | Next.js kaise handle karta hai | Poori cache layers + request flow diagram |
| 3 | `force-cache` & `no-store` | Purane (fetch-level) model ka deep dive |
| 4 | Cache Components | Naya model — `"use cache"` directive |
| 5 | Cache timing options | `stale` / `revalidate` / `expire` |
| 6 | `cacheLife` | Preset profiles + custom profiles |
| 7 | Revalidation | Time-based + On-demand (`updateTag`, `revalidateTag`, `revalidatePath`) |
| 8 | Diagram explanations | ASCII diagrams — flow, timeline, PPR |
| 9 | Real-life usages | E-commerce, blog, dashboard patterns |
| 10 | Is repo ka code walkthrough | Har file kya karti hai |

---

## 🏃‍♂️ Chalao Isko

```bash
bun install
bun dev
```

Phir browser mein kholo → [http://localhost:3000](http://localhost:3000)

> Note: `package.json` mein `packageManager: bun@1.4.3` set hai.

---

## 1️⃣ Caching in Next.js — Pehle Concept Clear Karo

### Caching Kya Hai?

Ek simple example: tumhari website ka product page har baar database se data fetch karta hai.

**Bina cache ke (har request pe):**

```
User → Server → Database (200ms) → Render → Response  (Total: ~300ms)
User → Server → Database (200ms) → Render → Response  (Total: ~300ms)
User → Server → Database (200ms) → Render → Response  (Total: ~300ms)
                                ↑ 1000 users = 1000 DB queries!
```

**Cache ke saath:**

```
User 1 → Server → Cache MISS → Database (200ms) → Result store → Response
User 2 → Server → Cache HIT  → Turant response (5ms)
User 3 → Server → Cache HIT  → Turant response (5ms)
                                ↑ 1000 users = sirf 1 DB query!
```

### Caching ke 3 Faayde

1. **Latency kam** — cached response ~10-50x fast hota hai
2. **Load kam** — DB/API pe pressure nahi padta
3. **Availability zyada** — API down ho toh bhi cached version chalta hai

### Next.js Mein Caching Kyun Special Hai?

Next.js ek **hybrid framework** hai — static bhi, dynamic bhi. Isliye uski caching sirf data tak limited nahi:

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Caching Ka Scope                     │
├─────────────────────────────────────────────────────────┤
│  📄 HTML/RSC Payload   → Poora page render cached        │
│  📦 Data (fetch/DB)    → API responses, DB queries       │
│  🎨 Assets (images)    → next/image optimization         │
│  🔀 Client Router      → Sidebar/nav cached browser mein  │
│  🧩 React Components   → Component output cached ("use cache") │
└─────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Next.js Kaise Handle Karta Hai — Poori Cache Layers

### 🗺️ Diagram: Next.js Ki Cache Layers

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER                                                          │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: Client Router Cache                              │   │
│  │  • Route ka HTML/RSC payload browser memory mein           │   │
│  │  • `stale` time tak bina network call ke dikhta hai        │   │
│  │  • Server Action se invalid hone pe poora cache clear       │   │
│  └───────────────────────────┬────────────────────────────────┘   │
└──────────────────────────────┼────────────────────────────────────┘
                               │  RSC payload / HTML
┌──────────────────────────────┼────────────────────────────────────┐
│  SERVER                     │                                     │
│  ┌───────────────────────────▼────────────────────────────────┐   │
│  │  LAYER 4: Prerendered HTML (Static Shell)                   │   │
│  │  • Build time pe ban'ta hai — CDN se serve hota hai         │   │
│  │  • `use cache` wala content yahan integrate hota hai        │   │
│  │  • PPR ke saath static + dynamic mix hota hai               │   │
│  └───────────────────────────┬────────────────────────────────┘   │
│                              │                                     │
│  ┌───────────────────────────▼────────────────────────────────┐   │
│  │  LAYER 3: Server Cache ("use cache" entries)                │   │
│  │  • Default: in-memory LRU store (self-hosted pe persist)    │   │
│  │  • Serverless pe: instance ke saath mar jaata hai           │   │
│  │  • Durable chahiye → "use cache: remote" (Redis/KV)         │   │
│  │  • `cacheLife` yahan ka lifetime decide karta hai           │   │
│  └───────────────────────────┬────────────────────────────────┘   │
│                              │  cache MISS                        │
│  ┌───────────────────────────▼────────────────────────────────┐   │
│  │  LAYER 2: Request Rendering (Dynamic)                       │   │
│  │  • `cookies()`, `headers()`, `searchParams` → request pe    │   │
│  │  • Uncached fetch → har baar chalta hai                     │   │
│  │  • Inhe `<Suspense>` mein wrap karo, warna route block hoga │   │
│  └───────────────────────────┬────────────────────────────────┘   │
│                              │                                     │
│  ┌───────────────────────────▼────────────────────────────────┐   │
│  │  LAYER 1: Fetch Data Cache (purana model)                   │   │
│  │  • `cache: 'force-cache'` / `next: { revalidate, tags }`    │   │
│  │  • Deployments ke across persist karta hai                  │   │
│  └───────────────────────────┬────────────────────────────────┘   │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  🗄️ DB/API  │
                        └─────────────┘
```

### ⏱️ Diagram: Ek Request Ka Poora Journey (Request Flow)

```
         User URL hit karta hai
                 │
                 ▼
   ┌─────────────────────────────┐
   │ Browser Router Cache check  │──── HIT (stale ke andar) ──→ Turant render ✅
   └──────────────┬──────────────┘                        (koi network call nahi)
                  │ MISS / stale
                  ▼
   ┌─────────────────────────────┐
   │ Static Shell (prerendered   │──── Server ko HTML/RSC payload bhejta hai
   │ HTML) available?            │     (CDN se, bahut fast)
   └──────────────┬──────────────┘
                  │ dynamic part ke liye
                  ▼
   ┌─────────────────────────────┐
   │ Server Cache ("use cache")  │──── HIT (fresh) ──→ Cached result serve ✅
   └──────────────┬──────────────┘
                  │ MISS / expired
                  ▼
   ┌─────────────────────────────┐
   │ Function chalta hai         │
   │ (fetch / DB query)          │──── Result cache mein store
   └──────────────┬──────────────┘
                  │
                  ▼
        User ko response + Suspense fallback
        ke saath content stream hota hai 🎉
```

### Cache Components Ka Core Idea (Next.js 16)

Next.js 16 mein **`cacheComponents: true`** enable hota hai (tumhare `next.config.ts` mein already hai):

```
┌──────────────────────────────────────────────────────────────┐
│           CACHE COMPONENTS — NAYA MODEL                       │
├──────────────────────────────────────────────────────────────┤
│  • Data fetching DEFAULT dynamic hai                          │
│  • Jo cache karna hai, tum explicitly "use cache" se bolo     │
│  • Kuch bhi cache nahi → woh request time pe chalega          │
│  • Har route ka static shell prerender hota hai (PPR)         │
│  • Dynamic content <Suspense> ke peeche stream hota hai       │
│                                                              │
│  Tumhare next.config.ts:                                      │
│  { cacheComponents: true, partialPrefetching: true }          │
└──────────────────────────────────────────────────────────────┘
```

**Rule of thumb:** *"Sab kuch dynamic hai by default. Cache sirf tab jab tum `use cache` lagao."*

---

## 3️⃣ Purana Model: `force-cache` & `no-store`

> ⚠️ **Important:** Ye **previous model** hai (fetch ke options). Tumhara repo `cacheComponents: true` pe chalta hai, isliye naya `"use cache"` model primary hai — lekin interview mein aur legacy code samajhne ke liye ye **bahut important** hai.

### Next.js 15+ Ka Default: Fetch Cached NAHI Hai

```ts
// ❌ Ye har request pe chalega (default behavior since Next 15)
const res = await fetch("https://api.example.com/products");
```

> Purane Next.js (≤14) mein GET fetch **automatically cached** tha. Next.js 15 se default **no-store** ho gaya.

### `cache: 'force-cache'` — Sabse Strong Cache

```ts
// ✅ Ye result ek baar fetch hoga, phir hamesha cache se aayega
const res = await fetch("https://api.example.com/products", {
  cache: "force-cache",
});
```

**Kya hota hai:**

```
Pehli baar:  fetch → API se data → Data Cache mein store → Response
Agle saare:  Cache HIT → Bina API call ke response ✅

⚠️ Kab tak?  Jab tak:
  • tum khud revalidate na karo (revalidateTag/revalidatePath), ya
  • next build na karo (naya deployment = fresh cache)
```

**Use case:** Kaun sa data kabhi nahi badalta — site settings, feature flags, country list, legal pages.

### `cache: 'no-store'` — Explicit Opt-Out

```ts
// ✅ Ye HAR request pe fresh chalega — kabhi cache nahi hoga
const res = await fetch("https://api.example.com/balance", {
  cache: "no-store",
});
```

**Use case:** User ka bank balance, cart, session data — 1 second ka stale data bhi nahi chalega.

> Ab default bhi `no-store` hi hai, isliye explicit `no-store` sirf tab zaroori hai jab parent layout ya segment ne kahin `force-cache` set kiya ho.

### `next: { revalidate }` — Time-Based Cache (ISR style)

```ts
// ✅ Har 60 second mein background mein refresh hoga
const res = await fetch("https://api.example.com/news", {
  next: { revalidate: 60 },
});
```

```
t=0s      → fetch → cache store (fresh)
t=30s     → HIT → purana data serve + background mein naya fetch chalu
t=61s     → ab naya data serve hota hai
```

**SWR (Stale-While-Revalidate) pattern:** User ko **turant purana data** milta hai, background mein **naya data** aata hai — user experience never blocks. 🎯

### `next: { tags }` — On-Demand Invalidation

```ts
const res = await fetch("https://api.example.com/products", {
  next: { tags: ["products"], revalidate: 3600 },
});
```

```ts
// Product update hote hi — sirf us tag ka cache clear
import { revalidateTag } from "next/cache";
revalidateTag("products");
```

Ek tag = ek **invalidation handle**. 10 pages same tag use karein toh ek call mein sab refresh. 🎯

### 🗺️ Diagram: `force-cache` vs `no-store` vs `revalidate`

```
cache: 'force-cache'          cache: 'no-store'          next: { revalidate: 60 }
─────────────────────         ─────────────────          ────────────────────────
Fetch ──┐                     Fetch EVERY time           Fetch ──┐
        ▼                                                   │     ▼
   ┌─────────┐                                        ┌─────┴──────┐
   │  CACHE  │ (permanent, deploy tak)                │ CACHE      │
   └────┬────┘                                        │ 60s window │
        │ HIT hamesha                                 └─────┬──────┘
        ▼                                                   │ expired?
   Response ✅                                     HIT ──────┤
                                                          │  MISS
                                                          ▼
                                                    Fresh fetch
                                                    + SWR background
                                                    refresh chalu 🔄
```

### Old vs New — Quick Mapping Table

| Purana Model (fetch options) | Naya Model (Cache Components) |
|---|---|
| `cache: 'force-cache'` | `"use cache"` directive |
| `next: { revalidate: 60 }` | `cacheLife('minutes')` |
| `next: { tags: ['x'] }` | `cacheTag('x')` |
| `cache: 'no-store'` | Bas `"use cache"` mat lagao (default uncached) |
| `export const revalidate = 60` | `cacheLife('hours')` inside function |
| `unstable_cache(fn, keys, opts)` | `"use cache"` function |
| `export const dynamic = 'force-dynamic'` | Remove karo — uncached already dynamic hai |

---

## 4️⃣ Cache Components — `"use cache"` Directive (Naya Model)

### Sabse Pehla Example (Tumhara Actual Code! 🎯)

Ye file tumhare repo mein hai — `app/lib/user.ts`:

```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getUsers() {
  "use cache";           // 👈 Is function ka output cache ho
  cacheLife("hours");    // 👈 1 hour tak fresh, phir revalidate
  cacheTag("users");     // 👈 Tag do taaki on-demand invalidate kar sako

  const res = await fetch(
    "https://6ae8afcc1a7b15aaa50f618e.mockapi.io/api/users/users"
  );
  return res.json();
}
```

**Ye 3 line ka combo kaam kaise karta hai:**

```
getUsers() pehli baar call hua
        │
        ▼
"use cache" → Result RSC payload mein serialize hoke store hua
cacheLife('hours') → 1 hour tak fresh, phir background revalidate
cacheTag('users') → Entry par "users" ka label chipka
        │
        ▼
Agle 1 hour tak: getUsers() = TURANT cached result (bina fetch ke)
updateTag('users') chala → Entry expire → agli call fresh data layegi
```

### 3 Levels Pe Lagta Hai `"use cache"`

#### 1. Data-Level — Function pe

```ts
// app/lib/data.ts
import { cacheLife } from "next/cache";

export async function getProducts() {
  "use cache";
  cacheLife("hours");
  const res = await fetch("https://api.example.com/products");
  return res.json();
}
```

*Use jab data multiple components mein use ho, ya data ko UI se independently cache karna ho.*

#### 2. UI-Level — Component/Page pe

```tsx
// app/page.tsx — poora page cached!
import { cacheLife } from "next/cache";

export default async function ProductsPage() {
  "use cache";
  cacheLife("days");

  const products = await getProducts();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

#### 3. File-Level — Poora file

```ts
// app/lib/reports.ts — file ke TOP pe, saare exports cached
"use cache";

export async function getMonthlyTotals() {
  /* cached — async hona zaroori hai */
}
export async function getTopProducts() {
  /* cached */
}
```

> ⚠️ **Rule:** `"use cache"` wale functions **async hone compulsory** hain.

### Cache Key Kaise Banta Hai? (Deep Knowledge)

```
┌─────────────────────────────────────────────────────────────┐
│  CACHE KEY = Build ID + Function ID + Arguments + HMR hash  │
├─────────────────────────────────────────────────────────────┤
│  • Build ID    → Naya deploy = saara cache invalid ✅        │
│  • Function ID → Codebase mein function ki location hash     │
│  • Arguments   → Alag args = alag cache entry                │
│  • HMR hash    → Dev mein hot-reload pe cache refresh        │
│                                                             │
│  Example:                                                    │
│  getProduct('shoes') → ENTRY A                               │
│  getProduct('shirt') → ENTRY B  (alag-alag entries!)         │
│                                                             │
│  Outer scope ke variables AUTOMATICALLY capture ho jaate:     │
│  async function list({ userId }) {                           │
│    "use cache"                                               │
│    // userId (closure) + filter (arg) dono key ka part hain  │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ `"use cache"` Ke Andar Ye MAT Karo

```ts
// ❌ ERROR: cached function mein runtime APIs nahi chalti
async function getUser() {
  "use cache";
  const session = (await cookies()).get("session"); // 💥 Error!
  return db.getUser(session.value);
}

// ✅ CORRECT: bahar se value nikal ke argument mein pass karo
async function Profile() {
  const session = (await cookies()).get("session"); // bahar padho
  return <CachedUser sessionId={session.value} />;  // argument mein bhejo
}

async function CachedUser({ sessionId }: { sessionId: string }) {
  "use cache";   // sessionId ab cache key ka part hai 🎯
  return db.getUser(sessionId);
}
```

**Kyun?** Kyunki `cookies()`, `headers()`, `searchParams` **per-request** hota hai, aur cached function **shared** hai (sabko same output chahiye). Request data daloge toh cache ka meaning hi khatam.

### Uncached Data Kaise Stream Kare — `<Suspense>`

```tsx
// ✅ Cached + uncached + static — teeno ek page mein
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <StaticHeader />          {/* Prerendered — hamesha instant */}

      <CachedProducts />        {/* "use cache" — static shell mein */}

      <Suspense fallback={<p>Loading your orders...</p>}>
        <UserOrders />          {/* Uncached — request pe stream hoga */}
      </Suspense>
    </>
  );
}
```

> Suspense ka **fallback** static shell ke saath ship hota hai — user ko turant kuch dikhta hai, baad mein content aata hai. **Ye hi streaming ka magic hai.** 🎉

---

## 5️⃣ Cache Timing Options — `stale` / `revalidate` / `expire`

Har `use cache` entry ke **3 timers** hote hain. Ye samajh lo toh poora caching samajh aa jayega:

### 🗺️ Diagram: Timeline of a Cache Entry

```
cacheLife({ stale: 300, revalidate: 3600, expire: 86400 })
│
▼ time ──────────────────────────────────────────────────────────────────►
│
├──── FRESH ────┤
0            stale (5 min)
│  User ko hamesha yahan cached data milta hai,
│  koi server check nahi, INSTANT ⚡
│
│                ├──── STALE ──────────────────────────┤
│                stale                           revalidate (1 hr)
│                │  Cache "purana" ho gaya hai lekin
│                │  abhi bhi serve hota hai ✅
│                │  • Client: yahan server check karega
│                │  • Server: pehla request = TURANT purana
│                │    data + background mein naya fetch 🔄
│                │
│                │                ├──── EXPIRED-ish ───┤
│                │                revalidate         expire (24 hr)
│                │                │  Ab naya content ready
│                │                │  serve hone lagta hai
│                │                │
│                │                │                   ├──── HARD EXPIRE ──┤
│                │                │                   expire        ∞
│                │                │                   │  Agla request
│                │                │                   │  BLOCK karega
│                │                │                   │  fresh content
│                │                │                   │  ke liye ⏳
│
▼
├────────────────────────────────────────────────────────────────────────┤
│  HAR TIME WINDOW KA MATLAB:                                            │
│                                                                        │
│  stale      → "Kitni der tak CLIENT bina check ke chala le?"           │
│  revalidate → "Kitni der baad SERVER background mein refresh kare?"     │
│  expire     → "Kitni der baad entry MUST regenerate ho?"                │
└────────────────────────────────────────────────────────────────────────┘
```

### 3 Options Ka Ek-Line Funda

| Option | Kahan | Matlab |
|---|---|---|
| **`stale`** | Client-side (browser) | Itni der tak client bina server check ke cached dikha sakta hai |
| **`revalidate`** | Server-side | Itni der baad aaya request → purana serve + background refresh |
| **`expire`** | Server-side | Itni der baad → next request fresh content ke liye **block** karega |

### Real Example — 3 Timers Dekho

```ts
"use cache";
cacheLife({
  stale: 60, // 1 min tak client ko bina check ke dikhega
  revalidate: 300, // 5 min baad background refresh start
  expire: 3600, // 1 hr baad hard expiry — next request fresh banega
});
```

> ⚠️ **Rule:** `expire` > `revalidate` hona chahiye. Warna Next.js **error** dega.

### Prerendering Thresholds (Deep Knowledge ⭐)

Timers **ye bhi decide karte hain** ki content static shell mein aayega ya request-time pe:

```
┌────────────────────────────────────────────────────────────────┐
│  SHORT-LIVED cache (dynamic hole ban jaata hai):               │
│  • revalidate: 0  ya  expire < 5 minute                        │
│  • stale < 30 seconds                                          │
│  → Prerender mein NAHI aata, request pe resolve hota hai        │
│                                                                │
│  MIDDLE ground:                                                │
│  • stale 30s se 5 min ke beech                                 │
│  → Prerender mein aata hai, lekin App Shell mein NAHI           │
│                                                                │
│  LONG-LIVED:                                                   │
│  • stale ≥ 30 seconds, expire ≥ 5 minutes                      │
│  → Static shell ka part ✅ — CDN se serve hoga                  │
└────────────────────────────────────────────────────────────────┘

Isliye: cacheLife('seconds') wala content STATIC shell mein nahi jaata
        (expire 1 min < 5 min threshold) — woh dynamic hole hai.
```

**Client-side minimum:** Router **30 seconds ka minimum stale time** enforce karta hai — chahe kitna bhi chhota `stale` do, prefetched link click hone se pehle expire na ho jaye. 🎯

---

## 6️⃣ `cacheLife` — Lifetime Profiles

### Preset Profiles (Sabse Common Use)

```ts
import { cacheLife } from "next/cache";

export async function getBlogPosts() {
  "use cache";
  cacheLife("days"); // 👈 Bas itna likho — baaki sab preset mein hai
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}
```

### 📋 Complete Profile Table

| Profile | `stale` | `revalidate` | `expire` | Kab Use Karein |
|---|---|---|---|---|
| `default` | 5 min | 15 min | never | Jab `cacheLife` hi na likho (implicit) |
| `seconds` | 30 sec | 1 sec | 1 min | Real-time — stock price, live score ⚡ |
| `minutes` | 5 min | 1 min | 1 hour | Social feed, news ticker |
| `hours` | 5 min | 1 hour | 1 day | Inventory, weather, product list ☀️ |
| `days` | 5 min | 1 day | 1 week | Blog posts, articles 📝 |
| `weeks` | 5 min | 1 week | 30 days | Podcasts, newsletters 🎙️ |
| `max` | 5 min | 30 days | 1 year | Legal pages, archived content 📜 |

> **Funda:** `cacheLife` ke bina `default` profile lag jaata hai (stale 5m, revalidate 15m, expire never). Docs **recommend karte hain** ki har `use cache` mein explicit `cacheLife` likho — call site pe behavior clear rahe.

### Custom Profiles — `next.config.ts` Mein Define Karo

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    editorial: {
      stale: 600, // 10 min
      revalidate: 3600, // 1 hour
      expire: 86400, // 1 day
    },
    marketing: {
      stale: 300, // 5 min
      revalidate: 1800, // 30 min
      expire: 43200, // 12 hour
    },
  },
};
```

```ts
// Ab app mein kahin bhi:
cacheLife("editorial"); // ✅ Reusable, team ke liye consistent
```

### Inline Profile — Ek-Baar Wala Use

```ts
export async function getLimitedOffer() {
  "use cache";
  cacheLife({
    stale: 60,
    revalidate: 300,
    expire: 3600,
  });
  // ...
}
```

### ⭐ Conditional Cache Lifetime (Advanced)

Data ke hisaab se lifetime change kar sakte ho:

```ts
import { cacheLife, cacheTag } from "next/cache";

async function getPostContent(slug: string) {
  "use cache";
  const post = await fetchPost(slug);
  cacheTag(`post-${slug}`);

  if (!post) {
    cacheLife("minutes"); // Draft/missing → chhota cache (DB load kam)
    return null;
  }

  cacheLife("days"); // Published → lamba cache
  return post.data;
}
```

### ⚠️ Nested Caching Rule (Interview Favourite ⭐)

```
OUTER "use cache" + INNER "use cache"
        │
        ├── Outer mein EXPLICIT cacheLife hai?
        │       → Outer apna lifetime use karega (inner se koi farak NAHI)
        │
        └── Outer mein cacheLife NAHI hai? (default 15 min)
                → Inner chhota ho toh OUTER BHI chhota ho jaayega!
                  • Inner 'minutes' (5m) → Outer 5m ban jaayega
                  • Inner 'hours' (1h)   → Outer 15m hi rahega (extend NAHI)

🚫 BUILD ERROR: Short-lived cache (seconds/revalidate 0/expire <5min)
   ko bina explicit cacheLife ke outer "use cache" mein use karo toh
   Next.js prerender pe ERROR dega — kyunki accidental misconfig hai.
```

**Fix:** Outer mein hamesha explicit `cacheLife()` likho. ✅

---

## 7️⃣ Revalidation — Cache Kaise Refresh Ho

Revalidation = **purane cache ko todna taaki naya data aaye**. Do strategies hain:

```
┌─────────────────────────────────────────────────────────────┐
│                  REVALIDATION STRATEGIES                     │
├──────────────────────────┬──────────────────────────────────┤
│  ⏰ TIME-BASED           │  🎯 ON-DEMAND                     │
│  cacheLife() se          │  Event ke time manually           │
│  automatically           │  invalidate karte ho              │
├──────────────────────────┼──────────────────────────────────┤
│  cacheLife('hours')      │  cacheTag('users') +             │
│                          │  updateTag / revalidateTag /      │
│                          │  revalidatePath                   │
├──────────────────────────┴──────────────────────────────────┤
│  Dono ek saath use hote hain — long cacheLife + tag on-     │
│  demand invalidation = BEST PATTERN ⭐                       │
└─────────────────────────────────────────────────────────────┘
```

### ⏰ Time-Based — `cacheLife` (upar detail mein cover kiya)

```ts
"use cache";
cacheLife("hours"); // Har ghante mein background refresh
```

### 🎯 On-Demand — Tags ke saath

**Step 1: Cache ko tag do** (tumhari `app/lib/user.ts` mein already hai):

```ts
export async function getUsers() {
  "use cache";
  cacheLife("hours");
  cacheTag("users"); // 👈 Tag lagao
  // ...
}
```

**Step 2: Mutation ke baad tag invalidate karo:**

#### `updateTag()` — Turant Fresh Dikhao (Read-Your-Own-Writes) ✅

Ye tumhare `actions/index.ts` mein actual use ho raha hai:

```ts
"use server";
import { updateTag } from "next/cache";

export async function addUser(name: string, avatar: string) {
  await fetch("https://...api/users", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ name, avatar }),
  });

  updateTag("users"); // 👈 Tag expire — user ko TURANT naya data dikhega!
}

export async function deleteUser(id: string) {
  await fetch(`https://...api/users/${id}`, { method: "DELETE" });
  updateTag("users"); // 👈 Add/Delete ke turant baad list fresh
}
```

**Use case:** User ne product add kiya → list mein **usi second** dikhna chahiye (stale nahi). 🎯

> ⚠️ `updateTag` **sirf Server Actions** mein chalta hai. Route Handler/Webhook mein `revalidateTag` use karo.

#### `revalidateTag(tag, profile)` — Stale-While-Revalidate

```ts
import { revalidateTag } from "next/cache";

// Server Action OR Route Handler — dono mein chalta hai
revalidateTag("products", "max"); // 👈 2nd arg = cache profile (required!)
```

**Kya hota hai:**

```
revalidateTag('products', 'max') chala
        │
        ▼
Pehla request → TURANT purana data serve (block NAHI) ✅
Background mein → Naya data fetch hoke cache update
Agle request   → Fresh data 🔄
```

**Use case:** Blog post publish hui → readers ko abhi bhi purana dikhe, 1 min mein naya aa jaye (thoda delay OK hai).

#### `revalidatePath()` — Poora Route Invalidate

```ts
import { revalidatePath } from "next/cache";

revalidatePath("/profile"); // /profile ka SAARA cached data invalid
```

*Jab tags pata na ho, tab kaam aata hai — lekin tags zyada precise hain.*

### 📊 `updateTag` vs `revalidateTag` — Comparison

```
┌────────────────────┬──────────────────────┬──────────────────────────┐
│                    │ updateTag()          │ revalidateTag(tag, prof) │
├────────────────────┼──────────────────────┼──────────────────────────┤
│ Kahan chalega      │ Sirf Server Actions  │ Server Actions +         │
│                    │                      │ Route Handlers           │
├────────────────────┼──────────────────────┼──────────────────────────┤
│ Behavior           │ TURANT expire        │ Stale-while-revalidate   │
│                    │ (next request        │ (purana serve +          │
│                    │  FRESH lega)         │  background refresh)     │
├────────────────────┼──────────────────────┼──────────────────────────┤
│ Second argument    │ Zaroorat nahi        │ Profile REQUIRED         │
│                    │                      │ (e.g. 'max')             │
├────────────────────┼──────────────────────┼──────────────────────────┤
│ Use case           │ User ko APNA change  │ Slight delay OK hai      │
│                    │ TURANT dikhe         │ (blog, catalog)          │
│                    │ (add/delete/cart)    │                          │
└────────────────────┴──────────────────────┴──────────────────────────┘
```

### 🗺️ Diagram: On-Demand Revalidation Flow

```
        ┌──────────────────────────────────────────┐
        │  USER ne "Add User" button dabaya         │
        └───────────────────┬──────────────────────┘
                            ▼
        ┌──────────────────────────────────────────┐
        │  Server Action: addUser()                │
        │  1. API ko POST bheja (data save)        │
        │  2. updateTag("users") ← CACHE TODA      │
        └───────────────────┬──────────────────────┘
                            ▼
        ┌──────────────────────────────────────────┐
        │  Next request: getUsers()                │
        │  Cache MISS (expire ho chuka) →          │
        │  API se FRESH data → store → response    │
        │                                          │
        │  User ko TURANT naya list dikhta hai ✅   │
        └──────────────────────────────────────────┘
```

---

## 8️⃣ Diagram Explanations — Visual Summary

### 🗺️ Diagram 1: PPR — Static Shell + Dynamic Holes (Cache Components Ka Dil)

```
┌──────────────────────────────────────────────────────────────────┐
│  PAGE: /dashboard                                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  STATIC SHELL (prerendered — build time pe bana) ⚡          │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │  <Nav/>  │  │ <CachedStats │  │  <Suspense fallback> │  │  │
│  │  │  static  │  │  "use cache" │  │  "Loading orders..." │  │  │
│  │  │          │  │  cacheLife   │  │  ← fallback bhi      │  │  │
│  │  │          │  │  ('hours')   │  │    SHELL ka part! 🎯  │  │  │
│  │  └──────────┘  └──────────────┘  └──────────┬───────────┘  │  │
│  └─────────────────────────────────────────────┼──────────────┘  │
│                                                │                 │
│  ┌─────────────────────────────────────────────▼──────────────┐  │
│  │  DYNAMIC HOLES (request time pe render hote hain) 🕳️        │  │
│  │                                                            │  │
│  │  • <UserOrders/> — uncached fetch                          │  │
│  │  • <ThemeToggle/> — cookies() padhta hai                   │  │
│  │  • short-lived cache (cacheLife('seconds'))                │  │
│  │                                                            │  │
│  │  ⏳ Content aate hi DOM mein insert (streaming)             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  RESULT: User ko TURANT shell milta hai (CDN se),                │
│          baaki content background mein aata hai 🎉               │
└──────────────────────────────────────────────────────────────────┘
```

### 🗺️ Diagram 2: Pehli Request vs Baad Ki Requests

```
═══════════════════ PEHLI REQUEST (cold) ═══════════════════

  Request ──► Prerender check ──► "use cache" EMPTY ──► Function CHALEGA
                                                              │
                                                              ▼
                                                      Result STORE hua
                                                              │
                                                              ▼
                                              Response (thoda slow — 200ms) 🐢

═══════════════════ BAAD KI REQUESTS (warm) ═══════════════════

  Request ──► Prerender check ──► "use cache" FRESH ──► CACHE HIT ✅
                                                              │
                                                              ▼
                                              Response (bahut fast — 5ms) 🚀
                                              + Static shell CDN se


═══════════════════ ON-DEMAND INVALIDATION ═══════════════════

  updateTag('users') ──► Entry EXPIRED
                              │
  Next request ──► MISS ──► Fresh fetch ──► Store ──► Response (fresher, fast)
```

### 🗺️ Diagram 3: Kab Kaunsa Cache? (Decision Tree)

```
                  Data ko cache karna hai?
                          │
              ┌───────────┴───────────┐
              │ NO                    │ YES
              ▼                       ▼
   Bas bahar rakho              Data badalta hai?
   (default uncached)                 │
   <Suspense> wrap karo        ┌──────┴──────┐
                               │ YES         │ NO
                               ▼             ▼
                     Kitni der baad?    "use cache"
                     chhota update?     cacheLife('max')
                           │            cacheTag('x')
              ┌────────────┼────────────┐      │
              ▼            ▼            ▼      ▼
          seconds/     hours/days    weeks/   Kabhi nahi
          minutes                     max     badalta
              │            │            │      │
              ▼            ▼            ▼      ▼
        cacheLife()   cacheLife()   cacheLife()  cacheLife('max')
        + SHORT       + cacheTag    + cacheTag   + cacheTag
        profile       + LONGER      + LONGEST    + updateTag on
                      profile       profile      mutation

   + MUTATION ke baad: updateTag() (Server Action)
                       ya revalidateTag('x', 'max') (webhook)
```

---

## 9️️⃣ Real-Life Usages — Production Patterns

### 🛒 Pattern 1: E-Commerce Product Page

```ts
// app/lib/products.ts
import { cacheLife, cacheTag } from "next/cache";

// Product details — daily update hota hai
export async function getProduct(id: string) {
  "use cache";
  cacheLife("days");
  cacheTag(`product-${id}`);
  return db.product.findUnique({ where: { id } });
}

// Stock/inventory — frequently badalta hai
export async function getStock(id: string) {
  "use cache";
  cacheLife("minutes"); // 1 min mein refresh
  cacheTag(`stock-${id}`);
  return db.stock.findUnique({ where: { productId: id } });
}

// Categories — kabhi nahi badalte
export async function getCategories() {
  "use cache";
  cacheLife("max"); // 1 year tak!
  cacheTag("categories");
  return db.category.findMany();
}
```

```ts
// Cart — CACHED BILKUL NAHI (per-user, real-time)
async function Cart() {
  const cart = await db.cart.find({ userId }); // ❌ "use cache" mat lagao
  return <CartView items={cart} />;
}
// Ye <Suspense> mein — fallback dikhega, phir cart stream hoga
```

**Stock update webhook:**

```ts
// app/api/webhook/route.ts — Route Handler
export async function POST(req: Request) {
  const { productId } = await req.json();
  revalidateTag(`stock-${productId}`, "max"); // SWR — turant block nahi
  return Response.json({ ok: true });
}
```

### 📝 Pattern 2: Blog with CMS Webhook

```ts
// app/lib/posts.ts
export async function getPost(slug: string) {
  "use cache";
  cacheLife("max"); // Time-based revalidation BAND — long cache
  cacheTag(`post-${slug}`);
  return cms.getPost(slug); // CMS fetch
}

export async function getAllPosts() {
  "use cache";
  cacheLife("max");
  cacheTag("posts");
  return cms.getAllPosts();
}
```

```ts
// CMS publish kare → webhook aaye → turant invalidation
// app/api/webhook/route.ts
export async function POST() {
  revalidateTag("posts", "max"); // sab posts refresh (SWR)
  return Response.json({ ok: true });
}
```

**Funda:** CMS khud batata hai "content badla" → time ka intezaar mat karo. Long `cacheLife` + on-demand invalidation = **best of both worlds** ⭐

### 📊 Pattern 3: Dashboard (User-Specific Data)

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <>
      <StaticNav />                {/* Prerendered shell */}

      {/* Cached — sabko same dikhega */}
      <Suspense fallback={<p>Loading reports...</p>}>
        <CompanyReports />         {/* "use cache" + cacheLife('hours') */}
      </Suspense>

      {/* User-specific — cached NAHI */}
      <Suspense fallback={<p>Loading your activity...</p>}>
        <UserActivity />           {/* cookies() padhta hai */}
      </Suspense>
    </>
  );
}
```

### 🗞️ Pattern 4: News Feed (Time-Sensitive)

```ts
export async function getNews() {
  "use cache";
  cacheLife("minutes"); // 1 min — hamesha taaza khabar
  cacheTag("news");
  return api.getLatestNews();
}
```

### ✍️ Pattern 5: Form Mutation + Immediate Refresh (Tumhara Repo Wala Pattern)

```
Form Submit → Server Action → DB/API mutation → updateTag() → UI fresh 🎯

Tumhare repo mein EXACTLY yahi hai:
  components/users.tsx (client form)
        ↓ submit
  actions/index.ts → addUser()/deleteUser() → updateTag("users")
        ↓
  app/lib/user.ts → getUsers() ka cache expire → fresh list ✅
```

### 📌 Real-Life Cheat Sheet

| Content Type | Strategy |
|---|---|
| Legal/Terms pages | `cacheLife('max')` + `cacheTag` + webhook |
| Blog posts | `cacheLife('max')` + CMS webhook → `revalidateTag` |
| Product details | `cacheLife('days')` + `cacheTag('product-id')` |
| Stock/Inventory | `cacheLife('minutes')` + stock webhook |
| News feed | `cacheLife('minutes')` |
| Live scores | `cacheLife('seconds')` (dynamic hole!) |
| User cart/balance | **No cache** + `<Suspense>` |
| Session/profile | **No cache** (`cookies()`) — ya `'use cache: private'` |
| After add/edit/delete | `updateTag()` in Server Action |

---

## 🔍 Is Repo Ka Code Walkthrough

### File Structure

```
14-caches/
├── next.config.ts          ← cacheComponents: true + partialPrefetching: true
├── app/
│   ├── page.tsx            ← Suspense + UserManagement render karta hai
│   └── lib/
│       └── user.ts         ← ⭐ getUsers() with "use cache" + cacheLife + cacheTag
├── actions/
│   └── index.ts            ← ⭐ Server Actions: addUser/deleteUser + updateTag("users")
├── components/
│   ├── users.tsx           ← Client component (form + list) — "use client"
│   └── user-list.tsx       ← Server component example (abhi commented)
```

### Flow Diagram — Ye Repo Kaise Kaam Karta Hai

```
┌────────────────────────────────────────────────────────────────┐
│  app/page.tsx                                                   │
│  <Suspense fallback="Loading Users....">                        │
│    <UserManagement/>   ← components/users.tsx ("use client")    │
│  </Suspense>                                                    │
└──────────────────────────┬─────────────────────────────────────┘
                           │ form submit
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  actions/index.ts ("use server")                                │
│  addUser(name, avatar)                                          │
│    1. mockapi.io pe POST → user save                            │
│    2. updateTag("users") → "users" tag wala cache EXPIRE 🔥     │
│                                                                │
│  deleteUser(id)                                                 │
│    1. mockapi.io pe DELETE                                      │
│    2. updateTag("users") → same invalidation                    │
└──────────────────────────┬─────────────────────────────────────┘
                           │ agli baar data chahiye
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  app/lib/user.ts                                                │
│  getUsers()                                                     │
│    "use cache"      → output cache mein store                   │
│    cacheLife("hours")→ 1 hr fresh                               │
│    cacheTag("users") → updateTag("users") se invalid hoga 🔥    │
│    fetch(mockapi)   → pehli baar chalega, phir cache se         │
└────────────────────────────────────────────────────────────────┘
```

### Chalao Aur Khud Dekho 🧪

**Experiment 1 — Cache dekho:**
```bash
# Server component example enable karo:
# components/user-list.tsx uncomment karo
# app/page.tsx mein <UserList/> use karo

NEXT_PRIVATE_DEBUG_CACHE=1 bun dev
# Ab console mein cache HIT/MISS logs dikhenge 🔍
```

**Experiment 2 — On-demand invalidation:**
```
1. Page pe user list load karo (pehli fetch — slow, cache MISS)
2. Naya user add karo (form se)
3. updateTag("users") chala → cache expire
4. List refresh karo → FRESH data aayega (API mein naya user dikhega) ✅
```

**Experiment 3 — Timing badal ke dekho:**
```ts
// app/lib/user.ts mein cacheLife change karo:
cacheLife("seconds");  // 1 sec — turant stale, har request pe refresh
cacheLife("minutes");  // 1 min background refresh
cacheLife("hours");    // default is repo ka
cacheLife("max");      // 30 din tak — update ke baad bhi purana dikhega
                       // (tab updateTag hi kaam karega!) 🎯
```

> **Note:** `components/users.tsx` abhi client-side state (`useState`) se list manage karta hai — ye **client cache** ka example hai. `user-list.tsx` (commented) **server cache** (`"use cache"`) ka example — dono compare karke samjho!

---

## 🎯 Interview Cheat Sheet (1-Minute Revision)

```
Q: Next.js mein caching layers?
A: Client Router Cache → Prerendered HTML (Static Shell) →
   Server Cache ("use cache") → Fetch Data Cache → DB/API

Q: force-cache vs no-store?
A: force-cache = ek baar fetch, hamesha cache (deploy tak)
   no-store = har request fresh (ab default bhi yahi hai)

Q: "use cache" kya karta hai?
A: Function/component ka output cache karta hai.
   Args = cache key ka part. Async hona zaroori.
   Runtime APIs (cookies/headers) allowed NAHI.

Q: stale / revalidate / expire?
A: stale    = client itni der bina check ke chala le
   revalidate = server itni der baad background refresh kare
   expire   = itni der baad hard expiry, next request block

Q: updateTag vs revalidateTag?
A: updateTag = Server Action only, TURANT fresh (read-your-own-writes)
   revalidateTag(tag, 'max') = SWR, purana + background refresh,
   Server Action + Route Handler dono

Q: cacheComponents kya badalta hai?
A: Sab dynamic by default → jo cache karna ho "use cache" bolo.
   PPR default → static shell + <Suspense> holes.
   Purane route segment configs (dynamic/revalidate/fetchCache) hat jate hain.

Q: Kaunsa data cache NAHI karna chahiye?
A: Per-user/session data (cookies, cart, balance) —
   warna ek user ka data doosre ko dikhega! 🚨
```

---

## 📚 Official Docs (Next.js 16.4.3 ke liye)

- [Caching (Cache Components)](https://nextjs.org/docs/app/getting-started/caching)
- [`"use cache"` directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating)
- [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) / [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Caching (Previous Model — force-cache/no-store)](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components)

---

> **Yaad rakho:** Caching ka funda simple hai —
> ***"Jo data sabko same dikhta hai aur frequently nahi badalta, use cache karo. Jo user-specific hai, usse request time pe chalne do."*** 🎯
