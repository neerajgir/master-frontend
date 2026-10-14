# 🚀 07 — Server Actions & App Optimization (Next.js)

> **Learning / Study Notes Repo** — Ye folder mera Next.js **App Router ka practical notebook** hai, jahan maine kuch high-value topics ko **chote-chote working code** ke saath hands-on karke samjha: **Server Actions, Fonts (`next/font`), Form component (`next/form`), Link & Script, Image (local vs remote)** — plus har topic ke **diagram explanations** aur **real-life usages**.

Yahan ke sabhi code snippets **isi repo ki actual files** se liye gaye hain — README kholke saath me code files bhi kholo, tabhi maza aayega. 😄

## 📇 Index — Is Repo Mein Kya Seekha

| # | Topic | Kya milega |
|---|-------|------------|
| 1 | [Server Actions (Next.js)](#1-server-actions-nextjs) | `"use server"`, bina API route ke mutation, RPC under-the-hood |
| 2 | [Fonts in Next.js (next/font)](#2-fonts-in-nextjs-nextfont) | self-hosted Google fonts, zero CLS, per-page font |
| 3 | [Form Component in Next.js (next/form)](#3-form-component-in-nextjs-nextform) | `<Form>` se server action + GET search dono |
| 4 | [Link and Script Components](#4-link-and-script-components) | SPA navigation, prefetch, script load strategies |
| 5 | [Image Component (Local vs Remote)](#5-image-component-local-vs-remote) | `next/image` optimization, `remotePatterns` config |
| 6 | [Diagram Explanations](#6-diagram-explanations) | Saare flows ek jagah ASCII diagrams me |
| 7 | [Real-life Usages](#7-real-life-usages) | Production me kahan lagta hai (scenario → solution) |
| 8 | [Other Concepts (Bonus)](#8-other-concepts-bonus) | `use client` vs `use server`, metadata, searchParams, caching flags |

## 🛠 Tech Stack

| Layer | Tool / Version |
|-------|----------------|
| Framework | **Next.js 16.4.0** — App Router + Turbopack |
| UI | **React 19.3.0** — Server Components + Actions |
| Styling | **Tailwind CSS 4** (`@tailwindcss/turbopack` loader) |
| Package Manager | **Bun 1.4.3** (`bun.lock`) |
| Lint | ESLint 9 + `eslint-config-next` |
| Path Alias | `@/*` → repo root (`jsconfig.json`) |

### ⚙️ Special flags — `next.config.mjs`

```js
const nextConfig = {
  cacheComponents: true,      // Next ka naya caching model (dynamic IO + partial prerender)
  partialPrefetching: true,   // poore route ki jagah sirf zaruri part prefetch
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
```

## ▶️ Setup — Chalana Kaise Hai

```bash
cd Nextjs/07-server-actions-app-optimization

bun install   # dependencies install
bun dev       # dev server → http://localhost:3000

bun build     # production build
bun start     # production server
bun lint      # eslint
```

> `package.json` me `packageManager: "bun@1.4.3"` set hai, isliye **bun** hi use karo.

## 📂 Project Structure

```
07-server-actions-app-optimization/
├── actions/
│   └── action.js          # ⭐ "use server" file — saare Server Actions
├── app/
│   ├── layout.js          # Root layout — Poppins font + metadata
│   ├── page.js            # Home — <Image> + <Link> (+ commented inline action)
│   ├── globals.css        # Tailwind 4 entry
│   ├── about/page.jsx     # "use client" — Roboto Mono font, Link replace/onNavigate
│   ├── forms/page.jsx     # "use client" — next/form (action + GET) + router.back()
│   └── search/page.jsx    # Async server page — await searchParams + API fetch
├── public/
│   ├── img.jpeg           # Local image (next/image demo)
│   └── *.svg
├── next.config.mjs        # cacheComponents + partialPrefetching + tailwind rule
├── jsconfig.json          # "@/*" alias
└── package.json
```

## 🗺️ Routes Map

| Route | File | Component type | Kya seekha |
|-------|------|----------------|-----------|
| `/` | `app/page.js` | Server | local `<Image>`, `<Link>`, commented inline Server Action |
| `/about` | `app/about/page.jsx` | `"use client"` | per-page font, `<Link replace onNavigate>` |
| `/forms` | `app/forms/page.jsx` | `"use client"` | `<Form action={serverAction}>`, `<Form action="/search">`, `router.back()` |
| `/search` | `app/search/page.jsx` | Async Server | `await searchParams`, server-side `fetch()` |


## 1. Server Actions (Next.js)

### 🤔 Server Action hai kya?

Pehle har mutation (data save/update) ke liye **alag se API route** banana padta tha (`app/api/todos/route.js`), aur client me `fetch()` + `JSON.stringify/parse` sab khud likhna padta tha. **Server Action** usi ka Next.js ka **native, secure aur type-friendly** version hai: tum ek **async function** likhte ho aur use seedha `<form action={...}>` ya event handler me de dete ho — **Next.js khud usse server par execute karke UI ko fresh data de deta hai.**

**Ek line me:**
> *Server Action = ek async function jo build time me ek secure **POST / RPC endpoint** ban jata hai — koi alag API route, axios, ya JSON handling nahi.*

### 🆚 Traditional API Route vs Server Action

```
  TRADITIONAL (API ROUTE)                 SERVER ACTION
 ┌────────┐  fetch POST  ┌───────────┐   ┌─────────┐  bundled ref  ┌──────────────┐
 │ Client │ ───────────► │/api/todos │   │ Client  │ ────────────► │ async        │
 │        │ ◄─────────── │ route.js  │   │ <form>  │ ◄──────────── │ createTodo() │
 └────────┘  JSON parse  └───────────┘   └─────────┘  server render└──────────────┘
  • routing + body parse +               • sirf ek async function
    JSON + error handling                  likho — baaki Next
    sab khud                              sambhalta hai
```

### ✍️ Syntax — 2 tarike (dono isi repo me hain)

**(a) Alag file + top-level `"use server"`** → poora file action ka ghar ban jata hai
(`actions/action.js` — isi repo ka real file):

```js
// actions/action.js
"use server"

export async function createTodo(formData) {
    const title = formData.get("title")
    console.log("creating todo", title)
}

export async function updateTodo(title, desc, isCompleted) {
    const newData = { title, desc, isCompleted }
    // ---- db call (Prisma/Mongo — ye server par chalega) ----
    return { success: true, message: "Update Successfully", newData }
}

export async function submitUser(formData) {
    const name = formData.get("name")
    const email = formData.get("email")
    console.log("Submit user data", name, email)
}
```

**(b) Component ke andar hi inline** — function ke body me **sabse pehle line**
(`app/page.js` ka commented learning example isi ka hai):

```js
// app/page.js
async function createTodo(formData) {
  "use server";
  const title = formData.get("title");
  console.log("creating todo", title);
}

export default function Home() {
  return (
    <form action={createTodo}>
      <input name="title" />
      <button type="submit">Add Todo</button>
    </form>
  );
}
```

> ⚠️ **Rules:**
> - File-level directive me **sirf `async function` export** ho sakte hain (const/arrow export = build error).
> - Inline style me `"use server"` directive **function ke andar sabse pehle** aani chahiye — warna woh normal function reh jayega.
> - Directive wale file ka **andar ka code kabhi browser me nahi jata** — bundle me sirf ek reference hota hai.


### 🔁 Under the hood — request kaise chalta hai

```
  BROWSER (Client)                          NEXT SERVER
 ────────────────                           ─────────────────────────────────
 1. <form action={createTodo}> render
    → bundler har action ko ek
      "Action ID" me badalta hai
 2. User ne Submit dabaya
    → JS ho ya na ho, browser ek
      POST karta hai (same URL, header
      "Next-Action: <id>" ke saath)
 ─────────────────────────────────────────► 3. Next ka server POST ko pehchanta hai
                                             4. Action ID se original function
                                                dhoondh kar RUN karta hai
                                             5. formData.get() → auth → db write
    ◄────────────────────────────────────── 6. naya RSC payload (fresh UI tree)
 7. UI automatic update — koi manual          (+ revalidatePath/redirect ho to
    setState/JSON parse nahi ❌                  cache bhi refresh ✅)
```

**Deep points:**
- Ye asal me ek **RPC (Remote Procedure Call)** hai — HTTP POST apne hi page URL par, `Next-Action` header se identify hota hai.
- **Progressive Enhancement:** inputs me `name` hai to action **bina JavaScript ke bhi** chalta hai (native HTML POST); JS on hote hi Next usse enhanced client-side call me badal deta hai.
- Args sirf **serializable** hone chahiye (string/number/object/File) — function/class instance nahi bhej sakte.
- **Security by design:** action ka code server par hi hai — secret keys/DB strings bundle me nahi aate. Par yaad rakho: action ek **public endpoint** hai, isliye andar **auth check zaroor** likho.

### 📎 Form me use + pending state (React 19)

```jsx
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitUser } from "@/actions/action";

function SubmitBtn() {
  const { pending } = useFormStatus();   // sirf form KE ANDAR wala child chalega
  return <button disabled={pending}>{pending ? "Saving..." : "Submit"}</button>;
}

export default function UserForm() {
  // React 19: [state, formAction, isPending] = useActionState(action, initial)
  const [state, formAction, isPending] = useActionState(
    async (prev, formData) => {
      const name = formData.get("name");
      return { ok: true, msg: `Saved "${name}" 🎉` };
    },
    null
  );

  return (
    <form action={formAction}>
      <input name="name" required />
      <SubmitBtn />
      {isPending ? "Saving..." : state?.msg}
    </form>
  );
}
```

**Event handler se bhi bula sakte ho** (repo ke `updateTodo` jaisa plain-args action):

```jsx
"use client";
import { updateTodo } from "@/actions/action";

<button onClick={async () => {
    const res = await updateTodo("Learn Next.js", "Server Actions deep dive", true);
    console.log(res.message); // "Update Successfully"
  }}>
  Mark Done
</button>
```

### 📋 Rules & Safety Checklist

| # | Rule | Kyun zaroori |
|---|------|--------------|
| 1 | Directive file me **sirf async exports** | Next wahi sab action IDs banata hai |
| 2 | Har action me **auth/ownership check** | koi bhi browser se POST kar sakta hai |
| 3 | Mutation ke baad **`revalidatePath()` / `revalidateTag()` / `redirect()`** | warna purana cached UI dikhta rahega |
| 4 | Hover/toggle jaisi UI state ke liye **useState** | har click par POST = faltu network trip |
| 5 | Secrets **args me kabhi mat** bhejo | network par visible hote hain |
| 6 | Server-side `console.log` action ke andar rakho | server terminal me dikhega, client me nahi |

### 🌍 Real-life usages
- **Newsletter / Contact form** → save + email API (Resend/SMTP) — `app/api` route ki zarurat nahi
- **Add to Cart / Wishlist** → DB mutation + `revalidatePath("/")` se header cart count auto refresh
- **Login / Logout / Signup** → cookie set/clear + `redirect("/dashboard")`
- **Admin: create/edit/delete post** → form action + revalidate
- **File upload** → `formData.get("file")` (File object server par milta hai)


## 2. Fonts in Next.js (`next/font`)

### 🤔 Problem kya hai (normal `<link>` se)?

Google Fonts ka `<link rel="stylesheet">` head me daal do — chalta hai, par 2 problem:
1. **Do extra round-trips** → pehle `fonts.googleapis.com` se CSS, phir `fonts.gstatic.com` se font file. Slow/blocked network par **fallback font dikhta rehta hai (FOUT)**.
2. **CLS (Cumulative Layout Shift)** → pehle system font se text render hota hai, phir font aake size/spacing badal deta hai — **layout shift** = Lighthouse score bigadta hai.

### ✅ Solution — `next/font` (isi repo ka `app/layout.js`)

```js
// app/layout.js
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],                       // sirf needed glyphs (size ↓)
  display: 'swap',                          // fallback pehle, font aane par swap
  weight: ['400', '500', '600', '700']      // sirf jitne actually chahiye
});

export const metadata = { title: "Create Next App", description: "Generated by create next app" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

### 📊 Kaise chalta hai (diagram)

```
  NORMAL <link>                            next/font
  ─────────────                            ──────────────────────────────
  BUILD/RUNTIME:                            BUILD TIME:
   HTML → CSS request                        Google se font file DOWNLOAD
        → font file request                  + size-adjust fallback CSS generate
        → paint (shift ⚠️, FOUT ⚠️)          + self-host copy → /_next/static/media/
  RUNTIME: Google ko 2+ hits 🔴              + <link rel="preload"> emit
                                             RUNTIME: 0 Google hit 🟢
                                             fallback already metrics-matched
                                             → CLS ≈ 0 ✅
```

### 🧠 Options — deep table

| Option | Kya karta hai | Note |
|--------|---------------|------|
| `subsets` | Character set chuniye (`latin`, `devanagari`...) | Google fonts me **required** |
| `weight` | `'400'` array ya `'variable'` | kam weights = kam bytes |
| `display` | `swap` / `block` / `fallback` / `optional` | `swap` = safe default; `optional` = zero shift but miss ho sakta hai |
| `preload` | `true` (default) → `<link rel=preload>` emit | secondary fonts me `false` bhi kar sakte ho |
| `fallback` | Fallback family naam | `adjustFontFallback` automatic true |
| `variable` | `--font-poppins` CSS variable | `className={poppins.variable}` → Tailwind `font-sans` override |

**Apni local font file se (`next/font/local`):**
```js
import localFont from "next/font/local";

const myFont = localFont({
  src: "./fonts/MyFont.woff2",
  weight: "400", style: "normal",   // local file me ye declare karna PADTA hai
  variable: "--font-my",
});
```

**Per-page font — repo ka `/about` example:**
```js
// app/about/page.jsx  (ye "use client" page hai — font client par bhi chalta hai ✅)
import { Roboto_Mono } from 'next/font/google'

const roboto_mono = Roboto_Mono({ subsets: ['latin'], display: 'swap' })

<section className={`text-gray-600 body-font ${roboto_mono.className}`}>
```

> 🧭 **Kahan define karein?** Har page chahiye → `layout.js` (ek hi baar load). Sirf ek page/section chahiye → us file me. `next/font` client component me bhi import ho sakta hai — ye CSS class + static asset generate karta hai.

### 🌍 Real-life usages
- **Brand kit** → Heading: Poppins, Body: Inter, Code: Roboto Mono (isi repo me kiya)
- **Lighthouse CLS < 0.1** chahiye → hamesha `next/font`, kabhi raw Google `<link>` nahi
- **GDPR/privacy** → self-host = Google ko runtime hit hi nahi
- Regional site → `subsets: ['devanagari']` wali font select karo
- `display: swap` = content pehle dikh jaye (perceived speed fast)


## 3. Form Component in Next.js (`next/form`)

### 🤔 `<Form>` kya hai?

Normal `<form>` ya to **full page reload** karta hai, ya hame khud `onSubmit → preventDefault → router.push()` sab likhna padta hai. Next.js 15.1+ me aaya **`<Form>` component** — ye form ko **client-side navigation** se jod deta hai: ya to **Server Action** chalao, ya **GET se navigate** karke `searchParams` update karo. Bina JS ke bhi (progressive enhancement) kaam karta hai.

### ✅ Repo ka live example — `app/forms/page.jsx`

```jsx
"use client"
import { submitUser } from '@/actions/action';
import Form from 'next/form';
import { useRouter } from 'next/navigation'

const FormPage = () => {
  const router = useRouter();
  return (
    <div>
      <h1>Create User</h1>
      {/* CASE 1 — action = SERVER ACTION function → mutation (POST) */}
      <Form action={submitUser}>
        <input type="text" name="name" placeholder="Enter Name" />
        <input type="email" name="email" placeholder="Enter Email" />
        <button type="submit">Submit</button>
      </Form>

      <h1>Search Form</h1>
      {/* CASE 2 — action = STRING path → GET navigate + searchParams */}
      <Form action={"/search"}>
        <input type="text" name="query" placeholder="Search post-id" />
        <button type="submit">Search</button>
      </Form>

      <button onClick={() => router.back()}>Go Back</button>
    </div>
  )
}
```

**Case 2 submit karte hi:**
`/forms` → **`/search?query=5`** (client navigation, form ke values query string me) → `/search` ka **server component re-render** hota hai:

```jsx
// app/search/page.jsx
const SearchPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;  // ⚠️ Next 15+ me ye PROMISE hai
  const id = resolvedSearchParams.query;
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const data = await res.json();
  return (<div><h2>{data.title}</h2><p>{data.body}</p></div>);
};
```

### 🆚 Comparison — 3 tarike

```
 <form action="/search">               → full page reload 🔴 (SPA benefit gaya)
 onSubmit + preventDefault + router...  → sab khud likhna padta 🟡
 <Form action="/search">                → client nav + searchParams + server
                                           re-render + no-JS bhi chalega 🟢
 <Form action={serverAction}>           → pending state + action ID + auto UI
                                           update 🟢
```

### 🧠 Deep points
- `action` **function** → Server Action path (mutation). `action` **string** → GET navigation (search/filter).
- GET case me inputs **query string me serialize** hote hain — har input ka `name` attribute **zaroori** hai.
- Query string URL me aata hai = **shareable + SEO friendly + back/forward button sahi kaam karte hain**.
- Dono cases me Next **client-side navigation** use karta hai — document reload nahi hota.
- Bade forms me **field validation** server action me karo (jaise `zod` se), error state `useActionState` se dikhao.
- `<Form>` `<form>` ka drop-in replacement hai — `method`, `className` jaise normal attributes pass ho jate hain.

### 🌍 Real-life usages
- **E-commerce filters** → `<Form action="/products">` + category/price selects → shareable `?category=shoes`
- **Header search bar** → `<Form action="/search">` — keyword URL me chala jayega
- **Login/Signup/Contact** → `<Form action={loginAction}>` + `useActionState` me error/success messages


## 4. Link and Script Components

### 🔗 A. `<Link>` — `next/link`

**Kya karta hai plain `<a>` ke compared:**
1. **SPA navigation** — poora document reload nahi, sirf naya UI stream hota hai.
2. **Prefetching** — viewport/hover pe route ka data/bundle pehle se load.
3. **Loading boundaries** — `loading.js` ke saath smooth transitions.

**Repo me use:**
```jsx
// app/page.js — Home se About
<Link href={"/about"} className="text-blue-500 underline px-4 py-5">
  Go to About
</Link>

// app/about/page.jsx — extra props ke saath
<Link href={"/forms"} className="text-blue-500 underline px-4 py-5"
      replace                        // history replace: back me /about wapas nahi
      onNavigate={() => console.log("Navigated")}>  // nav se pehle hook (Next 15.3+)
  Go To Forms
</Link>
```

**Props cheat-sheet:**

| Prop | Default | Kya karta hai |
|------|---------|---------------|
| `href` | — | destination (string ya `{ pathname, query }`) |
| `prefetch` | auto (prod ON, dev limited) | `true` \| `false` \| `'auto'` — link ka route pehle se cache me |
| `replace` | `false` | `history.replaceState` — back button me entry nahi |
| `scroll` | `true` | navigation ke baad top par scroll |
| `onNavigate` | — | navigation se pehle callback — analytics/confirm dialog |

**Prefetch kaise hota hai (diagram):**
```
   Link viewport/hover pe aaya
        │
        ├── Static route (page me koi dynamic API nahi)
        │      → PURA RSC payload prefetch (cache 100% ready)
        ├── Dynamic route + loading.js boundary
        │      → HTML shell + loading boundary tak prefetch
        └── Dynamic route, no loading.js
               → sirf route ki JS chunk prefetch (base)

   Click ──► router.navigate() ──► cache se turant paint 🚀 (no white flash)
```

**Gotchas:**
- `<a href="/about">` = full reload (Next ki saari optimization gone). Hamesha `<Link>`.
- Poora card/image clickable chahiye → `<Link>` ke andar `<Image>` rakh do.
- External domain (`https://...`) par Link chalta hai, par uska prefetch **nahi** hota (Next sirf apne routes prefetch karta hai).
- Dev me prefetch deliberately kam hota hai — asli speed **production build** me dikhti hai.

### 🌍 Link real-life usages
- Navbar/footer links, blog post cards, pagination, breadcrumbs, product cards
- `replace` → multi-step wizard (back = previous step, pura history nahi)
- `onNavigate` → analytics page_view event, unsaved-changes confirm dialog


### 📜 B. `<Script>` — `next/script`

JSX me seedha `<script src="...">` likhne ki dikkat: Next pages ko **parallel render** karta hai, isliye script ka **load order unpredictable**, aur third-party script **hydration/interaction slow** kar sakta hai. `next/script` tumhare script ko Next ke **load lifecycle me sahi jagah** chalata hai.

```jsx
// app/layout.js (ya kisi bhi component me)
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* 1) default — page hydrate hote hi */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"
                strategy="afterInteractive" />

        {/* 2) sabse critical — interactive hone SE pehle (sirf root layout) */}
        <Script src="https://cdn.cookielaw.org/consent.js"
                strategy="beforeInteractive" />

        {/* 3) halka — sab resources load ke baad window.onload pe */}
        <Script src="https://w.chatwidget.com/widget.js"
                strategy="lazyOnload" />
      </body>
    </html>
  );
}
```

**Strategies comparison:**

| Strategy | Kab chalta hai | Kahan use karein |
|----------|----------------|------------------|
| `beforeInteractive` | Hydration se **pehle** (page block hota hai) | Consent/CLS-critical tags — **sirf root layout** me allowed, warna error |
| `afterInteractive` *(default)* | Page interactive hote hi | GA4, Mixpanel, A/B testing |
| `lazyOnload` | Saare critical resources ke **baad**, window `load` pe | Chat widget, heatmaps, ads |
| `worker` *(experimental)* | Web worker me (Partytown) | Heavy third-party SDKs |

**Deep points:**
- Script **bundle ke bahar** rehta hai — Next ka JS bundle me nahi ghusa, sirf wahi third-party download hogi jab zarurat ho.
- Inline script chahiye → `<Script id="gtm">{`window.dataLayer = [];`}</Script>` — **`id` do**, duplicate inject Next khud rok deta hai.
- `beforeInteractive` kisi normal page me daala → **build error** (root layout tak limited).
- Placement: `afterInteractive`/`lazyOnload` kahin bhi (client component me bhi); `beforeInteractive` **sirf** `app/layout.js`.
- React 19 ho to simple `<script>` bhi chalta hai, par **order + load guarantees** `next/script` hi deta hai.

### 🌍 Script real-life usages
- **GA4 / Mixpanel** → `afterInteractive` (page view tracking)
- **Cookie consent (Cookiebot/OneTrust)** → `beforeInteractive` (legal pehle)
- **Intercom / Zendesk chat** → `lazyOnload` (LCP ko touch na kare)
- **Razorpay/Stripe checkout SDK** → `afterInteractive`, button click pe `window.Razorpay` ready


## 5. Image Component (`next/image`) — Local vs Remote

### 🤔 `<img>` vs `next/image`

`<img src="/p.jpg">` → browser **original size** download karta hai (5MB DSLR bhi mobile par) = data waste + slow LCP. `next/image` → request ke hisaab se server par **resize + compress** karke **WebP/AVIF** deta hai, **lazy load**, aspect-ratio reserve (CLS 0), aur responsive `srcset`.

**Repo ka local example (`app/page.js`):**
```jsx
import Image from "next/image";

<Image src={"/img.jpeg"} width={600} height={300} alt="pic" />
```
`/img.jpeg` = `public/` folder ki file = **Local image**.

### 📊 Local vs Remote

```
  LOCAL (public/)                         REMOTE (CDN / external URL)
  ───────────────                         ──────────────────────────────
  src="/img.jpeg"                         src="https://cdn.shop.com/p.jpeg"
  bina config ke chalta hai ✅             pehle next.config me ALLOW (warna 400 ❌)
  seedha file serve hoti hai              Next fetch → optimize → cache
```

| Point | Local | Remote |
|-------|-------|--------|
| `src` | root path (`/img.jpeg`) | full URL (`https://...`) |
| Config | kuch nahi | `images.remotePatterns` (deprecated: `domains`) |
| Optimization | ✅ sharp se | ✅ (Next remote fetch karke optimize karta hai) |
| Blur placeholder | static import karke `placeholder="blur"` | `blurDataURL` khud dena padta hai |
| `priority` preload | ✅ | ✅ (config ke bina chalega hi nahi) |

**Remote setup — `next.config.mjs`:**
```js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shop.com", // wildcard: "**.amazonaws.com"
        port: "",                     // "" = koi bhi port
        pathname: "/products/**",     // sirf ye path allow
      },
    ],
  },
};
```

```jsx
<Image
  src="https://cdn.shop.com/products/shoe1.png"
  width={600} height={300} alt="shoe"
  priority                                   // LCP/hero image → preload (lazy nahi)
  sizes="(max-width: 768px) 100vw, 33vw"     // responsive srcset hint (fill ke saath zaruri)
/>
```

### 🔁 Optimization flow (diagram)

```
  <Image src="/img.jpeg" width={600}>
 │  browser request:
      │  /_next/image?url=%2Fimg.jpeg&w=640&q=75
      ▼
  ┌────────── Next.js Image Optimizer ──────────┐
  │ 1. src validate (local ya allowed remote)    │
  │ 2. sharp → resize (aspect ratio safe)        │
  │ 3. Accept header → WebP / AVIF / JPEG        │
  │ 4. cache (memory/CDN) me save                │
  └──────────────────────────────────────────────┘
      │ optimized small file + srcset
      ▼
  Browser → sahi size download → fast LCP 🚀, CLS 0 ✅
```

**Deep points / rules:**
- `width` + `height` **ya** `fill` — dono me se ek required. `fill` = parent ko `position: relative` + `sizes` dena padta hai.
- Default **lazy loading** → **first-screen (LCP) image par `priority`** do, warna Lighthouse LCP penalty.
- SVG ko optimizer **serve nahi karta** (`dangerouslyAllowSVG` config chahiye) — isliye repo me SVGs plain asset/inline SVG hain.
- Remote image bhi **ek baar optimizer se guzarti hai** → cache headers ke saath CDN par cache hoti hai (Vercel par automatic).
- Static import (`import img from "./x.png"`) = intrinsic width/height auto + blur placeholder free.

### 🌍 Real-life usages
- **Local:** site ka logo, OG image, bundled illustrations, static avatars
- **Remote:** e-commerce gallery (S3/Cloudinary/Imgix CDN), user UGC (Cloudinary URL), CMS blog covers (Contentful/Strapi), CDN hero banners
- **Blog card** → `sizes` + lazy (below fold), **hero banner** → `priority` + `sizes="100vw"`


## 6. Diagram Explanations

> Saare important flows ek jagah — revision ke liye perfect.

### 6.1 — Ek request ka safar (App Router)

```
   URL /about
      │
      ▼
 ┌─ SERVER ─────────────────────────────────────────┐
 │ • nearest layout.js + page.jsx render              │
 │ • server component → seedha HTML/RSC (fast 🟢)    │
 │ • client component ho to:                          │
 │     – JS chunk serve                               │
 │     – RSC payload (flight) stream                  │
 └────────────────────────────────────────────────────┘
      │
      ▼  hydration — Interactivity ON: Router, useState, <Form>, onClick sab ready
      │
      ▼  <Link href="/forms">
   SPA navigation — document reload nahi, sirf naya payload
```

### 6.2 — Server Action timeline

```
 [Client]                [Network]                [Server]
 submit ────────► POST (Next-Action id + FormData) ──► action() run
                  │                                    ├─ auth check
   pending UI ◄───┤                                    ├─ db write
   (button off)   │                                    └─ revalidate/redirect
                  ◄──────────── RSC diff (fresh UI) ◄──┘
 re-render — form reset + naya data, koi JSON.parse nahi
```

### 6.3 — Font loading: FOUT/CLS vs `next/font`

```
  <link>    : HTML ─► CSS fetch ─► font fetch ─► repaint  [2 RTT 🔴, shift ⚠️]
  next/font : HTML ─► preloaded self-hosted woff2,
              fallback already size-matched              [0 Google RTT 🟢, CLS ≈ 0 ✅]
```

### 6.4 — Image pipeline (local & remote dono)

```
  raw file (public | CDN) ─► /_next/image?w=&q= ─► sharp resize ─► avif/webp
       ─► cache ─► <img srcset> me best size ─► kam bytes + fast LCP
```

### 6.5 — `<Link>` vs `<a>`

```
  <a>    : click ─► full document request ─► white flash ─► JS sab dobara
  <Link> : viewport/hover ─► prefetch ─► click ─► cache se instant paint 🚀
```

### 6.6 — Mutation ke 2 raaste

```
  A) <form action="/api/todos"> ─► fetch ─► route handler ─► JSON ─► setState
  B) <Form action={serverAction}> ─► direct server fn ─► revalidate ─► UI auto ✅
        (kam code, secret safe, type-friendly)
```

### 6.7 — `<Form>` GET search flow (repo wala)

```
  /forms ── submit ──► /search?query=5
                            │
                            ▼
   SearchPage: await searchParams → fetch(jsonplaceholder/5)
                            │
                            ▼
   <h2>{data.title}</h2>  (server rendered, SEO friendly ✅)
```


## 7. Real-life Usages (Scenario → Solution)

| # | Production scenario | Kya lagayenge | Kaise |
|---|---------------------|---------------|-------|
| 1 | Contact / Newsletter form | Server Action + `useActionState` | validate → DB/Resend → success msg state |
| 2 | E-commerce **Add to Cart** | Action + `revalidatePath` | header cart count auto refresh |
| 3 | **Login / Logout** | Action + `cookies()` | session set/clear → `redirect("/dashboard")` |
| 4 | **Search / Filters** | `next/form` GET + `await searchParams` | shareable URL, SEO-friendly pages |
| 5 | **Docs/Blog navigation** | `<Link prefetch>` | hover pe prefetch → click instant |
| 6 | **Analytics + Chat** | `<Script strategy>` | GA4 `afterInteractive`, chat `lazyOnload` |
| 7 | **Hero / LCP image** | `<Image priority>` | preload + responsive → Lighthouse green |
| 8 | **Product gallery (CDN)** | `<Image>` + `remotePatterns` | Cloudinary/S3 se optimized AVIF |
| 9 | **Brand fonts** | `next/font` + `variable` | CLS 0, self-hosted, single file |
| 10 | **Payment SDK (Razorpay)** | `<Script afterInteractive>` | SDK ready hone par checkout enable |

### 🔗 Sab ko jodkar — chhota end-to-end flow

```jsx
// 1) Search bar — GET form (shareable URL: /search?q=nike)
<Form action="/search">
  <input name="q" placeholder="Search products..." />
  <button>Search</button>
</Form>

// 2) Results — server component, data fetch (await searchParams)
const { q } = await searchParams;
const items = await db.product.findMany({ where: { name: { contains: q } } }); // db = Prisma/Mongo client (example)

// 3) Card — Link + Image combo (SPA + optimized media)
<Link href={`/product/${item.id}`}>
  <Image src={item.cdnUrl} alt={item.name} width={400} height={300} />
</Link>

// 4) Add to cart — Server Action (bina API route)
"use server"
export async function addToCart(formData) {
  const id = formData.get("id");
  await db.cart.create({ data: { productId: id } });
  revalidatePath("/cart");     // cart page fresh ho jaye
}
```


## 8. Other Concepts (Bonus)

### `"use client"` vs `"use server"`

| | `"use client"` | `"use server"` |
|--|----------------|----------------|
| Kya banata hai | **Client Component** boundary (browser: hooks, onClick, state) | **Server Action** (sirf server par chalne wala RPC fn) |
| Kahan likhte hain | component file ka top | action file top **ya** async function ke andar pehle line |
| Code kahan jata hai | JS bundle me (client par visible) | server par hi rehta hai 🛡️ |
| Rule of thumb | UI interactivity ke liye | mutation / secret logic ke liye |

**Composition rule:** Server parent → Client child ✅ allowed · Client parent → Server child ❌ (sirf `children` ki tarah pass karo).

```jsx
// Parent (Server) → Child (Client) sahi hai
export default function Page() {
  return <ClientForm />;   // "use client" wala component
}
```

### `metadata` — SEO without extra lib
```js
// app/layout.js (server file) me export object ya function
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```
Dynamic chahiye → `export async function generateMetadata({ params })` (per-page). Client component page me direct export nahi hota — parent layout/route segment config use karo.

### `searchParams` / `params` = **Promise** (Next 15+)
```jsx
const Page = async ({ searchParams, params }) => {
  const { query } = await searchParams;   // ⚠️ await karna hi padega
  const { id } = await params;
};
```
Isi liye repo ke `search/page.jsx` me `await searchParams` likha hai.

### Router helpers (`useRouter`)
```jsx
const router = useRouter();
router.back();                 // forms/page.jsx me use hua ✅
router.push("/about");         // nayi history entry
router.replace("/about");      // current entry replace (Link `replace` jaisa)
router.refresh();              // server se current route ka data dobara
```

### Config flags ka funda
| Flag | Effect |
|------|--------|
| `cacheComponents: true` | Next ka naya caching model — dynamic APIs (`cookies`, uncached `fetch`) par control, partial prerender support |
| `partialPrefetching: true` | Prefetch poore route ka na karke **zaruri part** ka (bandwidth bachti hai) |
| Turbopack + `@tailwindcss/turbopack` | Tailwind 4 CSS fast compile, dev cold-start kam |


## ⚠️ Common Mistakes (beginners yahi karte hain)

1. **`<a href="/about">`** likh dena → full reload; hamesha `<Link>`.
2. `redirect()` ke baad aur code likh dena → **redirect throw karta hai**, uske aage kuch nahi chalta.
3. `await searchParams` bhool jana → object seedha render ho `undefined` / `[object Object]`.
4. Remote image bina `remotePatterns` ke → `Invalid "src" property` error.
5. Font me `weight`/`subsets` miss → build error ya missing glyphs.
6. `"use client"` file me DB/secret import → client bundle me leak; action file banao.
7. Mutation ke baad **`revalidatePath`/`revalidateTag`/`refresh()`** bhool jana → purana UI dikhta rahega.
8. Hero image me `priority` nahi diya → LCP score kharab.
9. `useFormStatus` form ke **parent** me lagana (kaam nahi karta) — form ke andar ke **child** (Submit button) me lagao.
10. Server action ko **UI state** ke liye use karna (har toggle par network call) — `useState` hi enough hai.

## 📚 Resources (aage padhne ke liye)

- [Server Actions & Data Mutation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [`next/font` — Google & Local fonts](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [`next/form`](https://nextjs.org/docs/app/api-reference/components/form)
- [`next/link`](https://nextjs.org/docs/app/api-reference/components/link)
- [`next/script`](https://nextjs.org/docs/app/api-reference/components/script)
- [`next/image`](https://nextjs.org/docs/app/api-reference/components/image) · [`remotePatterns`](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)
- [React 19 — `useActionState` / `useFormStatus`](https://react.dev/reference/react/useActionState)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## 🧭 Series Context

Ye **Next.js learning series ka 07th module** hai — pehle modules me basics/routing, is module me **App Router ka mutation layer (Server Actions) + performance optimization (fonts, image, prefetch, script loading)**, aage CRUD/full-stack projects.

> Made with ❤️ while learning Next.js — notes/suggestions welcome!

