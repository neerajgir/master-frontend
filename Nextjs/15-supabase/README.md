# 🚀 Next.js + Supabase — Learning Repo (15-supabase)

> **Kya hai ye project?** Ek complete blogging app jisme Next.js 16 (App Router, Turbopack) + Supabase (Auth, Postgres, Storage, RLS) + Editor.js (rich text editor) ka full stack integration sikha gaya hai. Har concept — database table banane se lekar row-level security policies aur image storage tak — real code ke saath explain kiya gaya hai.

---

## 📚 Index (Topics)

1. [Supabase Kya Hai?](#1-supabase-kya-hai)
2. [Setup Supabase](#2-setup-supabase)
3. [User Authentication](#3-user-authentication)
4. [Post Table (Database Schema)](#4-post-table-database-schema)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [Storage Bucket](#6-storage-bucket)
7. [RLS Policy for Storage](#7-rls-policy-for-storage)
8. [Editor.js Integration](#8-editorjs-integration)
9. [Diagram Explanations](#9-diagram-explanations)
10. [Real Life Usages](#10-real-life-usages)

---

## 1. Supabase Kya Hai?

Supabase ek **open-source Backend-as-a-Service (BaaS)** hai — Firebase ka alternative. Par Firebase se main difference: **supabase pura PostgreSQL database deta hai**, mongo jaisa NoSQL nahi.

Iska matlab:

- **Real SQL database** — joins, foreign keys, constraints sab chalte hain
- **Row Level Security** — database ke andar hi auth check hota hai, sirf app code pe bharosa nahi
- **Auto REST API** — har table ka API apne aap ban jata hai (PostgREST)
- **Auth built-in** — email/password, OAuth, magic link
- **Storage** — S3 jaisa file storage with policies
- **Realtime** — websockets se data live update

### Supabase Architecture

```
┌─────────────────────────────────────────────────────┐
│                   YOUR NEXT.JS APP                  │
│                                                      │
│   Client Component ──── lib/supabase/client.js       │
│   Server Component ──── lib/supabase/server.js       │
│   Middleware ────────── session refresh              │
└──────────────────────┬──────────────────────────────┘
                       │  HTTPS (anon key / user JWT)
                       ▼
┌─────────────────────────────────────────────────────┐
│                   SUPABASE PLATFORM                  │
│                                                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │   Auth   │  │ PostgREST │  │     Storage      │  │
│  │ (GoTrue) │  │  (API)    │  │  (S3 compatible) │  │
│  └────┬─────┘  └─────┬─────┘  └────────┬─────────┘  │
│       │              │                  │            │
│       ▼              ▼                  ▼            │
│  ┌──────────────────────────────────────────────┐   │
│  │           PostgreSQL + RLS Policies           │   │
│  │     (har query pe security check hota hai)    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Deep knowledge:** Supabase ka asli power REST API mein nahi, **RLS** mein hai. Tumhara frontend chahe kitna bhi secure ho, agar database khula hai (anon key public hoti hai), to koi bhi PostgREST call karke data le sakta hai — **jab tak RLS policies na hon**. Isliye RLS = real security boundary.

---

## 2. Setup Supabase

### Step 1: Project banao

1. [supabase.com](https://supabase.com) pe signup karo
2. **New Project** pe click karo
3. Project name, database password, region choose karo (India ke liye `ap-south-1` / Singapore best)
4. Project banne mein ~2 minute lagte hain

### Step 2: Environment variables

Supabase Dashboard → **Project Settings → API** se ye values lo:

```bash
# .env.local (ye file git mein MAT daalo — .gitignore mein already hai)

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

> **Note:** Pehle ye `NEXT_PUBLIC_SUPABASE_ANON_KEY` tha, ab Supabase ne naam badal ke `PUBLISHABLE_KEY` kar diya hai. Dono same cheez hain — public key jo browser mein ja sakti hai, koi secret nahi.

### Step 3: Install packages

```bash
bun add @supabase/supabase-js @supabase/ssr
```

- `@supabase/supabase-js` — core client (auth, database, storage APIs)
- `@supabase/ssr` — Next.js App Router ke liye special wrapper (cookies-based session)

### Step 4: Do clients banao — Browser vs Server

**Browser client** — `lib/supabase/client.js` (client components ke liye):

```javascript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
```

**Server client** — `lib/supabase/server.js` (server components, route handlers, middleware ke liye):

```javascript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies(); // Next.js 16: cookies() ab async hai

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component mein set karne ki koshish hoti hai to ignore —
            // middleware session refresh kar deta hai
          }
        },
      },
    }
  );
}
```

**Kya farak hai:**

| | Browser Client | Server Client |
|---|---|---|
| Package | `createBrowserClient` | `createServerClient` |
| Session kahan | HTTP-only cookie | Cookie store (server read karta hai) |
| Kab use karo | `"use client"` components | Server Components, API routes, middleware |
| Secret key | ❌ Sirf public key | ❌ Sirf public key (secret key kabhi client pe nahi) |

### Step 5: Middleware — session refresh (bahut zaroori)

`middleware.js`:

```javascript
import { NextResponse } from "next/server";
import { createClient } from "./lib/supabase/server";

export async function middleware(request) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = await createClient();

  // CRITICAL: har request pe chalao — token refresh hota hai,
  // warna expiry ke baad user "randomly" logout ho jayega
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
```

**Deep knowledge:** `supabase.auth.getUser()` sirf user nahi aata — ye **side-effect** mein expired JWT ko refresh karke nayi cookie set karta hai. Isko na chalao to pehla page load theek, 1 hour baad session mar jayega. Ye `@supabase/ssr` ka documented pattern hai.

---

## 3. User Authentication

Supabase Auth (GoTrue) handles karta hai: signup, login, logout, email verification, sessions.

### Flow diagram

```
SIGNUP:
  User form ──► supabase.auth.signUp({email, password})
                     │
                     ├──► auth.users table mein naya row
                     ├──► confirmation email (link with token)
                     │
                     ▼
              /auth/signup-success page
                     │
              user email verify karta hai
                     ▼
              login page pe redirect

LOGIN:
  User form ──► supabase.auth.signInWithPassword({email, password})
                     │
                     ├──► password bcrypt se verify
                     ├──► access_token + refresh_token milta hai
                     ├──► tokens HTTP-only cookie mein set
                     │         (browser CLIENT JS se nahi padh sakta)
                     ▼
              router.push("/")  ──► ab har request mein cookie jayegi
                                    middleware token refresh karega
                                    server client cookie se user nikalega

LOGOUT:
  POST /auth/logout ──► supabase.auth.signOut()
                     ├──► cookie delete (server side)
                     ├──► refresh token DB mein revoke
                     ▼
              redirect("/auth/login")
```

### Signup — `app/auth/signup/page.jsx`

```jsx
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo:
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
  },
});
if (error) throw error;
router.push("/auth/signup-success");
```

`emailRedirectTo` — verification email ka link isi URL pe land karega. Supabase Dashboard → **Authentication → URL Configuration** mein ye domain "Redirect URLs" list mein hona chahiye, warna link kaam nahi karega.

### Login — `app/auth/login/page.jsx`

```jsx
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw error;
router.push("/");
```

### Protecting pages — Server Component check

`app/page.js` (home page):

```jsx
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login"); // server-side redirect — user ko page data milta hi nahi
  }
  // ... baaki data fetch
}
```

**Pattern:** Har protected Server Component mein pehle `getUser()` → phir `redirect()`. Ye **server-side gate** hai — response banta hi nahi unauthorized user ke liye.

### Logout — `app/auth/logout/route.js`

```javascript
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
```

Home page se plain HTML form se call hota hai:

```jsx
<form action="/auth/logout" method="post">
  <Button variant="outline" type="submit">Logout</Button>
</form>
```

### `getUser()` vs `getSession()` — interview question

- **`getSession()`** — cookie padh ke token deta hai (client-side validation). Token forged ho sakta hai.
- **`getUser()`** — Supabase Auth server ko call karke verify karta hai. **Hamesha `getUser()` use karo** — ye real security check hai.

---

## 4. Post Table (Database Schema)

Blog app ka dil — `posts` table.

### SQL (Supabase Dashboard → SQL Editor mein run karo):

```sql
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  excerpt text,
  content jsonb,          -- Editor.js JSON yahan store hota hai
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Apne posts jaldi dhoondne ke liye index
create index posts_user_id_idx on public.posts (user_id);
```

### Column-wise explanation

| Column | Type | Kyun? |
|---|---|---|
| `id` | `uuid` | Guessable nahi (sequential id se attack ho sakta tha) |
| `user_id` | `uuid → auth.users(id)` | Foreign key — post ka owner. `on delete cascade`: user delete ho to uske posts bhi delete |
| `title` | `text` | Post ka naam |
| `excerpt` | `text` (nullable) | List page pe short summary |
| `content` | `jsonb` | Editor.js structure: `{"blocks": [...], "time": ..., "version": "..."}`. JSONB = queryable JSON (Postgres `->>` operators chalte hain) |
| `created_at` | `timestamptz` | Default `now()` — har insert pe automatic |

**Deep knowledge — `jsonb` vs `text`:**

```sql
-- text mein JSON rakhoge to parse app mein karna padega
-- jsonb mein directly query kar sakte ho:
select * from posts where content->'blocks'->0->>'type' = 'header';
```

Editor.js ka output JSON hai, isliye `jsonb` perfect fit — na string banane ki zarurat (Supabase client JSONB ko automatically handle karta hai), na parse ki.

### App se insert — `app/editor/page.jsx`

```jsx
const content = await editorRef.current.save(); // Editor.js ka JSON output

const { data, error: insertError } = await supabase
  .from("posts")
  .insert({
    title,
    excerpt,
    content, // ❌ JSON.stringify() mat karo — column jsonb hai, object chahiye
    user_id: user.id,
  })
  .select()
  .single();
```

> **Common bug:** `content: JSON.stringify(content)` likh do aur column `jsonb` ho — Supabase double-encode kar deta hai, phir read time pe string milti hai object ki jagah. Object hi bhejo.

### App se select — home page

```jsx
const { data: posts } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

---

## 5. Row Level Security (RLS)

**Sabse important concept.** RLS = database ke andar chalti hui security.

### Problem kya hai?

Supabase ki **anon key public** hoti hai (frontend JS mein dikhti hai). Koi bhi Inspect → Network se request dekh ke seedha PostgREST call laga sakta hai:

```
GET https://xxxx.supabase.co/rest/v1/posts
```

Bina RLS ke: **sab kuch leak** — doosre users ki posts, emails, sab.

### Solution: RLS enable + policies

```sql
-- Step 1: table pe RLS on karo (default OFF hota hai!)
alter table public.posts enable row level security;

-- Step 2: policies banao — "kaun kya kar sakta hai"

-- 1. Apni posts padho
create policy "Users can read own posts"
  on public.posts for select
  using (auth.uid() = user_id);

-- 2. Apni posts insert karo
create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- 3. Apni posts update karo
create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Apni posts delete karo
create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);
```

### Policy ka har part samjho

```sql
create policy "Users can read own posts"   -- policy ka naam (debug ke liye)
  on public.posts                          -- kaunsi table
  for select                               -- kaunsa operation: select/insert/update/delete/all
  using (auth.uid() = user_id);            -- ROW FILTER: ye row milti hai ya nahi
```

- **`using`** — SELECT/UPDATE/DELETE pe: kaunsi rows **dikhein**
- **`with check`** — INSERT/UPDATE pe: nayi row mein **condition satisfy honi chahiye**
- **`auth.uid()`** — current user ka UUID (JWT se nikalta hai). Anonymous user ke liye `null`

### Kaise kaam karta hai — flow

```
Client:  supabase.from("posts").select("*")
              │
              ▼
PostgREST:  Authorization: Bearer <user JWT>
              │
              ▼
Postgres:
  ┌─────────────────────────────────────────────┐
  │  RLS ON hai, isliye policy lagu             │
  │                                              │
  │  SELECT * FROM posts                         │
  │  WHERE auth.uid() = user_id   <-- policy    │
  │                                              │
  │  User A ka JWT → auth.uid() = uuid-A         │
  │  → sirf uuid-A wali rows return              │
  └─────────────────────────────────────────────┘
              │
              ▼
Client ko: sirf apni posts (app code kuch filter nahi karta)
```

**Deep knowledge:** Filter app ke code mein nahi, **database query plan ke andar** lagta hai. User chahe `eq("user_id", kisi_aur_ki)` lagaye — policy fir bhi uski doosri row nahi degi. App code mein `.eq("user_id", user.id)` sirf extra safety/readability ke liye hai (double protection).

### RLS ON na ho to kya hoga?

```sql
-- ❌ DANGER: policy nahi banao, sirf enable karo
alter table public.posts enable row level security;

-- Result: sab blocked! Even authenticated user ko 0 rows.
-- RLS ON + koi policy nahi = default DENY (fail-closed) ✅

-- ❌❌ WORSE: RLS hi OFF ho to
-- Result: sab kuch OPEN — anon key se poori table (fail-open) 🚨
```

**Rule of thumb:** RLS **hamesha ON** rakho. Pehle `enable`, phir policy likho. Kisi bhi table pe RLS OFF = data leak.

---

## 6. Storage Bucket

Images (post ke illustrations) Supabase Storage mein store hoti hain — ek S3-compatible object storage.

### Bucket banao

Dashboard → **Storage → New bucket**:

| Setting | Value |
|---|---|
| Name | `blog-images` |
| Public bucket | ✅ ON (blog images publicly readable chahiye) |
| File size limit | e.g. 5 MB |
| Allowed MIME types | `image/png, image/jpeg, image/gif, image/webp` |

Ya SQL se:

```sql
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true);
```

### Folder structure

```
blog-images/
 └── <user_id>/                    ← storage mein path = folder
      ├── 1731234567890-photo.png  ← Date.now() prefix = unique name
      └── 1731234567999-diagram.jpg
```

**Kyun `<user_id>/` prefix?** — Storage RLS policies ke liye path parse karna padta hai. User apna folder khud manage kare, doosre ka na chhoo sake.

### Upload code — Editor.js Image tool config (`app/editor/page.jsx`)

```jsx
image: {
  class: Image,
  config: {
    uploader: {
      uploadByFile: async (file) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const fileName = `${Date.now()}-${file.name}`;

        // 1. Storage mein upload — path: "<user_id>/<filename>"
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(`${user.id}/${fileName}`, file);

        if (uploadError) throw uploadError;

        // 2. Public URL nikalo
        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(`${user.id}/${fileName}`);

        // 3. Editor.js ko wapas ye format chahiye
        return {
          success: 1,
          file: { url: data.publicUrl },
        };
      },
    },
  },
},
```

**Flow:**

```
User image drag kare Editor.js mein
        │
        ▼
uploadByFile(file) chala          ← custom uploader
        │
        ├── auth check (getUser)
        ├── path = `${user.id}/${Date.now()}-${name}`
        ├── storage.from("blog-images").upload(path, file)
        │        │
        │        ├── RLS check: INSERT policy lagu?✅
        │        └── file object store ho gaya
        │
        ├── getPublicUrl(path) → https://.../storage/v1/object/public/blog-images/...
        │
        └── return { success: 1, file: { url } }
                    │
                    ▼
        Editor.js block mein <img src=url> render
        URL JSONB content ke saath DB mein save
```

**Public bucket vs signed URL:**

- **Public bucket** — `/object/public/` URL kisi ko bhi bhej sakte ho. Blog images ke liye sahi.
- **Private bucket + signed URL** — `createSignedUrl(path, expiresIn)` — time-limited link. Private docs, invoices ke liye.

---

## 7. RLS Policy for Storage

Storage bhi ek database hai (tables: `storage.objects`, `storage.buckets`) — ispe bhi RLS lagta hai. Bucket banana sirf container hai; **kaun upload kar sake, kaun padh sake — policies decide karti hain**.

### Storage RLS policies

```sql
-- Bucket public hai (read open), par write sirf apna

-- 1. Apne folder mein upload karo
create policy "Users can upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Public read (blog images koi bhi dekh sake)
create policy "Blog images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- 3. Sirf apni file delete karo
create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Policy kaise kaam karti hai — path parsing

```
storage.objects mein ek row:
  name     = "uuid-abc-123/photo.png"     ← pura path
  bucket_id = "blog-images"

storage.foldername(name)  →  {uuid-abc-123, photo.png}
                                ▲
                                [1] = pehla folder = user_id

Condition:  (storage.foldername(name))[1] = auth.uid()::text
            "uuid-abc-123"              =  "uuid-abc-123"  ✅ upload allowed

Doosra user (uuid-xyz):
            "uuid-abc-123"              =  "uuid-xyz"      ❌ insert rejected
```

**Isliye folder structure `<user_id>/...` important tha** — policy ko user ownership path se milti hai.

### Storage policy vs DB policy — comparison

| | `posts` table policy | `storage.objects` policy |
|---|---|---|
| Table | `public.posts` | `storage.objects` |
| Path filter | `auth.uid() = user_id` | `foldername(name)[1] = auth.uid()` |
| Read | apni rows | `bucket_id = 'blog-images'` (public) |
| Write | apni rows insert/update | sirf apne folder mein |

**Deep knowledge:** Storage ka `INSERT` policy tabhi check hoti hai jab `upload()` call ho — agar policy missing ho to upload **silently fail** nahi karta, **403 error** deta hai (`new row violates row-level security policy`). Debug karo to pehle policy existence check karo, code nahi.

---

## 8. Editor.js Integration

Editor.js — block-based WYSIWYG editor. Output **JSON** hai HTML ki jagah (iska fayda section 4 mein dekha).

### Packages

```bash
bun add @editorjs/editorjs @editorjs/header @editorjs/paragraph \
        @editorjs/list @editorjs/quote @editorjs/code @editorjs/image
```

### Editor.js output format (JSONB mein save hota hai)

```json
{
  "time": 1731234567890,
  "blocks": [
    { "type": "header",  "data": { "text": "Mera Pehla Post", "level": 2 } },
    { "type": "paragraph","data": { "text": "Ye ek paragraph hai" } },
    { "type": "list",    "data": { "style": "unordered", "items": ["ek", "do"] } },
    { "type": "code",    "data": { "code": "console.log('hi')" } },
    { "type": "image",   "data": { "url": "https://.../photo.png", "caption": "pic" } }
  ],
  "version": "2.31.7"
}
```

### Initialization — `app/editor/page.jsx`

```jsx
useEffect(() => {
  let editorInstance = null;

  const initEditor = async () => {
    if (editorRef.current) return; // double-init guard (React StrictMode ke liye)

    // ⚠️ TOP-LEVEL IMPORT MAT KARO!
    // Editor.js bundle module eval pe Element.prototype chhuta hai —
    // SSR mein (Node) "Element is not defined" error aata hai.
    const [
      { default: EditorJS },
      { default: Header },
      { default: Paragraph },
      { default: List },
      { default: Quote },
      { default: Code },
      { default: Image },
    ] = await Promise.all([
      import("@editorjs/editorjs"),
      import("@editorjs/header"),
      import("@editorjs/paragraph"),
      import("@editorjs/list"),
      import("@editorjs/quote"),
      import("@editorjs/code"),
      import("@editorjs/image"),
    ]);

    editorInstance = new EditorJS({
      holder: "editorjs",          // div#editorjs ka id
      tools: {
        header: Header,
        paragraph: Paragraph,
        list: List,
        quote: Quote,
        code: Code,
        image: { class: Image, config: { uploader: { uploadByFile } } }, // section 6
      },
      onReady: () => setIsEditorReady(true),
    });

    editorRef.current = editorInstance;

    // Edit mode: purana post load karo
    if (postId) {
      const { data: post } = await supabase
        .from("posts").select("*").eq("id", postId).single();
      if (post) {
        setTitle(post.title);
        const content =
          typeof post.content === "string" ? JSON.parse(post.content) : post.content;
        await editorInstance.isReady;
        await editorInstance.render(content); // blocks render
      }
    }
  };

  initEditor();
  return () => {
    editorRef.current?.destroy?.();   // unmount pe cleanup
    editorRef.current = null;
  };
}, [postId]);
```

### Save — button click pe

```jsx
await editorRef.current.isReady;
const content = await editorRef.current.save(); // JSON milta hai
// ... insert/update query (section 4)
```

### Rendering — `components/blog-content.jsx`

DB se JSON milta hai, read page pe **custom renderer** block-by-block React elements banata hai:

```jsx
content.blocks.map((block) => {
  switch (block.type) {
    case "header":
      return React.createElement(`h${block.data.level || 2}`, { key }, block.data.text);
    case "paragraph":
      return <p key={index} className="leading-relaxed">{block.data.text}</p>;
    case "list":
      return block.data.style === "ordered"
        ? <ol>...</ol>
        : <ul>...</ul>;
    case "image":
      return <img src={block.data.url} alt={block.data.caption} />;
    // quote, code, default...
  }
});
```

**Deep knowledge — SSR trap:** Editor.js ka bundle **browser-only** hai (DOM access module level pe). `"use client"` ka matlab ye NAHI ki server evaluate nahi karega — Next.js client components ko bhi server pe render karta hai. Isliye:

- ❌ Top-level `import EditorJS from "@editorjs/editorjs"` → SSR crash: `Element is not defined`
- ✅ `useEffect` ke andar `await import(...)` → browser mein hi load

Ya phir pura component `dynamic(() => import(...), { ssr: false })` se load karo (is repo mein `components/Editor.jsx` ke liye wahi pattern reserved hai).

---

## 9. Diagram Explanations

### 9.1 Complete Request Lifecycle

```
USER BROWSER                         NEXT.JS SERVER                    SUPABASE
     │                                     │                                │
     │  GET /blog/abc123                   │                                │
     │────────────────────────────────────►│                                │
     │                                     │  1. middleware.js              │
     │                                     │     createClient()             │
     │                                     │     auth.getUser() ───────────►│ token refresh
     │                                     │     (nayi cookie set) ◄────────│ + user verify
     │                                     │                                │
     │                                     │  2. page.jsx Server Component  │
     │                                     │     const {id} = await params  │
     │                                     │     auth.getUser() ───────────►│
     │                                     │     user? ─────────────────────│
     │                                     │                                │
     │                                     │  3. posts select ─────────────►│ RLS check:
     │                                     │     .eq("id", id)              │ auth.uid() = user_id
     │                                     │                                │ row mili?
     │                                     │  4. post data ◄────────────────│
     │                                     │                                │
     │  HTML (post render)                 │                                │
     │◄────────────────────────────────────│                                │
     │                                     │                                │
     │  ─── client hydration: editor, theme toggle etc ───                  │
```

### 9.2 Auth Session Lifecycle

```
t=0     signup/login
        │
        ▼
access_token (JWT, ~1 hr)  +  refresh_token (long-lived)
        │                         │
        ▼                         ▼
   HTTP-only cookie          DB mein stored
   (browser JS nahi padh sakta)
        │
        │  har request: middleware getUser()
        ▼
t=59min  token about to expire
        │  middleware refresh call ──────► Supabase Auth
        │  naya access_token ◄────────────  (refresh_token se)
        │  Set-Cookie header
        ▼
t=60min  seamless — user ko pata bhi nahi chala
        │
        │  refresh_token bhi expire/galat ho gaya?
        ▼
        user null ──► redirect("/auth/login")
```

### 9.3 RLS Decision Table

```
Request aayi ──► RLS enabled on table?
                     │
          ┌──────────┴──────────┐
         NO                    YES
          │                     │
    🚨 SAB OPEN          policy for this op?
    (anon key se                    │
     poori table)        ┌──────────┼──────────┐
                    SELECT      INSERT      UPDATE/DELETE
                         │           │            │
                    using()    with check    using()+with check
                         │           │            │
                    row match?   new row         row match
                    ┌────┴────┐   satisfy?      AND new row ok
                   YES       NO
                    │         │
                 row return  row hide (0 rows, NO error!)
```

> **Note:** RLS reject pe error NAHI aata — silently 0 rows/0 effect. Isliye bug hunting mushkil: "insert fail" ki jagah "insert hua par kuch nahi dikha" type symptoms.

### 9.4 Editor.js Data Flow

```
[CREATION]                          [STORAGE]                     [READ]
Editor.js UI                        supabase                      blog page
     │                                │                              │
 typed content                        │                              │
     │                                │                              │
 editor.save()                        │                              │
     │                                │                              │
     ▼                                │                              │
 JSON {blocks:[...]} ──insert──► posts.content (jsonb)               │
                                        │                            │
                                        │         select ────────────┤
                                        │              │             │
                                        │              ▼             │
                                        │      BlogContent renderer  │
                                        │      switch(block.type)    │
                                        │              │             │
                                        │              ▼             │
                                        │      <h2> <p> <ul> <img>   │
```

### 9.5 Storage Upload + Policy Flow

```
image drop
   │
   ▼
uploadByFile(file)
   │
   ├─ getUser() ──────────────────── auth check (client side)
   │
   ├─ path = `${user.id}/${Date.now()}-${name}`
   │
   └─ storage.from("blog-images").upload(path, file)
            │
            ▼
      storage.objects INSERT
            │
            ▼
      RLS INSERT policy:
      foldername(name)[1] = auth.uid()?
       ┌─────┴─────┐
      YES          NO
       │            │
    file save    403 error
       │
       ▼
   getPublicUrl(path)
       │
       ▼
   { success:1, file:{url} } ──► Editor.js block ──► save() ──► jsonb
```

---

## 10. Real Life Usages

### 10.1 Is architecture pe kaise products bante hain

| Product idea | Is repo se kya reuse hoga |
|---|---|
| **Personal blog / portfolio** | Ye repo khud! Posts + images + auth |
| **Team notes app (Notion-lite)** | `posts` → `documents` table, RLS mein `auth.uid() = ANY(member_ids)` |
| **Company internal wiki** | Same, + `private` bucket for attachments |
| **Job portal** | `jobs` table (company insert) + `applications` table (user insert), alag-alag policies |
| **E-commerce catalog** | `products` table public read policy, `orders` table user-scoped (posts wala pattern) |
| **Multi-tenant SaaS** | `tenant_id` column, policy: `tenant_id = current_tenant()` — tenant data isolation DB level pe |
| **Changelog / release notes** | Editor.js + `is_published` flag policy |
| **Course content platform** | `lessons` (public read) + `progress` (user-scoped) |

### 10.2 Production mein aane wale real issues aur solution

**1. RLS performance**
```sql
-- Har row pe policy evaluate hoti hai — FK column pe index chahiye
create index posts_user_id_idx on posts (user_id);
-- auth.uid() = user_id wala filter index se fast
```

**2. N+1 queries (list page)**
```javascript
// ❌ post per comment alag query — 100 posts = 101 queries
// ✅ embed:
const { data } = await supabase
  .from("posts")
  .select("*, comments(*)");   // join PostgREST se
```

**3. Image bloat**
```javascript
// ❌ Original 8MB upload — page slow
// ✅ Storage transform: width limit
.getPublicUrl(path + "?width=800&quality=75")  // ya edge functions se resize
```

**4. Double-init in React StrictMode (dev)**
```javascript
// useEffect 2 baar chalta hai (mount, unmount, mount)
// editorRef guard + destroy() cleanup — is repo mein already handled
```

**5. Secrets**
```
✅ NEXT_PUBLIC_* sirf public values (URL, anon/publishable key)
❌ Service role key (full access, RLS bypass) — SERVER-ONLY, kabhi NEXT_PUBLIC_ mat banao,
   kabhi client bundle mein mat daalo
```

**6. Signup ke baad email verification mandatory rakhna**
- Agar OFF, to spam accounts seedhe app use kar lenge
- Dashboard → Authentication → Providers → Email → "Confirm email" ON

### 10.3 Next.js 16 gotchas jo is repo mein encounter hue

| Gotcha | Error message | Solution (is repo mein) |
|---|---|---|
| `params` ab Promise hai | `params is a Promise and must be unwrapped with await` | `const { id } = await params` — `app/blog/[id]/page.jsx` |
| Browser-only lib ka top-level import | `Element is not defined` (SSR) | `useEffect` mein dynamic `import()` — `app/editor/page.jsx` |
| `cookies()` ab async hai | — | `const cookieStore = await cookies()` — `lib/supabase/server.js` |
| Client component bhi SSR hota hai | — | `"use client"` = hydration client pe, module eval server pe bhi |

### 10.4 Interview ke liye 5 pointer summary

1. **Supabase** = Postgres + Auth + Storage + realtime, BaaS, Firebase alternative but SQL-based
2. **RLS** = security boundary, `using` (read filter) vs `with check` (write validation), `auth.uid()` se current user
3. **RLS OFF = data leak**, ON + no policy = sab blocked (fail-closed)
4. **Two clients** — browser (`createBrowserClient`) vs server (`createServerClient` + cookies), middleware mein `getUser()` = session refresh
5. **Editor.js** = JSON output, `jsonb` column, browser-only bundle → dynamic import SSR ke liye

---

## 🛠️ Project Structure

```
15-supabase/
├── app/
│   ├── page.js                  # Home — posts list (protected, server component)
│   ├── layout.js                # Root layout + theme provider
│   ├── editor/
│   │   └── page.jsx             # Editor.js — create/edit post (lazy-loaded)
│   ├── blog/[id]/
│   │   └── page.jsx             # Single post view (await params)
│   └── auth/
│       ├── login/page.jsx       # signInWithPassword
│       ├── signup/page.jsx      # signUp + emailRedirectTo
│       ├── signup-success/      # Verification pending page
│       └── logout/route.js      # POST — signOut + redirect
├── lib/
│   └── supabase/
│       ├── client.js            # createBrowserClient (client components)
│       └── server.js            # createServerClient (server/middleware)
├── components/
│   ├── Editor.jsx               # Standalone Editor.js (ssr:false dynamic)
│   └── blog-content.jsx         # JSON blocks → React elements renderer
├── middleware.js                # Session refresh (har request pe getUser)
└── .env.local                   # NEXT_PUBLIC_SUPABASE_URL, PUBLISHABLE_KEY
```

## ▶️ Chalane ka tarika

```bash
bun install
# .env.local mein Supabase URL + key daalo
bun run dev
# http://localhost:3000
```

**Pehli baar setup checklist:**
1. Supabase project banao → URL + publishable key `.env.local` mein
2. SQL Editor mein `posts` table + RLS policies run karo (sections 4-5)
3. Storage mein `blog-images` bucket banao + policies (sections 6-7)
4. Authentication → URL Configuration mein `http://localhost:3000` redirect add karo
5. `bun run dev` → signup → naya post banao ✅

---

## 📖 Further Reading

- [Supabase Docs — SSR](https://supabase.com/docs/guides/auth/server-side)
- [Supabase Docs — RLS](https://supabase.com/docs/guides/database/postgresql/row-level-security)
- [Supabase Docs — Storage](https://supabase.com/docs/guides/storage)
- [Editor.js Docs](https://editorjs.io/)
- [Next.js 16 — Dynamic APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
