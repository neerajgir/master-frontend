# 🗄️ Next.js + Prisma ORM — Learning Repository

> Hinglish guide: ORM kya hai, Prisma kaise kaam karta hai, diagram-explanation, aur real-life usages — sab ek jagah.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

## 1. 📖 Kya hai ye repo? (Intro)

Ye repo **Next.js App Router** aur **Prisma ORM** ko use karke ek chhota par **complete CRUD application** banane ka tutorial hai. Isme hum:

- Users create aur fetch karte hain (`/`)
- Posts ka full CRUD (Create, Read, Update, Delete) karte hain (`/posts`)
- Prisma Client setup karte hain PostgreSQL (Neon) ke saath
- Next.js **Server Actions** use karke database queries server-side chalaate hain
- `"use cache"` aur `useTransition` jaisa Next.js features bhi dekhte hain

Agar tum Naya ho database aur ORM ke liye, toh ye repo tumhari **seekhne ki shuruaat** ke liye best hai.

---

## 2. 🛠 Tech Stack

| Layer | Technology | Kyun use kiya |
|-------|------------|---------------|
| Framework | Next.js 16 (App Router) | Server Components, Server Actions, routing |
| ORM | Prisma 7 | Type-safe database queries, auto migration |
| Database | PostgreSQL (Neon) | Serverless-friendly relational DB |
| Connection Adapter | `@prisma/adapter-pg` | Neon/serverless pooling ke liye |
| Styling | Tailwind CSS v4 | Fast, utility-first CSS |
| Language | TypeScript | Type safety across app |
| Package Manager | Bun | Fast installs |

---

## 3. 📁 Folder Structure

```text
10-prisma-orm-intigretion/
├── prisma/
│   └── schema.prisma          # Prisma data model (User, Post)
├── prisma7.config.ts          # Prisma config (DIRECT_URL for migrations)
├── lib/
│   └── db.ts                  # PrismaClient singleton + adapter-pg
├── actions/
│   ├── action.ts              # Server Actions: createUser, getAllUser
│   └── post-action.ts         # Server Actions: CRUD for Post
├── components/
│   └── PostManager.tsx        # Client component: Post CRUD UI
├── app/
│   ├── page.tsx               # Home: User create + list (Server Component)
│   ├── posts/
│   │   └── page.tsx           # Posts page (renders PostManager)
│   └── layout.tsx             # Root layout (Geist fonts)
├── .env                       # DATABASE_URL + DIRECT_URL (Neon)
├── package.json
└── README.md
```

---

## 4. 🧠 ORM kya hai? (Deep Knowledge)

**ORM = Object Relational Mapper.**

### Simple words mein (Hinglish):
Jab tum koi database (jaise PostgreSQL, MySQL) use karte ho, toh tumhe **SQL** likhna padta hai:

```sql
INSERT INTO users (name, email, created_at) VALUES ('Rahul', 'rahul@example.com', NOW());
SELECT * FROM posts WHERE id = 'abc123';
```

Lekin tumhari application code (JavaScript/TypeScript) mein **objects** hote hain, na ki SQL rows. ORM ek "bridge" ka kaam karta hai jo:

1. Tumhare JS/TS objects ko SQL mein convert karta hai
2. Database se aaye SQL results ko wapas JS objects mein badal deta hai

### ORM ke fayde (Pros):
- ✅ **Type safety** — TypeScript se pata chalta hai ki kaunsa field kahan hai
- ✅ **SQL injection se bachav** — Params automatically escape hote hain
- ✅ **Migrations** — Schema change karne ke liye SQL likhne ki zaroorat nahi
- ✅ **Portable** — PostgreSQL se MySQL switch karna aasaan ho jata hai

### ORM ke nuksan (Cons):
- ⚠️ Thoda overhead hota hai (raw SQL se slow ho sakta hai complex queries ke liye)
- ⚠️ Bahut complex queries ke liye kabhi-kabhi raw SQL zyada achha hota hai

---

## 5. 🦾 Prisma kya hai?

