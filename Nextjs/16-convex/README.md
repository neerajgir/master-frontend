# 🚀 Next.js 16 + Convex — Learning Repo (Hinglish)

Ek learning project jisme **Next.js 16 (App Router)** + **Convex** (realtime DB + backend) + **Convex Auth (GitHub OAuth)** sab ek saath use kiya gaya hai. Basic todo app se shuru karke auth flow, middleware, server/client components, aur Convex ki deep working tak sab cover hota hai.

---

## 📚 Index

1. [Intro — Convex Hai Kya?](#1-intro--convex-hai-kya)
2. [Project Setup & Structure](#2-project-setup--structure)
3. [Convex Schema — Data Model](#3-convex-schema--data-model)
4. [Queries & Mutations — CRUD Ka Pattern](#4-queries--mutations--crud-ka-pattern)
5. [User-Ready Convex Auth (GitHub OAuth)](#5-user-ready-convex-auth-github-oauth)
6. [Diagram Explanations — Flow Samjho](#6-diagram-explanations--flow-samjho)
7. [Real-Life Usages — Convex Kab Use Karein](#7-real-life-usages--convex-kab-use-karein)
8. [Gotchas & Debugging (RFC 9207 Story)](#8-gotchas--debugging-rfc-9207-story)
9. [Commands & Run](#9-commands--run)

---

## 1. Intro — Convex Hai Kya?

Convex ek **full-stack platform** hai:
- **Database** (document-based, type-safe)
- **Backend functions** (queries + mutations) — TS me likhte ho, deploy khud ho jata hai
- **Realtime sync** — client ko data live push hota hai, websocket se
- **Auth integration** — `@convex-dev/auth` se OAuth providers ready-made

Traditional stack me alag alag cheezein hoti — DB (Mongo/Postgres), API layer (Express/REST), realtime layer (Socket.io), auth (NextAuth). Convex me **ye sab ek jagah**.

**Key difference REST se:**

```
REST:   Client --> fetch("/api/todos") --> server --> DB --> JSON --> client me save --> render
Convex: Client --> useQuery(api.todos.getTodos) --> (websocket persistent) --> server query
        Data change hua? --> sab connected clients ko live push --> UI khud update
```

Convex me tum **refetch ka code nahi likhte**. `useQuery` ek "live subscription" hai — jab bhi DB badlega, UI apne aap update.

---

## 2. Project Setup & Structure

```
16-convex/
├── app/
│   ├── layout.tsx              # Root layout — providers yahan wrap hote hain
│   ├── page.tsx                # Home — CreateTodo + TodoList
│   └── auth/sign-in/page.tsx   # GitHub login page
├── components/
│   ├── convex-client-provider.tsx  # ConvexReactClient + auth provider (client side)
│   ├── create-todo.tsx             # Form + zod + useMutation
│   ├── todo-list.tsx               # useQuery — live list
│   ├── todo-item.tsx               # update/delete + inline edit
│   ├── navbar.tsx                  # Server component — isAuthenticatedNextjs()
│   ├── user-details.tsx            # fetchQuery with token (server side)
│   └── sign-out.tsx                # useAuthActions().signOut()
├── convex/                     # ⭐ Backend — yahi Convex project hai
│   ├── schema.ts               # Data model (tables + validators)
│   ├── todos.ts                # getTodos, createTodo, updateTodo, deleteTodo
│   ├── users.ts                # currentUser query
│   ├── auth.ts                 # convexAuth({ providers: [GitHub] })
│   ├── auth.config.ts          # Convex dashboard ke liye auth config
│   ├── http.ts                 # HTTP routes (auth ke callbacks yahan aate hain)
│   └── _generated/             # Auto-generated types — haath mat lagao
├── lib/
│   ├── zod.ts                  # Schema validation (create/update todo)
│   └── utils.ts                # cn() helper
├── middleware.ts               # Next.js middleware — route protection
└── .env.local                  # NEXT_PUBLIC_CONVEX_URL, GITHUB_ID, etc.
```

**Setup commands:**

```bash
# Convex CLI init (convex/ folder banata hai + dashboard link)
npx convex dev

# Env variables
NEXT_PUBLIC_CONVEX_URL=...     # convex dashboard se milta hai
CONVEX_SITE_URL=...             # auth ke liye
GITHUB_ID=...                   # GitHub OAuth app client id
GITHUB_SECRET=...               # GitHub OAuth app client secret
```

---

## 3. Convex Schema — Data Model

`convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth ki tables (users, sessions, etc.) — auth library khud banata hai
  ...authTables,

  // Hamari custom table
  todos: defineTable({
    title: v.string(),
    completed: v.boolean(),
    userId: v.id("users"),   // foreign key — kaunsa user owns karta hai
  }),
});
```

**Deep knowledge:**

- `defineTable` me jo `v.*` validators hote hain, wahi **schema validation + TypeScript type** dono provide karte hain. `v.string()` ka matlab: runtime pe bhi non-string reject, compile time pe bhi `string` type.
- `v.id("users")` ek **typed reference** hai — ye simple string nahi, `users` table ka document ID hai. Isse `ctx.db.get(userId)` direct chalta hai.
- `...authTables` spread karna **zaruri** hai — `@convex-dev/auth` ko apni tables (`users`, `sessions`, `authAccounts` etc.) chahiye. Ye isliye "user-ready" auth hai — tumhe users table khud nahi banana padta.
- Schema change karo → Convex dev server automatically **migration** kar deta hai. Manual migration files nahi.

---

## 4. Queries & Mutations — CRUD Ka Pattern

Convex me do tarah ke server functions:

| Type | Kaam | Client hook |
|------|------|-------------|
| `query` | Read data (cached, reactive) | `useQuery` |
| `mutation` | Write data (transactional) | `useMutation` |

`convex/todos.ts`:

```ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// READ — live subscription
export const getTodos = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const todos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return todos.reverse();
  },
});

// CREATE — har mutation ek ACID transaction hai
export const createTodo = mutation({
  args: {
    title: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return ctx.db.insert("todos", {
      title: args.title,
      completed: args.completed,
      userId,
    });
  },
});

// UPDATE — ownership check se pehle verify
export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    title: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingTodo = await ctx.db.get(args.id);
    if (existingTodo?.userId !== userId) throw new Error("Unauthorized");

    return ctx.db.patch(args.id, {
      title: args.title,
      completed: args.completed,
    });
  },
});

// DELETE
export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingTodo = await ctx.db.get(args.id);
    if (existingTodo?.userId !== userId) throw new Error("Unauthorized");

    return ctx.db.delete(args.id);
  },
});
```

**Key points:**

1. **`args` = server-side validation.** Client se aaya har argument `v.*` se validate hota hai. Client pe zod hoti hai (UX ke liye), server pe `v.*` hoti hai (security ke liye). Dono layer chahiye — client zod ko bypass kar sakte ho.
2. **`ctx` = database context.** `ctx.db.get/insert/patch/delete` — ye sab transaction ke andar chalte hain. Agar beech me error aaye, poora mutation rollback.
3. **Ownership check zaruri hai.** `getAuthUserId` se user mila, phir bhi `existingTodo.userId !== userId` check kiya — warna koi aur user kisi ka todo delete kar sakta tha. **Auth sirf "logged in" nahi, "authorized" bhi hai.**
4. **`getAuthUserId(ctx)`** — convex-auth ka helper. Session token context me hota hai, ye usse user ID nikaalta hai. Bina token ke `null`.

**Client side (`components/todo-list.tsx`):**

```tsx
const todos = useQuery(api.todos.getTodos);

if (todos === undefined) return <Spinner />;   // loading (abhi chal raha hai)
// todos === []  -> empty state
// todos -> array, live updated

{todos?.map((todo) => <TodoItem key={todo._id} todo={todo} />)}
```

`useQuery` ka pattern:
- `undefined` = loading
- data = real value (reactive — mutation ke baad khud refresh)
- error = query throw kare to

**Client mutation (`components/create-todo.tsx`):**

```tsx
const createTodo = useMutation(api.todos.createTodo);

const handleTodoCreation = async (data: TodoFormData) => {
  try {
    await createTodo({ title: data.title, completed: false });
    form.reset();
  } catch (error) {
    // ConvexError se structured error milta hai
    if (error instanceof ConvexError && error.data.ZodError) {
      // form me specific field error set karo
    }
  }
};
```

---

## 5. User-Ready Convex Auth (GitHub OAuth)

Ye repo me auth **ready-to-use** hai — `@convex-dev/auth` package. 4 files main hain:

### 5.1 `convex/auth.ts` — Provider config

```ts
import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      // GitHub ab callback me `iss=https://github.com/login/oauth`
      // bhejta hai (RFC 9207). oauth4webapi ise isi value se validate karta hai.
      issuer: "https://github.com/login/oauth",
    }),
  ],
});
```

- `convexAuth()` ek **factory** hai — ye `auth` (HTTP routes add karne ke liye), `signIn`/`signOut` (Convex actions), `store` (session storage), `isAuthenticated` return karti hai.
- Provider `@auth/core` wale GitHub se aata hai — same Auth.js provider, Convex auth inhe support karta hai.

### 5.2 `convex/http.ts` — HTTP routes

```ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);   // /.well-known/*, /api/auth/signin/*, /api/auth/callback/*

export default http;
```

Ye route Convex ke **HTTP actions** me register hote hain — GitHub OAuth callback (`https://<your-deployment>.convex.site/api/auth/callback/github`) yahin land karta hai.

### 5.3 `convex/auth.config.ts` — Dashboard ke liye

```ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

Ye Convex **dashboard** me JWT verification ke liye hota hai (Agar Convex Auth ke protected queries/RRR use karo).

### 5.4 `middleware.ts` — Route protection (Next.js side)

```ts
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthRoute = createRouteMatcher(["/auth/sign-in"]);
const isProtectedRoute = createRouteMatcher(["/"]);

export default convexAuthNextjsMiddleware(async (req, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isAuthRoute(req) && isAuthenticated) {
    return nextjsMiddlewareRedirect(req, "/");   // logged-in ho to sign-in page pe mat bhejo
  }
  if (isProtectedRoute(req) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(req, "/auth/sign-in");  // protected route pe login karwao
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Ye "defense in depth" hai:**
- **Middleware** = page-level gate (sign-in page redirect)
- **Convex functions** = data-level gate (har query/mutation me `getAuthUserId`)

Koi client se direct Convex function call kare bina login — `Unauthorized` exception.

### 5.5 Providers wiring (`app/layout.tsx`)

```tsx
<ConvexAuthNextjsServerProvider>       {/* server side auth context (RSC ke liye token) */}
  <ConvexClientProvider>               {/* client side ConvexReactClient + auth */}
    <Navbar />                         {/* server component — isAuthenticatedNextjs() */}
    {children}
  </ConvexClientProvider>
</ConvexAuthNextjsServerProvider>
```

Do provider zaruri hain kyunki:
- **Server Components** ko token chahiye (`convexAuthNextjsToken()`) — `UserDetails` me use hua
- **Client Components** ko reactive auth state chahiye (`useAuthActions`, `useQuery`)

### 5.6 Client se sign in

```tsx
// app/auth/sign-in/page.tsx
const { signIn } = useAuthActions();

await signIn("github", { redirectTo: "/" });
```

### 5.7 Server side data fetch (RSC me)

```tsx
// components/user-details.tsx
await connection();               // Next.js ko batao: ye dynamic hai (auth ke wajah se)
const user = await fetchQuery(
  api.users.currentUser,
  {},
  { token: await convexAuthNextjsToken() }   // RSC ke liye token pass karna padta hai
);
```

`fetchQuery` = server se direct Convex query call. Token bina ke user `null` aayega.

---

## 6. Diagram Explanations — Flow Samjho

### 6.1 GitHub OAuth Login Flow

```
 Browser                    Next.js                    Convex                    GitHub
    │                          │                          │                        │
    │  1. Click "Login"        │                          │                        │
    │─────────────────────────>│                          │                        │
    │                          │  2. signIn("github")     │                        │
    │                          │─────────────────────────>│                        │
    │                          │                          │  3. authorize URL      │
    │                          │     Location: github.com/login/oauth/authorize    │
    │                          │<─────────────────────────│                        │
    │  4. 302 redirect         │                          │                        │
    │<─────────────────────────│                          │                        │
    │                          │                          │                        │
    │  5. User GitHub pe login + consent                   │                        │
    │──────────────────────────────────────────────────────────────────────────────>│
    │                          │                          │                        │
    │  6. 302 → /api/auth/callback/github?code=...&state=...&iss=https://github.com/login/oauth
    │<────────────────────────────────────────────────────────────────────────────│
    │                          │                          │                        │
    │  7. GET callback         │                          │                        │
    │─────────────────────────>│ (HTTP action)            │                        │
    │                          │─────────────────────────>│                        │
    │                          │                          │  8. code→token exchange│
    │                          │                          │───────────────────────>│
    │                          │                          │  access_token          │
    │                          │                          │<───────────────────────│
    │                          │                          │  9. userinfo fetch     │
    │                          │                          │───────────────────────>│
    │                          │                          │  profile               │
    │                          │                          │<───────────────────────│
    │                          │                          │                        │
    │                          │   10. user create + session cookie                 │
    │                          │<─────────────────────────│                        │
    │  11. 302 → /?code=...    │                          │                        │
    │<─────────────────────────│                          │                        │
    │                          │                          │                        │
    │  12. GET / → middleware check → authenticated → page render
    │─────────────────────────>│                          │                        │
    │  todos live aate hain (websocket)                   │                        │
    │<────────────────────────────────────────────────────│                        │
```

**Step 8 ke baad `iss` validate hota** — GitHub `iss=https://github.com/login/oauth` bhejta hai, provider config me `issuer` same hona chahiye. Warning section me detail hai.

### 6.2 Todo Create — Realtime Flow

```
 Browser (CreateTodo)        Convex Server              DB (todos table)         Browser (TodoList)
    │                            │                            │                        │
    │  createTodo({title:"x"})   │                            │                        │
    │───────────────────────────>│                            │                        │
    │                            │  validate args (v.string)  │                        │
    │                            │  getAuthUserId → userId    │                        │
    │                            │  ownership check           │                        │
    │                            │  db.insert(...) ──────────>│ write                  │
    │                            │<─── _id return ────────────│                        │
    │  resolved                  │                            │                        │
    │<───────────────────────────│                            │                        │
    │                            │                            │                        │
    │                            │   DB change detected       │                        │
    │                            │───────────────────────────────────────────────────>│
    │                            │   getTodos re-run + new list push                  │
    │                            │                            │                        │
    │                            │                            │   list me naya todo    │
    │                            │                            │   dikh gaya (refetch   │
    │                            │                            │   code likhne ki       │
    │                            │                            │   zarurat nahi)        │
```

**Ye hi Convex ka superpower hai** — do alag browser tab, same data, sab ek sath update.

### 6.3 Auth Layers (Defense in Depth)

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: middleware.ts (Next.js)                   │
│  • Unauthenticated user → /auth/sign-in redirect    │
│  • Authenticated user on /auth/sign-in → / redirect │
├─────────────────────────────────────────────────────┤
│  Layer 2: convex/auth.ts (session tokens)           │
│  • Session cookie verify → getAuthUserId(ctx)       │
│  • Bina valid session → null / "Unauthorized"       │
├─────────────────────────────────────────────────────┤
│  Layer 3: convex/*.ts (authorization)               │
│  • Har query/mutation me userId check               │
│  • Data ownership verify (todo.userId === userId)    │
├─────────────────────────────────────────────────────┤
│  Layer 4: schema.ts + args validators               │
│  • v.* validators → wrong type/shape reject          │
│  • zod (client) → UX-level validation               │
└─────────────────────────────────────────────────────┘
```

Har layer alag kaam karti — ek fail ho to doosri bachati hai.

---

## 7. Real-Life Usages — Convex Kab Use Karein

### ✅ Convex Perfect Hai Jab:

1. **Realtime collaboration apps**
   - Google Docs jaisa editor, live cursor sharing
   - Multiplayer whiteboard (Excalidraw jaisa)
   - Chat apps — messages turant dikhne chahiye
   - ```ts
     // Presence/typing indicator
     export const setTyping = mutation({
       args: { conversationId: v.id("conversations") },
       handler: async (ctx, args) => {
         // har connected client ko live update jayega
       },
     });
     ```

2. **Dashboards with live data**
   - Trading dashboard (price live update)
   - Analytics dashboard — page refresh ki zarurat nahi
   - Admin panels

3. **SaaS with auth — quick MVP**
   - Startups jinko pehle 2-3 hafte me product chahiye
   - Convex Auth se GitHub/Google/email login ready
   - Billing, user management sab Convex pe

4. **Todo/Notes/Productivity apps**
   - Jaise ye repo — offline-first feel, instant sync
   - Notion jaisa notes app

5. **Social feeds**
   - Naya post aaye to sabko live dikhe
   - Likes/comments real-time

### ❌ Convex Avoid Karein Jab:

1. **Complex relational queries** — heavy JOINs, aggregations across many tables. Convex single document queries pe fast hai, SQL-style analytics nahi.
2. **Legacy SQL ecosystem** — existing Postgres data, BI tools, stored procedures.
3. **Batch/ETL heavy workloads** — lakhs rows ka nightly processing. Convex ke mutations transactional hain (single transaction), bulk ke liye alag chahiye.
4. **Static content-heavy sites** — blog/portfolio jahan data rarely badalta. Wahan Next.js + static DB enough hai.

### Convex vs Alternatives (Quick):

| Feature | Convex | Firebase | Supabase |
|---------|--------|----------|----------|
| DB | Document (custom) | Firestore (document) | PostgreSQL |
| Query language | TS filter/indices | Firestore queries | SQL |
| Realtime | Built-in, automatic | Built-in (but limited queries) | Realtime (separate) |
| Backend functions | Queries + Mutations | Cloud Functions | Edge Functions |
| Type safety | Full TS end-to-end | SDK types (partial) | Generated types |
| Auth | Convex Auth (integrated) | Firebase Auth | Supabase Auth |
| Migrations | Auto (schema diff) | No SQL migrations | Manual SQL migrations |

---

## 8. Gotchas & Debugging (RFC 9207 Story)

### Real bug jo is repo me hua: `unexpected "iss" (issuer) response parameter value`

**Story (April 2026):**

```
GitHub ne RFC 9207 (OAuth 2.0 Authorization Server Issuer Identification)
silently roll out kiya. Callback URL me ab ye aata hai:

  /api/auth/callback/github?code=...&state=...&iss=https://github.com/login/oauth
```

**Problem chain:**

1. Convex Auth ka GitHub provider (`@auth/core`) `issuer` field set nahi karta tha.
2. Convex Auth internal me placeholder issuer use karta: `theremustbeastringhere.dev`
3. `oauth4webapi` library callback pe `iss` ko **compare** karti hai provider ke issuer se:
   ```
   if (iss && iss !== as.issuer) → throw 'unexpected "iss" (issuer) response parameter value'
   ```
4. `https://github.com/login/oauth` ≠ `theremustbeastringhere.dev` → **login fail**.

**Fix (`convex/auth.ts`):**

```ts
GitHub({
  issuer: "https://github.com/login/oauth",   // GitHub ka actual issuer
})
```

**Ek aur workaround jo fail hua (seekhne ke liye):**

Kisi ne `convex/http.ts` me wrapper likha tha jo `iss` query param delete kare callback pe:

```ts
// ❌ YE KAAM NAHI KARTA
if ("path" in spec && spec.path === "/api/auth/callback/github") { ... }
```

**Kyun fail:** Convex Auth callback ko `pathPrefix: "/api/auth/callback/"` se register karta hai, `path` se nahi. Condition hamesha `false` — wrapper kabhi chala hi nahi.

**Lesson:**
- Library ke internal registration pattern verify karo assumption se pehle
- Better fix = root cause (`issuer` set karo), symptom patch (param delete) nahi
- GitHub jaise providers silent breaking change karte hain — changelog/community discussions follow karo

### Common Debugging Tips:

```bash
# Convex logs live dekho
npx convex logs

# Dev server (auto-deploy schema + functions)
npx convex dev

# Type check
node node_modules/typescript/bin/tsc --noEmit
```

- `useQuery` `undefined` de raha → query chal rahi hai (loading), error throw ho rahi to console me dikhega
- `Unauthorized` error → `getAuthUserId` null de raha → session expired ya cookie missing → re-login
- GitHub login redirect loop → middleware aur callback ka `redirectTo` match karo

---

## 9. Commands & Run

```bash
# Install
bun install        # ya npm install

# Convex dev server (alag terminal) — auto codegen + deploy
npx convex dev

# Next.js dev server
bun dev            # ya npm run dev

# Production build
bun build
bun start
```

**Env (`.env.local`):**

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SITE_URL=https://your-deployment.convex.site
GITHUB_ID=your_github_oauth_app_client_id
GITHUB_SECRET=your_github_oauth_app_client_secret
```

GitHub OAuth App banate waqt **Callback URL**:
```
https://your-deployment.convex.site/api/auth/callback/github
```

---

## 🧠 Key Takeaways

1. Convex = DB + API + realtime + auth **ek platform** — boilerplate 70% kam
2. `useQuery` = **live subscription**, refetch code likhne ki zarurat nahi
3. Har query/mutation me **`getAuthUserId` + ownership check** — security layer
4. Convex Auth se GitHub login **4 files** me ready (auth.ts, http.ts, auth.config.ts, middleware.ts)
5. Client zod + server `v.*` — **dono validation layers** chahiye
6. RFC 9207 jaise silent provider changes ke liye — **root cause fix** karo, symptoms patch mat karo
