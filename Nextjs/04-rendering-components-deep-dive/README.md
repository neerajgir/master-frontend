# Rendering Components Deep Dive — Server vs Client Components

> Next.js App Router mein rendering ka poora concept samjho — Hinglish mein, code ke saath.

---

## 📁 Project Structure

```
app/
├── layout.js          → Root Layout (Server Component by default)
├── page.js            → Home Page (Server Component)
└── server.js          → Example: Data fetching in Server Component

components/
└── client-com.jsx     → Interactive component ("use client")
```

---

## 🔑 Core Concept: Default kya hai?

Next.js App Router mein **har component by default Server Component hota hai**. Tumhe kuch likhne ki zaroorat nahi. Agar Client Component chahiye toh explicitly `"use client"` likhna padta hai.

```jsx
// app/page.js — Yeh SERVER COMPONENT hai (by default)
const HomePage = () => {
  return <div>Hello From Server</div>
}
export default HomePage
```

```jsx
// components/client-com.jsx — Yeh CLIENT COMPONENT hai
"use client"
import React, { useState } from 'react'

const ClientComponent = () => {
  const [username, setUsername] = useState("Aadi")
  return (
    <div>
      {username}
      <button onClick={() => setUsername("Neeraj")}>Change Name</button>
    </div>
  )
}
export default ClientComponent
```

---

## 🖥️ Server Components (SC)

### Kya hote hain?

Yeh components **sirf server par render** hote hain. Browser ko inka JavaScript kabhi nahi jaata. Output HTML/RSC payload milta hai — bas itna hi.

### Features:

| Feature | Detail |
|---------|--------|
| Direct DB access | Prisma, Mongoose, raw SQL — sab chal jayega |
| Secret keys use kar sakte ho | `process.env.API_KEY` safely accessible |
| Heavy libraries import | d3, moment, lodash — bundle size zero impact |
| Async/Await | Seedha data fetch kar sakte ho |
| No interactivity | `useState`, `useEffect`, `onClick` — yeh SAB NAHI chalega |

### Code Example — Data Fetching:

```jsx
// app/server.js (Server Component with async data fetching)
async function HomePage() {
  const data = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const res = await data.json();

  return (
    <div>
      <h1>{res.title}</h1>
      <p>Completed: {res.completed ? "Yes" : "No"}</p>
    </div>
  );
}

export default HomePage;
```

> ⚠️ Dhyan do: `async` keyword sirf Server Components mein allowed hai. Client Components mein `async` component define nahi kar sakte.

---

## 📱 Client Components (CC)

### Kya hote hain?

Yeh components **browser par render** hote hain (aur hydration ke baad interactive ban jaate hain). Inka JavaScript bundle browser bheja jaata hai.

### Kab use karo:

- `useState`, `useReducer`, `useContext` chahiye
- `useEffect`, `useLayoutEffect` chahiye
- Event handlers: `onClick`, `onChange`, `onSubmit`
- Browser APIs: `window`, `localStorage`, `document`
- Class components (legacy)
- Third-party state management: Redux, Zustand hooks

### Code Example:

```jsx
"use client"
import { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `Count: ${count}`
  }, [count])

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  )
}
export default Counter
```

---

## ⚖️ Difference: Server vs Client Components

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENTS                         │
├─────────────────────────────────────────────────────────────┤
│ ✅ Render: Sirf Server                                      │
│ ✅ JS sent to browser: ZERO                                 │
│ ✅ Database access: DIRECT                                  │
│ ✅ Secrets/API keys: SAFE                                   │
│ ✅ Heavy libs: FREE (no bundle impact)                      │
│ ✅ Async/Await: YES                                         │
│ ❌ State (useState): NO                                     │
│ ❌ Effects (useEffect): NO                                  │
│ ❌ Event Handlers (onClick): NO                             │
│ ❌ Browser APIs (window): NO                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENTS                         │
├─────────────────────────────────────────────────────────────┤
│ ✅ Render: Server (initial SSR) + Browser (hydration)       │
│ ✅ JS sent to browser: FULL BUNDLE                          │
│ ✅ State & Hooks: YES                                       │
│ ✅ Interactivity: YES                                       │
│ ✅ Browser APIs: YES                                        │
│ ❌ Direct DB access: NO (API route chahiye)                 │
│ ❌ Secret keys: DANGEROUS (exposed!)                        │
│ ❌ Heavy libs: BAD for bundle size                          │
│ ❌ Async component: NOT ALLOWED                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Diagram: Request Flow