**Prisma** ek modern Node.js aur TypeScript ORM hai. Iska sabse bada plus point ye hai ki ye **type-safe** hai aur **schema-first** approach follow karta hai.

Tum pehle `prisma/schema.prisma` likhte ho, aur Prisma tumhare liye:

- Database table create kar deta hai (migration)
- TypeScript types generate karta hai (`@prisma/client`)
- Auto-complete deta hai VS Code mein


---

## 6. 📝 Prisma Schema (schema.prisma)

Ye hai repo ka core file:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  updatedAt DateTime @updatedAt
}
```

### Diagram Explanation — Data Model:

```text
USER                                POST
----                                ----
id (String, @id, cuid)              id (String, @id, cuid)
email (String, @unique)             title (String)
name (String)                       content (String, optional)
createdAt (DateTime)                updatedAt (DateTime, @updatedAt)
updatedAt (DateTime, @updatedAt)

1 User ────────< Many > Post   (abhi repo mein direct relation nahi hai,
                              lekin tum @relation jod sakte ho)
```

### Prisma Attributes kya kaam karte hain?

| Attribute | Arth (Hinglish) |
|-----------|-----------------|
| `@id` | Primary key — har row ko uniquely identify karta hai |
| `@default(cuid())` | Value khud-ba-khud generate ho jayegi (Collision-optimized Unique ID) |
| `@unique` | Us column mein duplicate values nahi aa sakti (jaise email) |
| `String?` | Optional field — null ho sakta hai |
| `@updatedAt` | Har update par timestamp automatically update ho jayega |

---

## 7. 🔌 PrismaClient kaise setup karein (lib/db.ts)

Next.js App Router mein PrismaClient ko **globally singleton** banana zaroori hai, warna har request mein naya connection khulega aur database crash ho sakta hai.

```ts
// lib/db.ts
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
```

### Kyun `@prisma/adapter-pg`?

Kyun ki hum **Neon (serverless PostgreSQL)** use kar rahe hain. Serverless functions mein har invocation ek nayi connection kheil sakti hai, jo database connections khatam kar degi. `adapter-pg` **connection pooling** provide karta hai taaki:

- Connections reuse hon
- "Too many connections" error na aaye
- Neon serverless smoothly chale

> ⚠️ Note: `lib/db.ts` imports `@/app/generated/prisma` — ye tabhi kaam karega jab tum `npx prisma generate` chaloge.

---

## 8. ⚡ Server Actions + Prisma

Next.js mein **"use server"** function ko **Server Action** kehte hain. Ye server par chalte hain, client par nahi. Client se form submit hone par directly server action call hota hai — alag API route banane ki zaroorat nahi.

### actions/action.ts (User)

```ts
"use server";

import { prisma } from "@/lib/db";

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email && !name) return;

  const data = await prisma.user.create({
    data: {
      email: email,
      name: name,
      createdAt: new Date(),
    },
  });
  return data;
}

export async function getAllUser() {
  "use cache"; // Next.js cache — result thode der tak reuse karega
  const allUsers = await prisma.user.findMany();
  return allUsers;
}
```

### actions/post-action.ts (Post CRUD)

```ts
"use server";

import { prisma } from "@/lib/db";

export const createPost = async (formData: FormData) => {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title) return;

  const post = await prisma.post.create({
    data: { title, content },
  });
  return post;
};

export const getAllPost = async () => {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "asc" },
  });
  return posts;
};

export const getPostById = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id: id },
  });
  return post;
};

export const deletePostById = async (id: string) => {
  await prisma.post.delete({ where: { id: id } });
  return { message: "Post Deleted Successfully." };
};

