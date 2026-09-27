# Backend Route Handlers in Next.js 🚀

> **Series #05 — Backend banane ka tarika Next.js App Router mein.**
> Yahan hum seekhenge ki Next.js ke andar hi apna backend kaise likhte hain — alag se Express server banane ki zaroorat nahi. Sab kuch **Hinglish** mein, repo ke **real code** ke saath, diagrams aur real-life use cases ke saath.

![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=flat-square)
![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square)
![Runner](https://img.shields.io/badge/Package%20Manager-Bun-f472b6?style=flat-square)

---

## 📚 Table of Contents

| # | Topic | Kya milega |
|---|-------|-----------|
| 1 | [Introduction — Route Handler kya hai?](#1-introduction--route-handler-kya-hai) | Concept + kyun zaroori hai |
| 2 | [Project Structure](#2-project-structure-is-repo-ka) | Kaunsi file kahan hai |
| 3 | [Route Handler Basics](#3-route-handler-basics) | `route.js` rules, HTTP methods |
| 4 | [GET Endpoints](#4-get-endpoints) | Data fetch karna, external API call |
| 5 | [Query Parameters](#5-query-parameters) | `?limit=10&completed=true` handling |
| 6 | [POST Endpoint](#6-post-endpoint) | Body parse + create |
| 7 | [PUT / PATCH / DELETE Endpoints](#7-put--patch--delete-endpoints) | Dynamic `[id]` route + update/delete |
| 8 | [Headers in Next.js](#8-headers-in-nextjs) | Read karna, set karna, auth header |
| 9 | [Cookies in Next.js](#9-cookies-in-nextjs) | Set/Get/Delete + httpOnly + security |
| 10 | [Response Types & Status Codes](#10-response-types--status-codes) | `Response.json` vs `NextResponse` |
| 11 | [Request Body, FormData & File Upload](#11-request-body-formdata--file-upload) | JSON, form, streams |
| 12 | [Error Handling & Validation](#12-error-handling--validation) | try/catch, status codes |
| 13 | [CORS & OPTIONS Handler](#13-cors--options-handler) | Browser se call karne ke liye |
| 14 | [Route Segment Config](#14-route-segment-config) | `dynamic`, `revalidate`, `runtime` |
| 15 | [Diagram Explanations](#15-diagram-explanations) | Flow charts + mapping tables |
| 16 | [Real-Life Usages](#16-real-life-usages) | Kab kya banate hain |
| 17 | [Best Practices & Common Mistakes](#17-best-practices--common-mistakes) | Galtiyan jo sab karte hain |
| 18 | [Testing Endpoints](#18-testing-endpoints) | Browser, curl, fetch, Postman |
| 19 | [Quick Cheat Sheet](#19-quick-cheat-sheet) | Revision ke liye |
| 20 | [Running This Project](#20-running-this-project) | Setup steps |
| 21 | [Practice Tasks & Next Steps](#21-practice-tasks--next-steps) | Homework 🙂 |

---

## 1. Introduction — Route Handler kya hai?

### Pehle problem samjho

Jab tum React/Vite app banate ho, aur tumhe backend chahiye hota hai, toh kya karte ho?

```
❌ Purana tarika:
React App (port 5173)  ──►  Alag Express Server (port 5000)  ──►  Database
        ↑ 2 projects, 2 deployments, CORS ka jhanjhat, 2 baar repo manage karo
```

```
✅ Next.js ka tarika:
Next.js App (port 3000)
├── Frontend  → app/page.js          (UI)
└── Backend   → app/api/todo/route.js (API)   ← Route Handler
        ↑ Ek hi project, ek hi deployment, koi CORS drama nahi
```

**Route Handler** = Next.js App Router mein apna **HTTP endpoint** (backend API) likhne ka official tarika. Yeh file-system based hai: tum ek folder banao, uske andar `route.js` naam ki file rakho, aur us folder ka path hi tumhara API URL ban jata hai.

### Ek line mein definition

> `app/api/.../route.js` file ke andar `GET`, `POST`, `PUT`, `PATCH`, `DELETE` naam ke functions export karo — Next.js us path par woh HTTP method expose kar dega.

### Tiny example

```js
// app/api/hello/route.js
export async function GET() {
  return Response.json({ message: "Hello from backend 👋" })
}
```

Call karo:

```bash
curl http://localhost:3000/api/hello
# → {"message":"Hello from backend 👋"}
```

### Deep knowledge: Route Handler vs Pages Router API Routes

| Feature | Pages Router (`pages/api/*.js`) — purana | App Router (`app/api/*/route.js`) — yeh repo |
|---------|------------------------------------------|----------------------------------------------|
| Config | `export default function handler(req,res)` | Har method alag export (`GET`, `POST`...) |
| Request object | `req` (Node.js style) + `req.body` auto-parsed | **Standard Web `Request`** (fetch API), body manually `await request.json()` |
| Response object | `res.json()` / `res.status()` (chainable) | Standard Web `Response` ya `NextResponse` |
| Caching | Manual | GET handlers **dynamic by default** (Next 15+ se pehle static tha) |
| Runtime | Node.js | Node.js ya Edge (`runtime = 'edge'`) |
| Body parser config | `bodyParser: false` ki zaroorat padti thi | **Zero config** — sab Web API standard |
| Streaming / SSE | Mushkil | Native — `ReadableStream` return kar do |

**Matlab:** App Router mein tum Node.js serverless style bhool jao aur standard **Web API (Request/Response)** sochna start karo. Same code Cloudflare Workers, Deno, Bun mein bhi chalta hai.

---

## 2. Project Structure (is repo ka)

```
05-backend-route-handler/
├── app/
│   ├── layout.js              → Root layout (font + global CSS)
│   ├── page.js                → "use client" wala Home page — POST /api/todo call karta hai
│   ├── globals.css            → Tailwind v4 import
│   └── api/                   → 🔥 BACKEND ka ghar (har folder = ek endpoint)
│       ├── todo/
│       │   ├── route.js       → POST /api/todo            (create)
│       │   └── [id]/
│       │       └── route.js   → PUT / PATCH / DELETE /api/todo/:id
│       ├── hello/route.js     → GET /api/hello  (query params demo — git history mein)
│       └── user/route.js      → GET /api/user   (headers + cookies demo — git history mein)
├── public/                    → static assets (svg files)
├── next.config.mjs            → Next config (abhi default)
├── jsconfig.json              → `@/*` path alias
├── postcss.config.mjs         → Tailwind PostCSS plugin
└── package.json               → next 16.3.6, react 19.2.8, bun as package manager
```

> 🧠 **Folder = URL.** `app/api/todo/[id]/route.js` ka matlab hai `https://site.com/api/todo/<koi-bhi-id>`. `[id]` wale square brackets **dynamic segment** hain.

### Repo ka live endpoint map

| Path | Method | File | Kaam |
|------|--------|------|------|
| `/api/todo` | `POST` | `app/api/todo/route.js` | Naya todo create karna |
| `/api/todo/:id` | `PUT` | `app/api/todo/[id]/route.js` | Poora todo replace karna |
| `/api/todo/:id` | `PATCH` | `app/api/todo/[id]/route.js` | Partially update karna |
| `/api/todo/:id` | `DELETE` | `app/api/todo/[id]/route.js` | Todo delete karna |
| `/api/hello` | `GET` | `app/api/hello/route.js` (git history) | External API + query params |
| `/api/user` | `GET` | `app/api/user/route.js` (git history) | Headers padhna + cookies set karna |

---

## 3. Route Handler Basics

### 3.1 Rules jo yaad rakhne hain

1. File ka naam **exactly `route.js`** (ya `route.ts` TypeScript mein) hona chahiye. `route.tsx` nahi chalega.
2. File `app/` directory ke andar kisi bhi folder mein ho sakti hai — folder ka path = URL path.
3. Ek `route.js` aur uske folder ke `page.js` **same path par nahi** ho sakte (conflict ho jayega):
   ```
   app/api/todo/route.js   ✅
   app/api/todo/page.js    ❌  ← same path "/api/todo" — build error
   ```
4. Sirf **HTTP method naam** wale named exports allowed hain:

```js
export async function GET(request, context) {}
export async function POST(request, context) {}
export async function PUT(request, context) {}
export async function PATCH(request, context) {}
export async function DELETE(request, context) {}
export async function HEAD(request) {}
export async function OPTIONS(request) {}
```

5. `GET` **cache nahi hota by default** (Next 15 se change hua) — yani har request par fresh chalega, jab tak tum `export const dynamic = 'force-static'` na lagao.

### 3.2 Function ke signature ka matlab

```js
export async function GET(request, { params }) {
  //                     ↑        ↑
  //                     │        └── dynamic segments ka data (object jaisa, par Next 15+ mein PROMISE)
  //                     └── standard Web API Request object (fetch wala Request)
}
```

| Cheez | Kya hota hai | Kaise use karo |
|-------|--------------|----------------|
| `request.method` | `"GET"`, `"POST"`... | Debug/logging ke liye |
| `request.url` | Full URL string | `new URL(request.url)` karke query params nikalo |
| `request.headers` | Web `Headers` object | `request.headers.get("authorization")` |
| `request.cookies` | `NextRequest` par milta hai | `request.cookies.get("token")` |
| `await request.json()` | Body → JS object | POST/PUT/PATCH mein |
| `params` | Dynamic segment values | ⚠️ Next 15+ mein **await** karna padta hai |

### 3.3 ⚠️ Next 15+ ka BIG breaking change: `params` ab Promise hai

Official version history kehti hai: **v15.0.0-RC** se `context.params` ek **Promise** ban gaya.

```js
// ❌ PURANA tarika (Next 14 tak theek tha, Next 16 mein params.id === undefined)
export async function PUT(request, { params }) {
  return Response.json({ id: params.id })
}

// ✅ NAYA tarika (Next 15/16) — await karo
export async function PUT(request, { params }) {
  const { id } = await params
  return Response.json({ id })
}
```

> 🐞 **Is repo mein note karo:** `app/api/todo/[id]/route.js` mein `params.id` **bina await** use hua hai. Next 14 ke hisaab se yeh sahi tha, par `next@16.3.6` mein yeh `undefined` dega (aur dev server warning bhi dega). Neeche section 7 mein dono versions diye hain — apne repo wali file ko `await params` karke update kar lena. Yeh classic "tutorial code vs latest framework" wala issue hai. 🙂

### 3.4 Handler ke andar kya kya kar sakte ho?

- ✅ Database call (Prisma / Mongoose / Drizzle / raw SQL)
- ✅ `process.env.API_KEY` jaise secrets (client ko kabhi expose nahi hote)
- ✅ Teesri party API call (`fetch`) — CORS ka issue nahi kyunki yeh **server se server** call hai
- ✅ Cookies set/read, headers read, file system access, `fs`, crypto, Node APIs
- ⚠️ `window`, `document`, `localStorage` — yeh **nahi** (server par nahi hote)
- ⚠️ React hooks (`useState`) — route handler React component nahi hai, hooks nahi chalenge

> ✅ **Verified on `next@16.3.6`** — neeche jo bhi outputs diye hain, woh is repo ke dev server par actually chalake likhe gaye hain.

---

## 4. GET Endpoints

GET ka kaam hai **data dena** (read karna). Isme body nahi hoti — sirf URL + headers + cookies.

### 4.1 Sabse simple GET

```js
// app/api/hello/route.js
export async function GET(request) {
  return Response.json({ message: "Hello World" })
}
```

```bash
curl http://localhost:3000/api/hello
# {"message":"Hello World"}
```

### 4.2 GET jo teesri party API se data laata hai (repo ka pattern)

Yeh is repo ki `app/api/hello/route.js` file ka code hai (git history mein hai) — ek **proxy endpoint**:

```js
// app/api/hello/route.js — external API + query params
export async function GET(request) {
  const url = new URL(request.url)
  const { searchParams } = url
  const apiUrl = new URL("https://jsonplaceholder.typicode.com/todos")

  searchParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value)
  })

  const res = await fetch(apiUrl, { headers: { "Content-Type": "application/json" } })
  const data = await res.json()
  return Response.json({ data })
}
```

Aur iska pehla version (bina query params forward kiye) aisa tha:

```js
export async function GET(request) {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
    headers: { "Content-Type": "application/json" },
  })
  const data = await res.json()
  return Response.json({ data })
}
```

**Yahan 3 sikhne wali cheezein:**

| # | Point | Kyun important |
|---|-------|----------------|
| 1 | Server se `fetch` karne par **CORS nahi lagta** | Browser se jsonplaceholder call karte toh CORS block kar deta; server-to-server call mein CORS ka concept hi nahi |
| 2 | API key safe rehti hai | `process.env.MY_KEY` server par rehta hai, client ko kabhi nahi dikhta |
| 3 | Client ko sirf apna endpoint pata hota hai | Kal third-party API badal do, frontend ko farak nahi padega |

### 4.3 GET jo HTML return karta hai (repo ke `app/api/user/route.js` se)

Route Handler sirf JSON tak seemit nahi — kuch bhi return kar sakte ho:

```js
// app/api/user/route.js
import { headers } from "next/headers"

export async function GET(request) {
  const headersList = await headers()
  console.log(headersList.get("Authorization"))
  console.log(headersList.get("user-agent"))

  return new Response("<h1>Hello World</h1>", {
    headers: {
      "Content-Type": "text/html",
      "set-cookie": "username=neeraj",
    },
  })
}
```

> 💡 **Note:** `Response.json({...})` ek shortcut hai `new Response(JSON.stringify({...}), { headers: { "Content-Type": "application/json" } })` ka. Dono valid hain.

### 4.4 GET + Caching ki deep baat

| Version | GET handler ka default behaviour |
|---------|----------------------------------|
| Next 13/14 | Static (build time par cache) — isliye purani tutorials mein `export const dynamic = 'force-dynamic'` likhna padta tha |
| **Next 15+ / 16 (yeh repo)** | **Dynamic by default** — har request par fresh chalta hai |

Yani aaj ka zamana: data fresh milega, par **DB hit bhi har baar hoga**. Agar cache karna hai toh:

```js
export const dynamic = "force-static"   // hamesha static
export const revalidate = 60            // 60 second tak cache
// ya per-fetch:
const res = await fetch("https://api.example.com/data", { next: { revalidate: 60 } })
```

### 4.5 GET ka gotcha: method galat diya toh?

Agar file mein sirf `POST` hai aur tum GET maaro:

```bash
curl -i http://localhost:3000/api/todo
# HTTP/1.1 405 Method Not Allowed
```

Next khud **405** return karta hai aur `Allow` header bhi set karta hai — manually likhne ki zaroorat nahi.
**(Verified in this repo:** `GET /api/todo` → **405** ✅**)**

---

## 5. Query Parameters

**Query parameter** = URL mein `?` ke baad wala part. `?limit=10&completed=true` mein `limit` aur `completed` do query params hain.

```
http://localhost:3000/api/todos?limit=10&completed=true&sort=title
                               └────────────┬─────────────────────┘
                                        query string
```

### 5.1 Query params nikalne ke 4 tarike

```js
export async function GET(request) {
  // ✅ Tarika 1: URL API (recommended, sabse saaf)
  const url = new URL(request.url)
  const limit = url.searchParams.get("limit")          // "10" (string!) ya null
  const completed = url.searchParams.get("completed")  // "true" ya null

  // ✅ Tarika 2: destructure karke
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get("sort")

  // ✅ Tarika 3: ek hi key ki multiple values (e.g. ?tag=js&tag=react)
  const tags = searchParams.getAll("tag")              // ["js","react"]

  // ✅ Tarika 4: saare params loop karo
  searchParams.forEach((value, key) => console.log(key, "=", value))

  return Response.json({ limit, completed, sort, tags })
}
```

| Method | Kaam | Example result |
|--------|------|----------------|
| `.get("x")` | Pehli value | `"10"` |
| `.getAll("x")` | Saari values | `["js","react"]` |
| `.has("x")` | Exist karta hai? | `true` / `false` |
| `.toString()` | Query string wapas | `"limit=10&completed=true"` |
| `.keys()` / `.values()` / `.entries()` | Iterators | loop karne ke liye |
| `.append(k, v)` | Naya param add | server-side modify karne ke liye |

> ⚠️ **Zaroori gotcha:** Query params **hamesha string** hote hain. `?limit=10` par `10` number nahi, `"10"` string milega. Aur `"false"` bhi ek non-empty string hai (truthy!). Isliye:
> ```js
> const limitNum = Number(limit) || 10       // number banao
> const isCompleted = completed === "true"   // string se compare karo, Boolean() mat lagao
> ```

### 5.2 Repo ka forwarding pattern (step-by-step)

Repo mein query params ko **as-is third-party API par forward** kiya gaya hai:

```js
const url = new URL(request.url)                // 1. request ka URL object banao
const { searchParams } = url                    // 2. uske searchParams nikalo
const apiUrl = new URL("https://jsonplaceholder.typicode.com/todos") // 3. naya target URL

searchParams.forEach((value, key) => {          // 4. ek-ek param copy karo
  apiUrl.searchParams.append(key, value)
})

const res = await fetch(apiUrl, { headers: { "Content-Type": "application/json" } })
const data = await res.json()
return Response.json({ data })                  // 5. client ko wapas bhejo
```

**Live verified output (dev server par chalaya):**

```bash
curl "http://localhost:3000/api/hello?userId=1&completed=false"
# → 9 todos mile (jsonplaceholder ne filter laga diya)

curl "http://localhost:3000/api/hello?limit=2"
# → saare 200 todos mile (jsonplaceholder "limit" support nahi karta, isliye filter nahi hua)
```

**Sikhne wali baat:** Tumhara endpoint bas **pass-through** hai — asli filtering third-party API karti hai. Isi pattern ko "**API Gateway / Proxy**" kehte hain.

### 5.3 Real-life example: pagination + search + filter

```js
// app/api/products/route.js  →  /api/products?q=shirt&page=2&limit=12&sort=price_asc
export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const q = searchParams.get("q")?.trim() ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(50, Number(searchParams.get("limit") ?? 12)) // max 50 — abuse se bacho
  const sort = searchParams.get("sort") ?? "relevance"

  // Yahan DB query aayegi (Prisma example):
  // const products = await prisma.product.findMany({
  //   where: { name: { contains: q, mode: "insensitive" } },
  //   skip: (page - 1) * limit,
  //   take: limit,
  // })

  return Response.json({
    query: { q, page, limit, sort },
    pagination: { page, limit, total: 128, totalPages: Math.ceil(128 / limit) },
  })
}
```

```bash
curl "http://localhost:3000/api/products?q=shirt&page=2&limit=12"
```

> 🧠 **Deep knowledge — `searchParams` 3 jagah 3 tarike se milta hai:**
>
> | Kahan | Kaise |
> |-------|-------|
> | **Route Handler** | `new URL(request.url).searchParams` |
> | **Server Component (page.js)** | `props.searchParams` — aur woh **Promise** hai → `await searchParams` |
> | **Client Component** | `useSearchParams()` hook (aur `Suspense` boundary chahiye) |

---

## 6. POST Endpoint

POST ka kaam hai **naya data banana** (create). Isme body aati hai — usually JSON.

### 6.1 Repo ka actual code — `app/api/todo/route.js`

```js
export async function POST(request) {
  const body = await request.json()      // 1. body ko JSON mein parse karo
  const { title, completed } = body      // 2. destructure

  return Response.json({                 // 3. response wapas bhejo
    success: true,
    message: "Todo created successfully",
    todo: {
      title,
      completed,
    },
  })
}
```

**Line-by-line samjho:**

| Line | Kya ho raha hai | Deep detail |
|------|-----------------|-------------|
| `await request.json()` | Raw body stream ko JS object banata hai | Body **stream** hai — ek baar hi padhi ja sakti hai. Dobara padhna ho toh `request.clone()` karo |
| `const { title } = body` | Destructuring | Agar client ne `title` nahi bheja → `undefined` (error nahi aayega, isliye validation zaroori hai) |
| `Response.json(...)` | JSON response | Status code by default **200** — create ke liye **201** behtar hai |

### 6.2 Client side se kaise call hota hai (repo ka `app/page.js`)

```jsx
"use client"
import { useState } from "react"

export default function Home() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch("/api/todo", {          // 1. relative URL — same origin, full URL ki zaroorat nahi
      method: "POST",
      headers: {
        "Content-Type": "application/json",         // 2. ⚠️ yeh header zaroori hai
      },
      body: JSON.stringify({ title, completed: false }), // 3. object → string (JSON)
    })
    const data = await res.json()                   // 4. response parse
    if (data.success) {
      setMessage(`Todo created successfully: ${data.todo.title}`)
      setTitle("")
    } else {
      setMessage(`Failed to create todo: ${data.message}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="text-4xl font-bold">Create Todo</h1>
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          className="p-2 border border-gray-300 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit" className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
          Create
        </button>
      </form>
      {message && <p className="mt-4 text-sm font-semibold">{message}</p>}
    </div>
  )
}
```

> 🧠 **Deep knowledge:** `"use client"` wala component `fetch("/api/todo")` isliye kar sakta hai kyunki relative URL same-origin ko hit karta hai. Agar tum **Server Component** se data lena chahte ho toh `fetch` ki zaroorat bhi nahi — seedha DB/file access kar lo (route handler ke through jaana waste hai). Route Handler tab use karo jab **browser/external client** ko HTTP endpoint chahiye ho.

### 6.3 Verified output (dev server par test kiya)

```bash
curl -i -X POST http://localhost:3000/api/todo \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Route Handlers","completed":false}'
```

```
HTTP/1.1 200 OK
content-type: application/json

{"success":true,"message":"Todo created successfully","todo":{"title":"Learn Route Handlers","completed":false}}
```

### 6.4 Content-Type bhoolne par kya hota hai?

```bash
# ❌ Content-Type header bhool gaye
curl -X POST http://localhost:3000/api/todo -d '{"title":"x"}'
```

`request.json()` fail ho sakta hai (`Unexpected token` / `SyntaxError`) aur tumhe **500** milega — kyunki Next.js ko pata hi nahi ki body JSON hai. Isi liye client mein `Content-Type: application/json` **hamesha** bhejo.

### 6.5 Production-ready POST (status 201 + validation + try/catch)

```js
// app/api/todo/route.js — production style
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, completed = false } = body

    // Validation (bina kisi library ke)
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return Response.json(
        { success: false, message: "Title kam se kam 3 characters ka hona chahiye" },
        { status: 400 }                       // Bad Request
      )
    }

    // Yahan DB insert hoga:
    // const todo = await prisma.todo.create({ data: { title: title.trim(), completed } })
    const todo = { id: crypto.randomUUID(), title: title.trim(), completed, createdAt: new Date().toISOString() }

    return Response.json(
      { success: true, message: "Todo created successfully", todo },
      { status: 201 }                          // 201 Created — REST ka proper convention
    )
  } catch (error) {
    return Response.json(
      { success: false, message: "Invalid JSON body ya server error" },
      { status: 500 }
    )
  }
}
```

> 🔎 **Deep knowledge — POST kab, Server Action kab?**
> - **Server Action** (`"use server"`) use karo jab form tumhari hi Next.js UI se aa raha ho — code straightforward rehta hai, progressive enhancement milta hai.
> - **Route Handler POST** use karo jab endpoint **public API** ho, mobile app se call ho, webhook receive karna ho, ya non-JSON data (file) handle karna ho.

---

## 7. PUT / PATCH / DELETE Endpoints

Yeh teeno **existing data ko change** karte hain, aur hamesha **dynamic route** (`[id]`) ke saath aate hain.

### 7.1 Repo ka actual code — `app/api/todo/[id]/route.js`

```js
export async function PUT(request, { params }) {
  const data = await request.json()
  const updatedTodo = { id: params.id, ...data }
  return Response.json({ success: true, updatedTodo })
}

export async function PATCH(request, { params }) {
  const data = await request.json()
  const updatedTodo = { id: params.id, ...data }
  return Response.json({ success: true, updatedTodo })
}

export async function DELETE(request, { params }) {
  return Response.json({ success: true, message: `Todo with id ${params.id} deleted` })
}
```

**File system → URL mapping:**

```
app/api/todo/[id]/route.js
             └─┬─┘
               └── dynamic segment →  /api/todo/1
                                      /api/todo/abc
                                      /api/todo/507f1f77bcf86cd799439011  (MongoDB ObjectId)
```

### 7.2 🐞 Repo mein ek REAL bug hai (Next 16 mein test karke pakda)

Upar wale code mein `params.id` **bina `await`** use hua hai. Dev server par test kiya toh aaya:

```bash
curl -X DELETE http://localhost:3000/api/todo/42
# {"success":true,"message":"Todo with id undefined deleted"}
#                                          ↑↑↑↑↑↑↑↑↑ BUG!
```

Kyunki **Next 15+ mein `context.params` ek Promise hai** (official version history: *"v15.0.0-RC: context.params is now a promise"*). Sync access par `undefined` milta hai.

**Fix — `await` lagao (Next 15/16 ka sahi tarika):**

```js
// app/api/todo/[id]/route.js — FIXED ✅
export async function PUT(request, { params }) {
  const { id } = await params              // ⚠️ await must
  const data = await request.json()
  const updatedTodo = { id, ...data }
  return Response.json({ success: true, updatedTodo })
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const data = await request.json()
  const updatedTodo = { id, ...data }
  return Response.json({ success: true, updatedTodo })
}

export async function DELETE(request, { params }) {
  const { id } = await params
  return Response.json({ success: true, message: `Todo with id ${id} deleted` })
}
```

**Fix ke baad verified output** (main ne `await params` wali ek temporary file bana kar test kiya, phir hata di):

```
PUT    /api/selftest/42  → {"success":true,"updatedTodo":{"id":"42","title":"Learn Route Handlers","completed":false}}
PATCH  /api/selftest/7   → {"success":true,"updatedTodo":{"id":"7","title":"Learn Route Handlers","completed":false}}
DELETE /api/selftest/7   → {"success":true,"message":"Todo with id 7 deleted"}
```

> ✅ Yani `id` ab sahi aa raha hai. `await` wali ek line hi poore endpoint ko theek karti hai — isliye `const { id } = await params` **hamesha** yaad rakho.

### 7.3 PUT vs PATCH — asli farak kya hai?

| | PUT | PATCH |
|---|-----|-------|
| Kya bhejte hain | **Poora object** (saare fields) | **Sirf badle hue fields** |
| Behaviour | Replace — jo field nahi bheji, woh `null`/delete ho jaati hai | Merge — jo bheja, wahi update hota hai |
| Idempotent? | Haan ✅ | Haan ✅ (per RFC, par implementation par depend) |
| Example | `{ "title": "New", "completed": true }` | `{ "completed": true }` |

```js
// PUT — poora replace (purani values chali jaati hain)
const updatedTodo = { id, ...data }        // yeh full replacement maanta hai

// PATCH — partial merge (purani values bachi rehti hain)
const updatedTodo = { ...existingTodo, ...data }   // pehle existing laao, phir naya merge karo
```

> 🧠 **Deep knowledge:** Real projects mein log PATCH ko hi mostly use karte hain (chhota payload), aur PUT ko "full replace" semantics ke liye rakhte hain. Repo mein dono ka code same hai — yaani yahan PUT aur PATCH ka behaviour identical hai. Practice task #2 mein tum ise alag kar sakte ho (neeche section 21 dekho).

### 7.4 DELETE ke saath body? (kabhi kabhi zaroori)

```js
export async function DELETE(request, { params }) {
  const { id } = await params

  // Kabhi-kabhi soft delete ka reason bhi bhejna hota hai
  const body = await request.json().catch(() => ({}))   // body na ho toh crash na ho
  const { reason } = body

  // await prisma.todo.delete({ where: { id } })          // hard delete
  // await prisma.todo.update({ where: { id }, data: { deletedAt: new Date(), reason } })  // soft delete

  return new Response(null, { status: 204 })              // 204 No Content — kuch return nahi karna
}
```

> 💡 **Best practice:** Delete ke baad **204 No Content** return karna REST convention hai (body khaali). Agar client ko kuch batana hai toh `200` + JSON bhejo.

---

## 8. Headers in Next.js

**Header** = HTTP request/response ke saath jaane wala metadata (key-value pairs). Body ki tarah dikhte nahi, par auth, caching, language, content type — sab isi se decide hota hai.

### 8.1 Do tarike: `request.headers` vs `await headers()`

```js
// Tarika 1: Request object se (route handler aur middleware mein)
export async function GET(request) {
  const auth = request.headers.get("authorization")   // simple, recommended
  const ua = request.headers.get("user-agent")
  return Response.json({ auth, ua })
}
```

```js
// Tarika 2: next/headers se (Server Components, Server Actions, Route Handlers)
import { headers } from "next/headers"

export async function GET(request) {
  const headersList = await headers()          // ⚠️ async — Next 15+ mein await karna padta hai
  console.log(headersList.get("Authorization"))
  console.log(headersList.get("user-agent"))
  return Response.json({ ok: true })
}
```

> Repo ki `app/api/user/route.js` file mein exactly yahi (Tarika 2) use hua hai. **`headers()` read-only hai** — tum isse outgoing headers set ya delete nahi kar sakte. Set karne ke liye response ke `headers` option ka use karo.

### 8.2 `Headers` object ke methods

| Method | Kaam |
|--------|------|
| `.get("x")` | Value (case-insensitive) |
| `.has("x")` | Exist karta hai? |
| `.forEach((v, k) => ...)` | Sab loop karo |
| `.entries()` / `.keys()` / `.values()` | Iterators |
| `.set()` / `.append()` | Sirf response banate waqt naye Headers par |

### 8.3 Response headers set karna

```js
export async function GET() {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Powered-By": "Neeraj ka Next.js backend",
        "set-cookie": "theme=dark; Path=/; HttpOnly; SameSite=Lax",
      },
    }
  )
}
```

### 8.4 Real-life: Authorization header se authentication

```js
// app/api/profile/route.js
import { headers } from "next/headers"

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")   // "Bearer eyJhbGciOi..."

  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ success: false, message: "Token missing" }, { status: 401 }) // Unauthorized
  }

  const token = authHeader.split(" ")[1]

  try {
    // const user = await verifyJwt(token)          // jsonwebtoken / jose se verify karo
    const user = { id: "u_1", name: "Neeraj" }     // demo ke liye
    return Response.json({ success: true, user })
  } catch {
    return Response.json({ success: false, message: "Invalid token" }, { status: 403 }) // Forbidden
  }
}
```

**Verified output (repo ke headers-demo endpoint par):**

```bash
curl "http://localhost:3000/api/selftest?userId=1" -H "Authorization: Bearer my-secret-token"
# → {"authorization":"Bearer my-secret-token","userAgent":"curl/8.13.0", ...}
```

Yaani handler ne request ke headers **safely padh liye** — `Authorization` aur `user-agent` dono mil gaye. ✅

### 8.5 Header names case-insensitive hote hain

```js
request.headers.get("Authorization")   // "Bearer ..."
request.headers.get("authorization")   // "Bearer ..."  — same result ✅
request.headers.get("AUTHORIZATION")   // same result ✅
```

### 8.6 Server Component mein `headers()` kyun use karte hain?

```jsx
// app/dashboard/page.js  — Server Component
import { headers } from "next/headers"

export default async function Dashboard() {
  const ua = (await headers()).get("user-agent")
  const isMobile = /mobile/i.test(ua ?? "")
  return <div>{isMobile ? "Mobile UI" : "Desktop UI"}</div>
}
```

> ⚠️ **Deep knowledge:** `headers()` ek **Request-time API** hai. Iska use route ko automatically **dynamic rendering** mein daal deta hai (build time par render nahi hoga), kyunki header ki value pehle se pata nahi hoti.

### 8.7 Middleware/Proxy se header forward karna

```js
// middleware.js (root mein)
import { NextResponse } from "next/server"

export function middleware(request) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-current-path", request.nextUrl.pathname)   // apna custom header add karo

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("x-app-version", "1.0.0")                   // response par header lagao
  return response
}
```

> 🧠 Isse tum request ke andar custom headers inject kar sakte ho, jo phir route handler ya Server Component mein `headers().get("x-current-path")` se padh sakte ho. Multi-tenant apps mein `x-tenant-id` isi pattern se set hota hai.

---

## 9. Cookies in Next.js

**Cookie** = browser mein store hone wala chhota data (4KB tak). Browser ise **har request ke saath automatically** server ko bhejta hai. Session, auth token, theme preference — sab cookies se handle hota hai.

### 9.1 Cookies padhne ke 2 tarike

```js
// Tarika 1: Request object se (NextRequest) — route handler mein
export async function GET(request) {
  const token = request.cookies.get("token")            // { name: "token", value: "..." } ya undefined
  const theme = request.cookies.get("theme")?.value     // sirf value chahiye toh .value
  return Response.json({ token: token?.value ?? null, theme })
}
```

```js
// Tarika 2: next/headers se — repo ka pattern
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()        // ⚠️ Next 15+ mein async
  const theme = cookieStore.get("theme")
  console.log(theme)                          // { name: "theme", value: "dark" }
  return Response.json({ theme: theme?.value ?? null })
}
```

> Repo ki last commit (`feat: update GET endpoint to manage cookies and set theme`) mein exactly yahi kiya gaya — `cookies()` se `theme` cookie set ki aur wapas padhi.

### 9.2 Cookie set karna (3 tarike)

```js
// ✅ Tarika A: next/headers ke cookies() se — sabse recommended
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set("theme", "dark")                      // simple
  cookieStore.set("theme", "dark", { secure: true })    // ek option ke saath
  cookieStore.set({
    name: "session",
    value: "abc123",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,                           // 7 din (seconds mein)
  })
  return Response.json({ success: true })
}
```

```js
// ✅ Tarika B: Response header se (repo ka style)
export async function GET() {
  return new Response("<h1>Hello World</h1>", {
    headers: {
      "Content-Type": "text/html",
      "set-cookie": "username=neeraj; Path=/; HttpOnly; SameSite=Lax",
    },
  })
}
```

```js
// ✅ Tarika C: NextResponse se
import { NextResponse } from "next/server"

export async function GET() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set("theme", "dark", { httpOnly: true, path: "/", maxAge: 604800 })
  return res
}
```

### 9.3 Cookie options (deep knowledge)

| Option | Kaam | Recommended value |
|--------|------|-------------------|
| `httpOnly` | JavaScript (`document.cookie`) se cookie hide ho jaati hai | `true` — auth cookies ke liye **must** |
| `secure` | Sirf HTTPS par bhejegi | production mein `true` |
| `sameSite` | CSRF protection: `"lax"` / `"strict"` / `"none"` | `"lax"`, cross-site ke liye `"none"` + `secure` |
| `path` | Kis path par available ho | `"/"` (poori site) |
| `maxAge` | Kitne **seconds** tak zinda | `60*60*24*7` = 7 din |
| `expires` | Exact date | `new Date(Date.now() + 7*24*3600*1000)` |
| `domain` | Subdomain sharing | `.example.com` |
| `priority` | Browser eviction hint | `"high"` |

### 9.4 Verified demo: cookie set karke wapas padhna

**Step 1 —** server response mein `set-cookie` bhejta hai:

```bash
curl -s -D headers.txt -c cookies.txt "http://localhost:3000/api/selftest?limit=2" -o out.json
# Response headers:
# set-cookie: theme=dark; Path=/; HttpOnly; SameSite=Lax
```

**Step 2 —** browser/curl next request mein wahi cookie wapas bhejta hai, aur server usse padh leta hai:

```bash
curl -s -b cookies.txt "http://localhost:3000/api/selftest?limit=2"
# {"themeFromCookie":"dark", ...}   ✅ cookie round-trip successful
```

Pehli request par `themeFromCookie: null` aaya tha, doosri par `"dark"` — yahi **cookie ka poora lifecycle** hai. 🔁

### 9.5 Cookie delete karna

```js
import { cookies } from "next/headers"

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("theme")                    // tarika 1
  // cookieStore.set("theme", "")                 // tarika 2 — khaali value
  // cookieStore.set("theme", "x", { maxAge: 0 }) // tarika 3 — turant expire
  return Response.json({ success: true, message: "Logged out" })
}
```

### 9.6 Cookies kahan padh sakte ho, kahan set

| Kahan | Padh sakte ho? | Set/Delete kar sakte ho? |
|-------|----------------|--------------------------|
| Route Handler | ✅ `request.cookies` / `await cookies()` | ✅ Haan |
| Server Action (`"use server"`) | ✅ `await cookies()` | ✅ Haan |
| Middleware | ✅ `request.cookies` | ✅ `response.cookies.set(...)` |
| Server Component (`page.js`) | ✅ `await cookies()` | ❌ **Nahi** — woh render-only hai |

> ⚠️ **Common error:** Server Component mein `cookieStore.set(...)` likhne par Next.js error deta hai. Cookie set karne ke liye Route Handler, Server Action ya Middleware use karo.

### 9.7 Real-life: cookie-based session login (poora pattern)

```js
// app/api/login/route.js
import { cookies } from "next/headers"

export async function POST(request) {
  const { email, password } = await request.json()

  // const user = await verifyUser(email, password)     // DB check + hashed password compare
  if (email !== "demo@test.com" || password !== "123456") {
    return Response.json({ success: false, message: "Galat credentials" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set({
    name: "session",
    value: "signed-jwt-token-here",   // ⚠️ hamesha signed/encrypted value rakho
    httpOnly: true,                   // JS se padhi nahi ja sakti → XSS se safe
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",                  // CSRF se protection
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ success: true, message: "Login successful" })
}
```

```js
// app/api/logout/route.js
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return Response.json({ success: true, message: "Logged out" })
}
```

```js
// app/api/me/route.js — session verify
import { cookies } from "next/headers"

export async function GET() {
  const session = (await cookies()).get("session")?.value
  if (!session) {
    return Response.json({ success: false, message: "Not logged in" }, { status: 401 })
  }
  // const user = await verifySession(session)
  return Response.json({ success: true, user: { email: "demo@test.com" } })
}
```

### 9.8 Cookies vs localStorage — kab kya use karo?

| | Cookie | localStorage |
|---|--------|--------------|
| Server ko milti hai? | ✅ Har request ke saath automatic | ❌ Sirf JS se padhi jaati hai |
| Size limit | ~4KB | ~5-10MB |
| XSS se safe? | `httpOnly` ke saath ✅ | ❌ (JS padh sakta hai) |
| SSR mein use | ✅ | ❌ (SSR par exist hi nahi karta) |
| Best for | **Auth session, theme** | Non-sensitive UI state, drafts |

> 🛡️ **Security rule:** Auth token `localStorage` mein mat rakho — XSS hone par chori ho jayega. `httpOnly` cookie **gold standard** hai.

---

## 10. Response Types & Status Codes

### 10.1 Response bhejne ke 4 tarike

```js
// 1️⃣ Response.json() — sabse common (JSON API)
export async function GET() {
  return Response.json({ message: "Hello" })                  // status default 200
}

// 2️⃣ new Response() — kuch bhi bhej sakte ho (HTML, XML, CSV, plain text)
export async function GET() {
  return new Response("Hello World", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}

// 3️⃣ NextResponse — Next.js ka extended Response (cookies/redirect/rewrite ke helpers)
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 })
}

// 4️⃣ Status + body alag-alag (khaali body ke saath)
export async function DELETE() {
  return new Response(null, { status: 204 })   // No Content
}
```

| | `Response` (Web API) | `NextResponse` (Next.js) |
|---|----------------------|--------------------------|
| Standard? | ✅ Web standard | Next.js specific |
| `cookies` helper | Manual `set-cookie` header | `res.cookies.set()` ✅ |
| Redirect | `Response.redirect(url, 307)` | `NextResponse.redirect(url)` ✅ |
| Rewrite / next | ❌ | `NextResponse.next()`, `NextResponse.rewrite()` ✅ |
| Kab use karo | 90% cases | Cookie/redirect/middleware wale cases |

### 10.2 Status codes jo rozana lagenge

| Code | Naam | Kab bhejo |
|------|------|-----------|
| `200` | OK | Normal GET/PUT/PATCH success |
| `201` | Created | POST se naya resource bana |
| `204` | No Content | DELETE success (body khaali) |
| `301/308` | Permanent Redirect | URL permanently badla |
| `307` | Temporary Redirect | Login page par bhejna |
| `400` | Bad Request | Validation fail (user ki galti) |
| `401` | Unauthorized | Login nahi hai / token missing |
| `403` | Forbidden | Login hai par permission nahi |
| `404` | Not Found | Resource exist nahi karta |
| `405` | Method Not Allowed | Galat HTTP method (Next khud deta hai) |
| `409` | Conflict | Duplicate email/username |
| `422` | Unprocessable Entity | Validation fail (semantic) |
| `429` | Too Many Requests | Rate limit cross |
| `500` | Internal Server Error | Server code crash |

```js
// Real pattern — status ka sahi use
export async function GET(request, { params }) {
  const { id } = await params
  // const todo = await prisma.todo.findUnique({ where: { id } })
  const todo = null                                       // demo: mila hi nahi

  if (!todo) return Response.json({ success: false, message: "Todo nahi mila" }, { status: 404 })
  return Response.json({ success: true, todo })           // 200
}
```

> 🧠 **Deep knowledge:** Client aksar `res.json()` ko direct parse karta hai. Agar tum error par bhi **JSON shape consistent** rakhte ho (`{ success, message, data }`), toh frontend mein error handling bahut aasan ho jaati hai.

### 10.3 Redirect aur streaming (extra power)

```js
// Redirect — login ke baad dashboard par bhejo
import { NextResponse } from "next/server"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  if (!searchParams.get("token")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.json({ ok: true })
}
```

```js
// Streaming (SSE) — AI chat / live logs ke liye
export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("data: Hello\n\n"))
      controller.enqueue(encoder.encode("data: World\n\n"))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
```

---

## 11. Request Body, FormData & File Upload

Body padhne ke alag-alag methods hote hain — jo bheja gaya hai usi ke hisaab se padho.

| Method | Kab use karo | Return |
|--------|--------------|--------|
| `await request.json()` | `Content-Type: application/json` | Object |
| `await request.text()` | Plain text, HTML, XML, webhook raw payload | String |
| `await request.formData()` | HTML form / file upload (`multipart/form-data`) | `FormData` |
| `await request.arrayBuffer()` | Images, PDF, binary data | `ArrayBuffer` |
| `request.body` | Stream (bade data / transformation) | `ReadableStream` |

```js
export async function POST(request) {
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const data = await request.json()
    return Response.json({ type: "json", data })
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const name = formData.get("name")            // text field
    const file = formData.get("avatar")          // File object (Blob)
    return Response.json({
      type: "form",
      name,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    })
  }

  const raw = await request.text()
  return Response.json({ type: "text", raw })
}
```

### 11.1 File upload (real-life)

```js
// app/api/upload/route.js
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || typeof file === "string") {
      return Response.json({ success: false, message: "File missing" }, { status: 400 })
    }

    // Validation — security ke liye zaroori
    const allowed = ["image/png", "image/jpeg", "image/webp"]
    if (!allowed.includes(file.type)) {
      return Response.json({ success: false, message: "Sirf PNG/JPEG/WEBP allowed" }, { status: 400 })
    }
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ success: false, message: "File 2MB se badi hai" }, { status: 400 })
    }

    // Local disk par save (production mein S3 / Cloudinary / Vercel Blob use karo)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    await writeFile(path.join(process.cwd(), "public/uploads", filename), buffer)

    return Response.json({ success: true, url: `/uploads/${filename}` }, { status: 201 })
  } catch (error) {
    return Response.json({ success: false, message: "Upload fail ho gaya" }, { status: 500 })
  }
}
```

> ⚠️ **Deep knowledge:** Vercel jaise serverless platforms par local disk **read-only/ephemeral** hota hai — file `public/` mein save ki toh production mein gayab ho jaayegi. Wahan `S3`, `Vercel Blob`, ya `Cloudinary` use karo. Aur bade files ke liye streaming (`request.body`) behtar hai.

---

## 12. Error Handling & Validation

### 12.1 Express wala global error handler Next.js mein nahi hota

Express mein `app.use((err, req, res, next) => {})` hota hai. Route Handlers mein **har handler khud zimeddar hai** — `try/catch` likho warna Next default 500 error dega.

```js
// app/api/todo/route.js — bulletproof handler
export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ success: false, message: "Body valid JSON nahi hai" }, { status: 400 })
    }

    const errors = []
    if (!body.title || typeof body.title !== "string") errors.push("title required")
    if (body.title && body.title.length > 120) errors.push("title max 120 characters")
    if (body.completed !== undefined && typeof body.completed !== "boolean") errors.push("completed boolean hona chahiye")

    if (errors.length) {
      return Response.json({ success: false, errors }, { status: 422 })
    }

    // const todo = await prisma.todo.create({ data: body })
    const todo = { id: crypto.randomUUID(), title: body.title.trim(), completed: !!body.completed }

    return Response.json({ success: true, todo }, { status: 201 })
  } catch (error) {
    console.error("POST /api/todo failed:", error)               // server logs mein full detail
    return Response.json(
      { success: false, message: "Internal server error" },      // ⚠️ client ko stack trace mat bhejo
      { status: 500 }
    )
  }
}
```

> 🐞 **Real-world note:** Is repo mein maine test karte waqt dekha ki galat/missing JSON body par handler **500** de raha tha (`SyntaxError: Expected property name or '}' in JSON`). Sahi behaviour **400** hona chahiye — kyunki galti client ki hai, server ki nahi. Upar wala pattern isi problem ko fix karta hai.

### 12.2 Reusable helper (repetition kam karne ke liye)

```js
// lib/api-response.js
export const ok = (data, status = 200) => Response.json({ success: true, data }, { status })

export const fail = (message, status = 400, extra = {}) =>
  Response.json({ success: false, message, ...extra }, { status })

export async function safeJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}
```

```js
// use karke dekho — kitna saaf lagta hai
import { ok, fail, safeJson } from "@/lib/api-response"

export async function POST(request) {
  const body = await safeJson(request)
  if (!body) return fail("Invalid JSON", 400)

  const { title } = body
  if (!title?.trim()) return fail("Title required", 422)

  return ok({ todo: { id: crypto.randomUUID(), title: title.trim() } }, 201)
}
```

> 🧠 **Deep knowledge:** `@/lib/api-response` — yeh `jsconfig.json` ka path alias hai (`"@/*": ["./*"]`), isi liye import itna saaf lagta hai. Bade projects mein yeh pattern **gold standard** hai.

### 12.3 Validation library kaunsi use karein?

| Approach | Kaam | Note |
|----------|------|------|
| Manual `if` checks | Simple cases | Zero dependency — is repo ka tarika |
| **Zod** | Schema-based validation | Industry mein sabse popular (TS-friendly) |
| **Yup / Joi** | Purani libs | Legacy projects mein milti hain |
| `zod-form-data` | FormData + Zod | File upload forms ke liye |

```js
// Zod wala pattern (pehle install karo: bun add zod)
import { z } from "zod"

const TodoSchema = z.object({
  title: z.string().min(3, "Title kam se kam 3 characters").max(120),
  completed: z.boolean().optional(),
})

export async function POST(request) {
  const parsed = TodoSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ success: false, errors: parsed.error.issues }, { status: 422 })
  }
  return Response.json({ success: true, todo: parsed.data }, { status: 201 })
}
```

### 12.4 Central error handling ka shortcut

```js
// lib/handler.js — chhota wrapper
export const withErrorHandling = (fn) => async (request, context) => {
  try {
    return await fn(request, context)
  } catch (error) {
    console.error(error)
    return Response.json({ success: false, message: "Something went wrong" }, { status: 500 })
  }
}
```

```js
// app/api/todo/route.js
import { withErrorHandling } from "@/lib/handler"

export const POST = withErrorHandling(async (request) => {
  const body = await request.json()      // error aaya toh automatically 500 milega
  return Response.json({ success: true, body })
})
```

---

## 13. CORS & OPTIONS Handler

### 13.1 CORS kab matter karta hai?

Agar koi **dusre domain** se tumhara `/api/*` call karega (e.g. `myapp.com` → `yournextapp.com/api/data`), toh browser pehle **preflight request** (`OPTIONS`) bhejta hai. Tumne CORS headers nahi diye toh browser block kar dega.

```js
// app/api/public/route.js — CORS enabled endpoint
export async function GET(request) {
  return new Response("Hello, Next.js!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",                                  // production mein specific domain do
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
```

> ⚠️ `"*"` matlab **koi bhi website** tumhara API call kar sakti hai. Cookie-based auth ke saath `"*"` allowed bhi nahi hota — wahan exact origin likho (`https://myapp.com`) aur `Access-Control-Allow-Credentials: true` do.

### 13.2 OPTIONS handler khud likhna zaroori hai kya?

Zaroori nahi! Next.js khud ek default `OPTIONS` + `HEAD` respond karta hai (jo allowed methods batata hai). Verified:

```bash
curl -i -X OPTIONS http://localhost:3000/api/selftest
```

```
HTTP/1.1 204 No Content
allow: GET, HEAD, OPTIONS, POST
```

Lekin jab browser ko `Access-Control-Allow-*` headers **chahiye** hote hain, tab tumhe manual OPTIONS likhna padta hai:

```js
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://myapp.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",          // browser 24 ghante tak preflight cache kare
    },
  })
}
```

> 💡 **Deep knowledge:** Saare endpoints par same CORS headers chahiye? Toh `next.config.mjs` ke `headers()` config ya `proxy.js` (middleware) mein ek jagah laga do — repetition nahi hogi.

### 13.3 Same-origin ho toh CORS ki zaroorat nahi

```
Next.js app (localhost:3000)
├── /            → page
└── /api/todo    → same origin ✅  (no CORS needed)

Kisi aur port/domain se call → CORS headers chahiye ⚠️
```

Isi liye is repo mein `fetch("/api/todo")` bilkul bina CORS configuration ke chalta hai. 🎉

---

## 14. Route Segment Config

Route Handler file mein kuch **special exports** likh sakte ho jo us segment ka behaviour control karte hain.

```js
// app/api/posts/route.js
export const dynamic = "auto"          // 'auto' | 'force-dynamic' | 'error' | 'force-static'
export const dynamicParams = true       // dynamic segments allow?
export const revalidate = false         // false | 0 | number (seconds)
export const fetchCache = "auto"        // fetch caching strategy
export const runtime = "nodejs"         // 'nodejs' | 'edge'
export const maxDuration = 30           // seconds (Vercel par plan ke hisaab se limit)
export const preferredRegion = "auto"   // deprecated
```

| Config | Values | Kab use karo |
|--------|--------|--------------|
| `dynamic` | `auto` (default) / `force-dynamic` / `force-static` | Hamesha fresh data chahiye → `force-dynamic`; build par static karna hai → `force-static` |
| `revalidate` | `false` / `0` / `60` | ISR — 60 sec tak cached response |
| `fetchCache` | `auto` / `force-no-store` / `force-cache` | `fetch()` calls ka caching control |
| `runtime` | `nodejs` / `edge` | Edge = fast, par Node APIs (`fs`, `bcrypt`) nahi milte |
| `maxDuration` | seconds | Long-running jobs (report generation) ke liye timeout badhao |
| `dynamicParams` | `true` / `false` | `false` matlab sirf `generateStaticParams` wale params allowed, baaki 404 |

### 14.1 Practical examples

```js
// Hamesha taaza data chahiye (dashboard, live price)
export const dynamic = "force-dynamic"

export async function GET() {
  const data = await fetch("https://api.example.com/live-price", { cache: "no-store" })
  return Response.json(await data.json())
}
```

```js
// Har 5 minute par refresh (blog posts ke liye perfect)
export const revalidate = 300
```

```js
// Edge runtime — duniya ke sabse paas se response (fast + sasta)
export const runtime = "edge"

export async function GET() {
  return Response.json({ region: process.env.VERCEL_REGION ?? "local" })
}
```

> ⚠️ **Deep knowledge:** Edge runtime mein `fs`, `bcrypt`, `jsonwebtoken` jaise Node-only packages nahi chalte (`jose` chalta hai). Database bhi Edge-compatible chahiye (Neon, PlanetScale, Upstash, Prisma Accelerate). Confusion ho toh **Node.js runtime hi rakho** — Next 16 ka default wahi hai.

---

## 15. Diagram Explanations

### 🗺️ Diagram A — Route Handler ka poora request lifecycle

```
 ┌──────────────┐
 │   Browser    │   fetch("/api/todo", { method:"POST", body: JSON.stringify(...) })
 └──────┬───────┘
        │  HTTP POST /api/todo  + headers + cookies + body
        ▼
 ┌──────────────────────────────────────────────────────────┐
 │  Next.js Server (localhost:3000)                         │
 │                                                          │
 │  1️⃣  URL match karo: /api/todo  →  app/api/todo/route.js │
 │  2️⃣  Method match karo: POST    →  export function POST  │
 │  3️⃣  Handler chalao (Node.js runtime)                    │
 │        ├── await request.json()      (body parse)        │
 │        ├── await request.headers     (auth check)        │
 │        ├── await (await cookies())   (session)           │
 │        └── await prisma.todo.create() (DB write)         │
 │  4️⃣  return Response.json(...)                            │
 └──────┬───────────────────────────────────────────────────┘
        │  HTTP 200 + JSON + set-cookie
        ▼
 ┌──────────────┐
 │   Browser    │  data.success ? setMessage("✅") : setMessage("❌")
 └──────────────┘
```

### 🗺️ Diagram B — File system = URL mapping

```
app/api/
├── hello/
│   └── route.js                 →  /api/hello
├── todo/
│   ├── route.js                 →  /api/todo
│   └── [id]/
│       └── route.js             →  /api/todo/:id
└── users/
    └── [userId]/
        └── posts/
            └── [postId]/
                └── route.js     →  /api/users/:userId/posts/:postId
```

### 🗺️ Diagram C — Method → handler matrix

```
                       /api/todo          /api/todo/[id]
                    ┌─────────────────┬──────────────────────┐
   GET              │  ❌ (405 aayega) │  (list/fetch)        │
   POST             │  ✅ CREATE       │  ❌                  │
   PUT              │  ❌              │  ✅ FULL REPLACE     │
   PATCH            │  ❌              │  ✅ PARTIAL UPDATE   │
   DELETE           │  ❌              │  ✅ DELETE           │
   OPTIONS / HEAD   │  auto ⚙️         │  auto ⚙️             │
                    └─────────────────┴──────────────────────┘
```

### 🗺️ Diagram D — `params` vs `searchParams`

```
URL:  /api/todo/42?include=comments&limit=5
              └┬─┘ └──────────┬──────────────┘
        dynamic segment   query string

  /api/todo/[id]/route.js            same route.js
  ┌───────────────────────┐         ┌──────────────────────────────┐
  │ { params }            │         │ new URL(request.url)         │
  │  → { id: "42" }       │         │   .searchParams              │
  │  ⚠️ await karo        │         │  → include="comments"        │
  │  const {id} =         │         │    limit="5"                 │
  │    await params       │         │  (strings, hamesha)          │
  └───────────────────────┘         └──────────────────────────────┘
     PATH ka hissa                    URL ke baad ka hissa
```

### 🗺️ Diagram E — Headers & Cookies ka in/out flow

```
   REQUEST (browser → server)                    RESPONSE (server → browser)
   ┌───────────────────────────┐                ┌───────────────────────────┐
   │ authorization: Bearer xyz │   ───────►     │ content-type: json        │
   │ user-agent: Chrome        │   handler      │ set-cookie: theme=dark    │
   │ cookie: theme=dark        │   ───────►     │ cache-control: ...        │
   │ content-type: json        │                │ x-demo-header: yes        │
   └───────────────────────────┘                └───────────────────────────┘
        ▲ padhne ke liye:                             ▲ set karne ke liye:
        │ request.headers.get()                       │ Response.json(body,{headers})
        │ await headers()                             │ (await cookies()).set()
        │ request.cookies.get()                       │ res.cookies.set()   ← NextResponse
        │ (await cookies()).get()
```

### 🗺️ Diagram F — Is repo ka full-stack flow (todo create)

```
  app/page.js ("use client")                      app/api/todo/route.js
  ┌──────────────────────────┐                   ┌──────────────────────────┐
  │ const [title,setTitle]   │                   │ export async function    │
  │                          │                   │ POST(request) {          │
  │ handleSubmit():          │   POST /api/todo  │   const body =           │
  │  fetch("/api/todo", {───────────────────────►│     await request.json() │
  │    method:"POST",        │   Content-Type:   │   const {title,          │
  │    body: JSON.stringify  │   application/json│     completed} = body    │
  │      ({title,completed}) │                   │   return Response.json({ │
  │  })                      │◄──────────────────│     success:true, ...    │
  │  const data = await      │   200 + JSON      │   })                     │
  │    res.json()            │                   │ }                        │
  │  setMessage(             │                   └──────────────────────────┘
  │    "created ✅")         │                              │
  └──────────────────────────┘                              ▼
                 │                                    (asli duniya mein)
                 ▼                                  prisma.todo.create()
          UI update (React re-render)
```

### 🗺️ Diagram G — GET handler: static ya dynamic? (decision)

```
   GET route handler likh rahe ho
              │
              ├── Kya DB / user-specific data hai? ────► force-dynamic (fresh chahiye)
              │
              ├── Kya har 1-5 min par update hona theek hai? ──► revalidate = 300 (ISR)
              │
              ├── Kya kabhi nahi badlega (country list, config)? ──► force-static
              │
              └── Confusion hai? ──────────────────────► default (dynamic by default in Next 15+)
                                                          ✅ safest choice
```

### 🗺️ Diagram H — Kya use karein: Route Handler / Server Action / Direct DB?

```
        Data/action kahan se aa raha hai?
                    │
       ┌────────────┼─────────────────────┬──────────────────────┐
       ▼            ▼                     ▼                      ▼
  Browser UI    External client       Webhook /                 Real-time
  (tumhara      (mobile app,          third-party               (chat, logs,
   own form)     Postman, koi          (Stripe, GitHub)          notifications)
       │          aur website)              │                        │
       ▼              │                     │                        ▼
  ┌──────────┐        ▼                     ▼                  Route Handler +
  │ Server   │   Route Handler        Route Handler           SSE streaming
  │ Action   │   (POST/PUT...)        + signature verify
  └──────────┘   + CORS               + raw body (request.text())
       │              │                     │
       └──────────────┴─────────────────────┘
                      │
                      ▼
        Server Component mein sirf READ karna? → seedha DB call
        (route handler ke through jaane ki zaroorat nahi)
```

---

## 16. Real-Life Usages

Theory kaafi hui — ab dekhte hain ki **asli projects mein Route Handlers kahan-kahan use hote hain**.

### 16.1 Todo / Notes app (isi repo ka case) 📝

Ek hi API ko **web UI, mobile app, browser extension** — sab use kar sakte hain:

```
Todo App
├── Web UI (React client)      ─┐
├── Mobile app (React Native)   ├──►  /api/todo  (yeh repo)  ──►  MongoDB
└── Postman / testing           ─┘
```

### 16.2 Auth & Session API (sabse common) 🔐

`/api/login`, `/api/logout`, `/api/register`, `/api/me`, `/api/forgot-password` — cookies wala poora pattern section 9 mein already diya hai. Yahi **90% real apps** ka backbone hai.

### 16.3 Payment Webhook (Stripe / Razorpay) 💳

Webhook mein **raw body** chahiye hota hai — isliye `request.text()` use karte hain, `request.json()` nahi:

```js
// app/api/webhooks/stripe/route.js
import crypto from "crypto"

export async function POST(request) {
  const rawBody = await request.text()                                // ⚠️ raw, parsed nahi
  const signature = request.headers.get("stripe-signature")

  const expected = crypto
    .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")

  if (signature !== expected) {
    return Response.json({ error: "Invalid signature" }, { status: 400 })   // ⚠️ security
  }

  const event = JSON.parse(rawBody)
  if (event.type === "checkout.session.completed") {
    // await prisma.order.update({ where: { id: event.data.object.metadata.orderId }, data: { status: "PAID" } })
  }

  return new Response("Success!", { status: 200 })                    // ⚡ jaldi 200 do, warna retry storm
}
```

### 16.4 Third-party API proxy (API key chhupana) 🕵️

Repo ka `/api/hello` isi category ka hai. Real example — weather API:

```js
// app/api/weather/route.js  → client ko API key kabhi nahi dikhti
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city") ?? "Delhi"

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`,
    { next: { revalidate: 600 } }        // 10 min cache — API quota bachao
  )

  if (!res.ok) return Response.json({ success: false, message: "Weather API fail" }, { status: 502 })

  const data = await res.json()
  return Response.json({
    success: true,
    city,
    temp: data.main?.temp,
    condition: data.weather?.[0]?.main,
  })
}
```

> 💰 **Real benefit:** Frontend mein API key daalte toh browser devtools se chori ho jaati. Yahan key sirf server par hai.

### 16.5 Search / autocomplete endpoint 🔍

```js
// app/api/search/route.js  →  /api/search?q=react
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim()

  if (q.length < 2) {
    return Response.json({ success: true, results: [] })   // chhote query par DB hit mat karo
  }

  // const results = await prisma.post.findMany({
  //   where: { title: { contains: q, mode: "insensitive" } },
  //   take: 8,
  //   select: { id: true, title: true, slug: true },
  // })
  const results = [{ id: 1, title: `${q} ke results (demo)` }]

  return Response.json({ success: true, results })
}
```

### 16.6 AI Chat streaming endpoint 🤖

Route Handler mein na **SSE** use karte hain — user ko jawab word-by-word dikhta hai (ChatGPT jaisa):

```js
// app/api/chat/route.js
export async function POST(request) {
  const { message } = await request.json()

  // const stream = await openai.chat.completions.create({ model: "gpt-4o-mini", stream: true, messages: [...] })
  const encoder = new TextEncoder()
  const words = `Tumne poocha: ${message}. Yeh ek demo streaming response hai.`.split(" ")

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: word + " " })}\n\n`))
        await new Promise((r) => setTimeout(r, 120))       // typing effect
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}
```

### 16.7 Non-UI responses (CSV / RSS / sitemap) 📄

```js
// app/api/report/route.js — CSV download
export async function GET() {
  const rows = [
    ["id", "title", "completed"],
    ["1", "Learn route handlers", "true"],
    ["2", "Deploy to Vercel", "false"],
  ]
  const csv = rows.map((row) => row.join(",")).join("\n")

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="todos-report.csv"',   // browser download
    },
  })
}
```

Isi tarah `/rss.xml`, `/robots.txt`, `/sitemap.xml` bhi Route Handlers se generate kar sakte ho (`route.js` file banao aur path ke naam se URL ban jaata hai).

### 16.8 Health check + cron job endpoints ⏰

```js
// app/api/health/route.js — uptime monitoring (UptimeRobot, BetterStack) ke liye
export async function GET() {
  const checks = { db: "ok", cache: "ok" }        // ping karne ka logic yahan
  const healthy = Object.values(checks).every((v) => v === "ok")
  return Response.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  )
}
```

```js
// app/api/cron/cleanup/route.js — Vercel Cron ise schedule par hit karega
export async function GET(request) {
  // Cron requests secret ke saath aati hain — warna koi bhi trigger kar dega
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ success: false }, { status: 401 })
  }

  // await prisma.todo.deleteMany({ where: { completed: true, createdAt: { lt: thirtyDaysAgo } } })
  return Response.json({ success: true, message: "Cleanup chal gaya" })
}
```

> ⚙️ `vercel.json` mein: `{"crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }]}` — roz 3 baje subah.

### 16.9 Newsletter / contact form 📧

```js
// app/api/newsletter/route.js — email bhi yahin se jaati hai (Resend / SendGrid ka API key server par)
export async function POST(request) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ success: false, message: "Valid email bhejo" }, { status: 422 })
  }

  // await resend.emails.send({ to: email, subject: "Welcome!", html: "..." })
  return Response.json({ success: true, message: "Subscribed 🎉" }, { status: 201 })
}
```

### 16.10 Poora real-world architecture — kahan kya lagta hai

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Next.js App (ek repo)                          │
│                                                                      │
│  Frontend (App Router pages)          Backend (Route Handlers)        │
│  ├── /              (marketing)        ├── /api/auth/login   🔐       │
│  ├── /dashboard     (protected)        ├── /api/todo        📝 CRUD   │
│  ├── /todos         (list UI)          ├── /api/upload      🖼️ files  │
│  └── /settings      (theme)            ├── /api/weather     🌤️ proxy  │
│                                        ├── /api/chat        🤖 stream │
│                                        ├── /api/webhooks/*  💳 events │
│                                        ├── /api/health      ❤️ uptime │
│                                        └── /api/cron/*      ⏰ jobs   │
└──────────────────────────────────────────────────────────────────────┘
                         │                        │
                         ▼                        ▼
                 PostgreSQL / MongoDB      Stripe, OpenAI,
                 (Prisma / Mongoose)       S3, Resend
```

---

## 17. Best Practices & Common Mistakes

### ✅ Best Practices

| # | Practice | Kyun |
|---|----------|------|
| 1 | URL naming **plural nouns** rakho: `/api/todos`, `/api/users` | REST convention, predictable |
| 2 | Sahi status code bhejo (`201` create, `204` delete, `400` client error, `500` server error) | Client sahi handle kar sakta hai |
| 3 | **Input validate** karo — kabhi trust mat karo | Security + clean data |
| 4 | Response shape **consistent** rakho: `{ success, message, data }` | Frontend mein error handling aasan |
| 5 | `try/catch` mein poora handler wrap karo | Crash se bacho, 500 saaf message |
| 6 | Secrets sirf `process.env` se (`NEXT_PUBLIC_` prefix mat lagao) | Warna key client bundle mein chali jaayegi |
| 7 | Bhaari DB/API calls par caching/revalidate lagao | Cost aur latency kam |
| 8 | `await params` aur `await cookies()` / `await headers()` yaad rakho | Next 15+ ka rule |
| 9 | Bulk operations mein `select` use karo (sirf zaroori fields) | Response chhota, fast |
| 10 | Rate limiting + auth check sensitive endpoints par | Abuse/bot se bacho |

### ❌ Common Mistakes (jo maine khud is repo mein dekhe 😄)

**1. `params` ko await na karna — Next 15+ ka sabse bada dhoka**

```js
export async function DELETE(request, { params }) {
  return Response.json({ message: `Todo with id ${params.id} deleted` })
}
// Result (verified): "Todo with id undefined deleted" ❌
```

```js
export async function DELETE(request, { params }) {
  const { id } = await params
  return Response.json({ message: `Todo with id ${id} deleted` })   // ✅ "Todo with id 42 deleted"
}
```

**2. Galat body par 500 bhejna (400 hona chahiye)**

Agar client ne invalid JSON bheja, woh **client ki galti** hai → `400`. Yeh server ki galti nahi jo `500` mile.

**3. `request.json()` do baar padhna**

```js
const a = await request.json()
const b = await request.json()      // ❌ "Body is unusable" error
// ✅ Fix:
const clone = request.clone()
const a = await request.json()
const b = await clone.json()
```

**4. Client ko sensitive data ya stack trace bhejna**

```js
catch (error) {
  return Response.json({ error: error.stack, dbUrl: process.env.DATABASE_URL })  // ❌❌
}
```

**5. POST ke liye `GET` method use karna**

`GET /api/todo?title=x` se data create karna galat hai — caching, prefetching aur crawlers sab kuch create kar denge! Create ke liye **hamesha POST**.

**6. Query params ko string bhool jaana**

```js
if (searchParams.get("completed")) { /* "false" bhi truthy hai! */ }        // ❌
if (searchParams.get("completed") === "true") { /* ✅ */ }
```

**7. `[id]` folder ko `id` likh dena**

```
app/api/todo/id/route.js    →  /api/todo/id   ❌ (literal "id" hi match karega)
app/api/todo/[id]/route.js  →  /api/todo/:id  ✅
```

**8. Ek hi path par `route.js` + `page.js`**

Dono same URL claim karte hain → build error. `api/` folder mein sirf `route.js` rakho.

**9. Server Component mein cookie set karna**

```jsx
// app/page.js (Server Component)
const c = await cookies()
c.set("theme", "dark")      // ❌ Error: Cookies can only be modified in a Server Action or Route Handler
```

**10. `"use client"` file mein secrets use karna**

```jsx
"use client"
const key = process.env.API_KEY      // ❌ client bundle mein chali gayi — public ho gayi
```

**11. Bhaari kaam response rokne wale flow mein**

```js
// ❌ User ko 3 second intezaar karna padega
await sendWelcomeEmail(user)         // email API slow hai
await sendAnalyticsEvent(user)       // 1 aur API call
return Response.json({ success: true })

// ✅ Response pehle do, kaam baad mein karo (Next.js ke `after()` se ya background job se)
// import { after } from "next/server"
// after(() => sendWelcomeEmail(user))
return Response.json({ success: true }, { status: 201 })
```

**12. Trailing slash / cache bhoolna**

Next 15+ mein GET dynamic by default hai — par agar tumne `export const revalidate` ya `force-static` lagaya hai, toh **stale data mil sakta hai**. Cache invalidation ke liye `revalidatePath()` / `revalidateTag()` use karo.

---

## 18. Testing Endpoints

### 18.1 Browser (sabse fast — sirf GET ke liye)

```
http://localhost:3000/api/todo            → 405 (sirf POST hai)
http://localhost:3000/api/todo/1          → DELETE/PUT ke liye browser kaam nahi karega
```

Browser sirf **GET** bhejta hai, isliye POST/PUT/PATCH/DELETE test karne ke liye neeche wale tools use karo.

### 18.2 curl (terminal se — best for quick checks)

```bash
# GET
curl http://localhost:3000/api/hello

# GET with query params + headers
curl "http://localhost:3000/api/search?q=react" -H "Authorization: Bearer token123"

# POST (JSON body)
curl -X POST http://localhost:3000/api/todo \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Route Handlers","completed":false}'

# PUT
curl -X PUT http://localhost:3000/api/todo/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","completed":true}'

# PATCH (partial)
curl -X PATCH http://localhost:3000/api/todo/1 \
  -H "Content-Type: application/json" -d '{"completed":true}'

# DELETE
curl -X DELETE http://localhost:3000/api/todo/1

# Status code + headers dekho
curl -i http://localhost:3000/api/hello

# Cookies ko file mein save + dobara bhejo
curl -c cookies.txt "http://localhost:3000/api/login" -d '{"email":"a@b.com"}'
curl -b cookies.txt "http://localhost:3000/api/me"
```

> 🪟 **Windows / PowerShell tip (maine isi repo mein yeh dard jhela 😅):** PowerShell native commands ke andar double quotes ko strip kar deta hai, isliye `-d '{"title":"x"}'` bhejne par server ko `{title:x}` milta hai aur JSON parse fail hota hai.
> **Solution:** JSON ko file mein likho aur `--data "@body.json"` use karo:
> ```powershell
> Set-Content .body.json -Encoding ascii -Value '{"title":"Learn Route Handlers","completed":false}'
> curl.exe -X POST http://localhost:3000/api/todo -H "Content-Type: application/json" --data "@.body.json"
> # ✅ {"success":true,"message":"Todo created successfully", ...}
> ```

### 18.3 Browser DevTools console se fetch

```js
// F12 → Console
await fetch("/api/todo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "From console", completed: false }),
}).then((r) => r.json())
```

### 18.4 Tools jo daily use honge

| Tool | Kyun accha hai |
|------|----------------|
| **Postman** | Collections, env variables, tests likhne ki facility |
| **Thunder Client** (VS Code) | Editor ke andar hi, halka-phulka |
| **Hoppscotch** | Browser-based, open source |
| **`.http` files** (VS Code REST Client) | Endpoint + test ek hi file mein, git mein commit ho jaata hai |

```http
# app/api/todo/todo.http
### Create todo
POST http://localhost:3000/api/todo
Content-Type: application/json

{
  "title": "Learn Route Handlers",
  "completed": false
}

### Delete todo
DELETE http://localhost:3000/api/todo/1
```

### 18.5 Automated testing (aage ka step)

Project mein abhi koi test setup nahi hai. Aage badhna ho toh:

```bash
# Manual testing
bun add -d vitest                  # unit tests (validation helpers, pure functions)

# E2E testing (asli browser se API + UI dono test ho jaate hain)
bun add -d @playwright/test
```

```js
// tests/api/todo.spec.ts (Playwright example)
import { test, expect } from "@playwright/test"

test("POST /api/todo creates a todo", async ({ request }) => {
  const res = await request.post("/api/todo", {
    data: { title: "Playwright todo", completed: false },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.success).toBe(true)
  expect(body.todo.title).toBe("Playwright todo")
})

test("GET /api/todo returns 405 (sirf POST allowed)", async ({ request }) => {
  const res = await request.get("/api/todo")
  expect(res.status()).toBe(405)
})
```

---

## 19. Quick Cheat Sheet

### 📁 File → URL

| File | URL |
|------|-----|
| `app/api/todo/route.js` | `/api/todo` |
| `app/api/todo/[id]/route.js` | `/api/todo/:id` |
| `app/api/users/[uid]/posts/[pid]/route.js` | `/api/users/:uid/posts/:pid` |

### 🔧 Handler skeleton (copy-paste ready)

```js
import { headers, cookies } from "next/headers"

export async function GET(request, { params }) {
  const { id } = await params                                   // ⚠️ await
  const { searchParams } = new URL(request.url)                 // query params
  const auth = request.headers.get("authorization")             // header
  const theme = request.cookies.get("theme")?.value             // cookie
  const h = await headers()                                     // next/headers
  const c = await cookies()
  c.set("lastVisit", new Date().toISOString(), { httpOnly: true, path: "/" })

  return Response.json({ success: true, id }, { status: 200 })
}

export async function POST(request) {
  const body = await request.json()                             // JSON body
  return Response.json({ success: true, body }, { status: 201 })
}

export async function PUT(request, { params }) {
  const { id } = await params
  const data = await request.json()
  return Response.json({ success: true, updated: { id, ...data } })
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const data = await request.json()
  return Response.json({ success: true, updated: { id, ...data } })
}

export async function DELETE(request, { params }) {
  const { id } = await params
  return new Response(null, { status: 204 })
}
```

### ⚡ Chhoti-chhoti yaad-dilane wali baatein

| Kaam | Code |
|------|------|
| JSON response | `Response.json(data, { status: 201 })` |
| Khaali response | `new Response(null, { status: 204 })` |
| Custom header set | `headers: { "X-Foo": "bar" }` |
| Cookie set | `(await cookies()).set("k", "v", { httpOnly: true, path: "/" })` |
| Cookie padho | `(await cookies()).get("k")?.value` |
| Dynamic param | `const { id } = await params` |
| Query param | `new URL(request.url).searchParams.get("q")` |
| Body (JSON) | `await request.json()` |
| Body (form/file) | `await request.formData()` |
| Body (raw/webhook) | `await request.text()` |
| Auth check | `request.headers.get("authorization")` |
| Redirect | `NextResponse.redirect(new URL("/login", request.url))` |
| Dynamic force | `export const dynamic = "force-dynamic"` |
| Cache 60s | `export const revalidate = 60` |
| Edge runtime | `export const runtime = "edge"` |
| CORS | `"Access-Control-Allow-Origin": "https://myapp.com"` |

### 🔴 Next 15/16 ka breaking-change checklist

```js
// ❌ Purana (Next 13/14)                 // ✅ Naya (Next 15/16)
params.id                                 const { id } = await params
const c = cookies(); c.get("x")           const c = await cookies(); c.get("x")
const h = headers(); h.get("x")           const h = await headers(); h.get("x")
searchParams.page (page.js)               (await searchParams).page
GET handlers static by default            GET handlers dynamic by default
```

---

## 20. Running This Project

### 20.1 Setup

```bash
# 1. repo ke folder mein jao
cd "05-backend-route-handler"

# 2. dependencies install (is repo mein bun use hua hai, bun.lock maujood hai)
bun install            # ya: npm install / pnpm install / yarn

# 3. dev server chalao
bun run dev            # ya: npm run dev

# 4. browser kholo
# http://localhost:3000
```

> Output aisa aayega: `▲ Next.js 16.3.6 (Turbopack)` → `✓ Ready in 3.0s`

### 20.2 Endpoints ko curl se try karo

```bash
# UI — Create Todo form
# http://localhost:3000

# POST — todo create
curl -X POST http://localhost:3000/api/todo \
  -H "Content-Type: application/json" \
  -d '{"title":"Mera pehla todo","completed":false}'
# → {"success":true,"message":"Todo created successfully","todo":{...}}

# PUT — poora update
curl -X PUT http://localhost:3000/api/todo/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","completed":true}'

# PATCH — partial update
curl -X PATCH http://localhost:3000/api/todo/1 \
  -H "Content-Type: application/json" -d '{"completed":true}'

# DELETE
curl -X DELETE http://localhost:3000/api/todo/1
# ⚠️ abhi yeh "Todo with id undefined deleted" dega — section 7 ka await fix lagao
```

### 20.3 Production build

```bash
bun run build      # production build + type/lint checks
bun run start      # production server
bun run lint       # eslint
```

### 20.4 Practice ke liye purane demo routes wapas laao

`app/api/hello/route.js` (GET + query params) aur `app/api/user/route.js` (headers + cookies) repo ke git history mein hain. Wapas laane ke liye:

```bash
git log --oneline -- app/api/hello/route.js
git show <commit-hash>:Nextjs/05-backend-route-handler/app/api/hello/route.js
# ya simply: git checkout <commit-hash> -- app/api/hello/route.js
```

Ya phir section 4/5/8/9 ke code blocks copy karke nayi file bana lo — dono same cheez hai. 🙂

---

## 21. Practice Tasks & Next Steps

### 🎯 Homework (aasan se mushkil tak)

| # | Task | Kya seekhoge |
|---|------|--------------|
| 1 | `await params` wala bug fix karo `app/api/todo/[id]/route.js` mein | Next 15+ breaking change, real debugging |
| 2 | `GET /api/todo` add karo jo saare todos return kare + `?completed=true` filter | GET + query params |
| 3 | PUT ko "full replace" aur PATCH ko "merge" banao (behaviour alag karo) | REST semantics |
| 4 | Validation add karo — title missing/short par `422`, invalid JSON par `400` | Error handling |
| 5 | Todos ko ek JSON file mein persist karo (`fs/promises`) ya in-memory array mein rakho | Server state ka feel |
| 6 | `/api/theme` banao — GET current theme bataye, POST naya theme cookie mein set kare | Cookies ka poora cycle |
| 7 | `/api/hello` wapas banao jo `?userId=1` jaisa param third-party API par forward kare | Proxy pattern |
| 8 | OPTIONS handler + CORS headers add karo, phir kisi dusre origin se call karke dekho | CORS |
| 9 | `/api/upload` banao — image upload with type/size validation | FormData + files |
| 10 | `/api/chat` banao jo SSE streaming response de (typing effect) | Streaming |
| 11 | Simple in-memory rate limiter likho (`Map` se) — 1 minute mein 10 se zyada requests par `429` | Security |
| 12 | Playwright test likho jo `POST /api/todo` ko test kare | Automated testing |

### 🚀 Aage kya seekhna hai (roadmap)

```
Aaj tum yahan ho ─────────► Route Handlers (yeh repo) ✅
                                     │
       ┌─────────────────────────────┼──────────────────────────────┐
       ▼                             ▼                              ▼
  🗄️ Database               🔐 Authentication              ⚡ Performance
  Prisma + PostgreSQL        NextAuth / Auth.js             Caching + revalidate
  Mongoose + MongoDB         JWT + httpOnly cookies         Edge runtime
  Drizzle ORM                Role-based access              Rate limiting
  Neon / Supabase            Middleware protection          Streaming
       │                             │                              │
       └─────────────────────────────┼──────────────────────────────┘
                                     ▼
                          🧪 Testing + 🚢 Deployment
                          Playwright / Vitest
                          Vercel / Docker / VPS
```

### 📚 Is series ke baaki repos

| Repo | Topic |
|------|-------|
| `01-nextjs-fundamentals` | Next.js basics |
| `02-project-structure-file-system-routing` | App Router ka file system routing |
| `03-advance-routing` | Dynamic, catch-all, intercepting, parallel routes |
| `04-rendering-components-deep-dive` | Server vs Client Components |
| **`05-backend-route-handler`** | **Route Handlers — GET/POST/PUT/PATCH/DELETE, query params, headers, cookies** ⬅️ you are here |

### 🧠 Is repo se seekhe hue 10 takeaways

1. `app/api/.../route.js` = backend endpoint. Folder ka naam hi URL hai.
2. HTTP method ka naam hi export ka naam hai (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
3. Request/Response **Web standard** hain — `request.json()`, `Response.json()`.
4. **Next 15+ mein `params` Promise hai** → `const { id } = await params` (warna `undefined`).
5. Query params `new URL(request.url).searchParams` se — aur woh **hamesha string** hote hain.
6. Headers padho (`request.headers` / `await headers()`), set karo response ke `headers` option se.
7. Cookies: `(await cookies()).set/get/delete()` — auth ke liye `httpOnly` **must**.
8. Sahi status code do (`201`, `204`, `400`, `401`, `404`, `500`) — debugging aasan ho jaati hai.
9. `try/catch` khud likho — Express wala global error handler yahan nahi hota.
10. `GET` Next 15+ mein **dynamic by default** hai; cache chahiye toh `revalidate` lagao.

### 🙏 Credits & References

- [Next.js Route Handlers docs](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Next.js `cookies()` docs](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Next.js `headers()` docs](https://nextjs.org/docs/app/api-reference/functions/headers)
- Testing ke liye free API: [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com)

---

<div align="center">

**Banaya gaya 🧡 ke saath, Hinglish mein — Next.js seekhne walon ke liye.**

Agar yeh repo helpful laga, toh ⭐ star kar dena — aur apne notes add karte rehna. Happy coding! 🚀

`Route Handlers` • `GET` • `POST` • `PUT` • `PATCH` • `DELETE` • `Query Params` • `Headers` • `Cookies`

</div>