```
User Browser                          Next.js Server
     │                                       │
     │         GET /products                  │
     │ ─────────────────────────────────────► │
     │                                       │
     │                              ┌────────┴────────┐
     │                              │  Route Handler   │
     │                              │  (page.js)       │
     │                              └────────┬────────┘
     │                                       │
     │                              ┌────────▼────────┐
     │                              │ Server Component │
     │                              │ • DB Query       │
     │                              │ • API Call       │
     │                              │ • File System    │
     │                              └────────┬────────┘
     │                                       │
     │                              ┌────────▼────────┐
     │                              │ Passes props to  │
     │                              │ Client Component │
     │                              │ via serializable │
     │                              │ data             │
     │                              └────────┬────────┘
     │                                       │
     │        RSC Payload + HTML              │
     │ ◄───────────────────────────────────── │
     │                                       │
     │  ┌─────────────────────┐              │
     │  │ Browser Hydration   │              │
     │  │ Client JS loads     │              │
     │  │ useState works now  │              │
     │  │ onClick responds    │              │
     │  └─────────────────────┘              │
```

---

## 🔄 Nesting Rules: Kaun kise Import Kar Sakta Hai?

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   Server Component                               │
│   ├── Can import → Server Component ✅           │
│   ├── Can import → Client Component ✅           │
│   │                                              │
│   Client Component                               │
│   ├── Can import → Client Component ✅           │
│   ├── Can import → Server Component ❌           │
│   │   (directly nahi — lekin children prop se    │
│   │    pass kar sakte ho ✅)                     │
│   │                                              │
└──────────────────────────────────────────────────┘
```

### Pattern: Server Component inside Client Component (via children):

```jsx
// app/products/[id]/page.js (Server Component)
import AddToCartButton from './add-to-cart-button' // Client Component

async function ProductPage({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } })

  return (
    <div>
      <h1>{product.name}</h1>
      {/* Server data ko Client component mein pass karo */}
      <AddToCartButton productId={product.id} price={product.price} />
    </div>
  )
}
export default ProductPage
```

```jsx
// app/products/[id]/add-to-cart-button.jsx (Client Component)
"use client"
import { useState } from 'react'

function AddToCartButton({ productId, price }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
    setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Adding...' : `Add to Cart — ₹${price}`}
    </button>
  )
}
export default AddToCartButton
```

---

## 🎯 Which One Choose? Decision Tree

```
Kya component ko STATE chahiye?
├── HAAN → "use client" lagao (Client Component)
└── NAHI ↓

Kya EVENT HANDLERS chahiye? (onClick, onChange...)
├── HAAN → "use client" lagao
└── NAHI ↓

Kya BROWSER APIs use kar raha hai? (window, localStorage)
├── HAAN → "use client" lagao
└── NAHI ↓

Kya USEEFFECT ya USECONTEXT chahiye?
├── HAAN → "use client" lagao
└── NAHI ↓

SERVER COMPONENT rakho! (default — kuch mat likho)
```

### Golden Rule:

> **"Jitna zyada Server, utna acha."**
> Client Components sirf tab banao jab INTERACTIVITY zaroori ho. Baaki sab Server Component rakho — bundle size chhota, performance fast, security tight.

---

## 🏢 Real-Life Usages

### E-Commerce Website:

| Part | Type | Kyun? |
|------|------|-------|
| Product listing page | Server | DB se products fetch karne hain |
| Product detail page | Server | SEO critical, static content |
| Add to cart button | Client | Click handler + loading state |
| Shopping cart sidebar | Client | Open/close toggle, remove items |
| Checkout form | Client | Input validation, real-time updates |
| Payment gateway modal | Client | iframe interaction, callbacks |
| Order confirmation email trigger | Server | After payment success (server action) |

### Dashboard App:

| Part | Type | Kyun? |
|------|------|-------|
| Sidebar navigation | Client | Active route highlight, collapse toggle |
| Charts/graphs section | Server (data) + Client (render) | Data server se, chart library client-side |
| User profile card | Server | Session/token read karna hai |
| Notification bell | Client | Dropdown toggle, mark-as-read |
| Data table with sort/filter | Client | Interactive sorting, pagination |
| Report download button | Server Action | File generation server pe |

### Blog Platform:

| Part | Type | Kyun? |
|------|------|-------|
| Post list (home page) | Server | MDX files read, metadata extract |
| Single blog post | Server | Content render, SEO meta tags |
| Comment section | Client | Submit form, optimistic UI |
| Like/bookmark buttons | Client | Instant feedback without reload |
| Author bio widget | Server | Static content, no interactivity |
| Search bar | Client | Typing debounce, dropdown suggestions |

---

## 🧠 Advanced Topics

### 1. Server Actions

Server Components se directly mutation kar sakte ho — bina API route banaye:

```jsx
// app/actions.js
"use server"