export const updatePost = async (id: string, formData: FormData) => {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title) return;

  const updatedPost = await prisma.post.update({
    where: { id: id },
    data: { title, content },
  });
  return updatedPost;
};
```

---

## 9. 🔄 CRUD Operations — Deep Dive

Prisma mein 5 main methods hote hain jisse tum jaan-tan-baan kar sakte ho:

| Operation | Prisma Method | Kaam |
|-----------|---------------|------|
| **Create** | `prisma.model.create({ data: {...} })` | Nayi row insert karna |
| **Read (All)** | `prisma.model.findMany()` | Sabhi rows fetch karna |
| **Read (One)** | `prisma.model.findUnique({ where: {...} })` | Ek specific row fetch karna |
| **Update** | `prisma.model.update({ where: {...}, data: {...} })` | Kisi row ko update karna |
| **Delete** | `prisma.model.delete({ where: {...} })` | Kisi row ko delete karna |

### Client-side Post Manager (PostManager.tsx)

Client component `useTransition` use karta hai taaki server action chalte waqt UI freeze na ho:

```tsx
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  createPost,
  getAllPost,
  updatePost,
  deletePostById,
} from "@/actions/post-action";

export default function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPending, startTransition] = useTransition();
  // ... states

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await getAllPost();
    setPosts(data as Post[]);
    setLoading(false);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("content", content.trim());

    startTransition(async () => {
      if (editingId) {
        await updatePost(editingId, formData); // UPDATE
      } else {
        await createPost(formData);             // CREATE
      }
      resetForm();
      await loadPosts();                        // READ again
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePostById(id);                 // DELETE
      await loadPosts();
    });
  }
  // ... JSX
}
```

### Home Page (User Form)

```tsx
// app/page.tsx
import { createUser, getAllUser } from "@/actions/action";

export default async function Home() {
  const data = await getAllUser(); // READ — Server Component
  console.log(data);

  return (
    <div>
      <h1>Create User</h1>
      <form action={createUser}> {/* Server Action directly on form */}
        <input type="text" name="name" placeholder="Enter Name." required />
        <input type="email" name="email" placeholder="Enter Your Email" required />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
```

---

## 10. 📊 Diagram Explanations (ASCII Diagrams)

### A. Request Flow (Client → Server → Database)

```text
CLIENT (Browser)                    NEXT.JS SERVER                    DATABASE (Neon Postgres)
----------                          -----------------               --------------------------
1. Form Submit                      2. Server Action runs             4. SQL Query
   (useTransition)                  ("use server")                   (SELECT / INSERT / etc)
   ------------> ------------------> -----------------------------> ------------
   8. UI updates                    7. Returns data                  6. Returns rows
   <-------------------------------- ----------------------------- <------------
                                        3. Prisma Client builds SQL
                                          (type-safe, auto-generated)
```

### B. Architecture Layer

```text
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (React Client Components — PostManager.tsx)       │
├─────────────────────────────────────────────────────────────┤
│  Action Layer (Next.js Server Actions — post-action.ts)     │
├─────────────────────────────────────────────────────────────┤
│  ORM Layer (Prisma Client — @prisma/client)                 │
├─────────────────────────────────────────────────────────────┤
│  Adapter Layer (@prisma/adapter-pg — connection pooling)    │
├─────────────────────────────────────────────────────────────┤
│  Database Layer (PostgreSQL on Neon)                        │
└─────────────────────────────────────────────────────────────┘
```

### C. User ↔ Post Relation (Agar tum future mein jodna chaho)

```text
USER                          POST
-----                         -----
id                            id
email                         title
name                          content
                              authorId ────────┐
createdAt                     ┌────────────────┘
updatedAt                     |
                              1 User ──< Many >── Post
                              (one-to-many)
```

Prisma mein iske liye `Post` model mein ye add karo:

```prisma
model User {
  id    String   @id @default(cuid())
  name  String
  posts Post[]   // relation
}

model Post {
  id       String   @id @default(cuid())
  title    String
  author   User     @relation(fields: [authorId], references: [id])
  authorId String
}
```

---

## 11. 🌍 Real-Life Usages (Prisma kahan use hota hai production mein?)

Prisma sirf learning ke liye nahi, real companies bhi use karti hain:

| Use Case | Example | Prisma ka fayda |
|----------|---------|-----------------|
| **E-commerce** | Products, Orders, Users | Type-safe orders, relations (User → Order → Product) |
| **SaaS Dashboard** | Projects, Team Members, Tasks | Fast CRUD, migrations for feature rollout |
| **Blog/CMS** | Posts, Categories, Comments | `findMany` with `include` for nested data |
| **Social Media** | Users, Posts, Likes, Follows | Complex relations handle karna aasaan |
| **Admin Panel** | Users manage, Reports | Server Actions + Prisma = tezi se development |

### Production Tips:
1. **Connection Pooling:** Production mein hamesha `@prisma/adapter-pg` ya PgBouncer use karo (specially serverless mein).
2. **Environment Variables:** `DATABASE_URL` kabhi git mein commit mat karo (`.gitignore` mein `.env` rakho).
3. **Migrations:** Production deploy karne se pehle `npx prisma migrate deploy` chalao.
4. **Caching:** Read-heavy data ke liye `"use cache"` ya ISR/Revalidate use karo.
5. **Error Handling:** Prisma queries ko `try/catch` mein wrap karo — DB down hone par app crash na ho.

---

## 12. 🚀 Setup & Installation

### Step 1: Clone the repo

```bash
git clone https://github.com/neerajgir/master-frontend.git
cd master-frontend/Nextjs/10-prisma-orm-intigretion
```

### Step 2: Install dependencies

```bash
bun install
# ya
npm install
```

### Step 3: Environment Variables

`.env` file banakar apna Neon/PostgreSQL URL daalo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
```

- `DATABASE_URL` — Pooler URL (serverless apps ke liye, adapter-pg use karta hai)
- `DIRECT_URL` — Direct DB URL (migrations ke liye)

> ⚠️ Apne credentials mat share karna! `.env` ko `.gitignore` mein daal do.

### Step 4: Generate Prisma Client

```bash
bunx prisma generate
# ya
npx prisma generate
```

Ye `prisma/schema.prisma` se TypeScript types banayega.

### Step 5: Push/Create Database Tables

Pehli baar table create karne ke liye:

```bash
bunx prisma db push
```

Ya migration banaane ke liye:

```bash
bunx prisma migrate dev --name init
```

### Step 6: Run the dev server

```bash
bun dev
# ya
npm run dev
```

Phir browser mein kholo: `http://localhost:3000`

---

## 13. 🧰 Prisma Commands Cheatsheet

| Command | Kaam |
|---------|------|
| `prisma generate` | Schema se TypeScript client generate karna |
| `prisma db push` | Schema ko directly DB mein push karna (dev ke liye) |
| `prisma migrate dev` | Migration create aur apply karna |
| `prisma migrate deploy` | Production mein migrations apply karna |
| `prisma studio` | DB ka GUI open karna (browser mein data dekhna) |
| `prisma validate` | Schema validate karna |

```bash
# DB dekho visual mein
bunx prisma studio
```

---

## 14. ⚠️ Common Pitfalls & Best Practices

1. **PrismaClient ek baar banao:** `lib/db.ts` mein singleton rakho. Har page mein naya `new PrismaClient()` mat banao.
2. **`"use server"` mat bhoolna:** Server Actions ke liye file ke top mein `"use server"` hona chahiye.
3. **FormData types:** `formData.get()` returns `FormDataEntryValue | null`, isliye `as string` cast karna padta hai.
4. **`.env` commit mat karna:** DB credentials leak ho jayenge.
5. **Relation add karte waqt:** `@relation` fields dono models mein consistent hone chahiye.
6. **`cuid()` vs `uuid()`:** Prisma 7 default `cuid()` deta hai — ye URL-safe aur sortable hota hai.

---

## 15. 🤝 Contributing

Ye ek **learning repo** hai. Agar tum kuch naya seekhte ho ya improve karte ho, toh:

1. Fork karo
2. Naya branch banao (`git checkout -b feature/your-feature`)
3. Changes karo aur commit karo (`git commit -m "feat: ..."`)
4. Push karo (`git push origin feature/your-feature`)
5. Pull Request kholo

---

## 16. 📄 License

MIT License — seekho, share karo, aur improve karo.

---

## 🙋‍♂️ Author

Made with ❤️ for learning **Next.js + Prisma ORM**.

Agar ye repo helpful laga, toh ⭐ star zoraro dena!

---

*Shubhkamnayein — Happy Coding! 🚀*