export async function createPost(formData) {
  const title = formData.get('title')
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}
```

```jsx
// app/posts/new/page.js (Server Component)
import { createPost } from '../actions'

function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <button type="submit">Publish</button>
    </form>
  )
}
export default NewPostForm
```

### 2. Streaming & Suspense

Heavy data wale parts ko alag karo taaki page jaldi load ho:

```jsx
// app/dashboard/page.js (Server Component)
import { Suspense } from 'react'
import QuickStats from './quick-stats'       // Fast
import HeavyAnalytics from './heavy-analytics' // Slow

function Dashboard() {
  return (
    <div>
      <QuickStats />
      <Suspense fallback={<div>Loading analytics...</div>}>
        <HeavyAnalytics />
      </Suspense>
    </div>
  )
}
export default Dashboard
```

> Browser ko pehle `QuickStats` dikhega, phir `HeavyAnalytics` stream hoke aayega. Poora page wait nahi karega.

### 3. Serialization Boundary

Server se Client ko props pass karte waqt sirf **serializable data** ja sakta hai:

```
✅ Ja sakta hai:          ❌ NAHI ja sakta:
• strings, numbers         • Functions
• booleans                 • class instances
• plain objects/arrays     • undefined values
• Date objects             • Map/Set (in some cases)
• Promises (RSC boundary)  • React elements (directly)
```

```jsx
// Server Component
<ClientComp
  name="Neeraj"           // ✅ string
  age={25}                // ✅ number
  onClick={myHandler}     // ❌ FUNCTION — ERROR!
/>
```

### 4. Context Providers Pattern

React Context sirf Client Components mein kaam karta hai. Toh provider ko wrap karo:

```jsx
// components/theme-provider.jsx (Client Component)
"use client"
import { createContext, useContext, useState } from 'react'

const ThemeCtx = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
```

```jsx
// app/layout.js (Server Component)
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### 5. Bundle Size Impact

```
Without SC/CC split:
┌──────────────────────────────────────┐
│  Entire app JS → Browser (~500KB)    │  ← Sab kuch download
└──────────────────────────────────────┘

With SC/CC split:
┌──────────────────────────────────────┐
│  Only CC JS → Browser (~80KB)        │  ← Sirf interactive parts
│  SC → Zero JS sent                   │
└──────────────────────────────────────┘
```

Agar tumhari app mein ek heavy charting library (recharts ~200KB) hai aur usse sirf 1 page use karta hai — toh us page ka component Client rakho, baaki sab Server. Baaki pages ko us library ka bojh nahi padega.

---

## 🛡️ Security Warning

```jsx
// ❌ KABHI MAT KARO — Secret leak ho jayega!
"use client"
const apiKey = process.env.STRIPE_SECRET_KEY  // Browser mein exposed!

// ✅ SAHI TARIKA — Server pe rakho
// Server Component ya Server Action mein use karo
```

> `"use client"` wale file mein `process.env.*` ka value **inline** ho jaata hai build time pe — matlab koi bhi user DevTools kholke dekh sakta hai. Secrets hamesha server side rakho.

---

## 📋 Quick Cheat Sheet

| Chahiye | Lagao |
|---------|-------|
| Kuch special nahi | Server (default, kuch mat likho) |
| State/Hooks/Events | `"use client"` top pe |
| DB/File/Secrets access | Server Component |
| Form submission (simple) | `"use server"` action |
| Third-party lib jo DOM touch kare | `"use client"` |
| Maximum perf + minimal JS | Jitna ho sake Server rakho |

---

## 🚀 Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

---

*Happy Learning! 🙌*