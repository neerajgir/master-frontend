# 🗄️ Next.js + Drizzle ORM — Learning Repository

> Hinglish guide: ORM kya hai, Drizzle kaise kaam karta hai, diagram-explanation, aur real-life usages — sab ek jagah.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-161616?style=for-the-badge)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

## 1. 📖 Kya hai ye repo? (Intro)

Ye repo **Next.js App Router** aur **Drizzle ORM** ko use karke ek chhota par **complete CRUD application** banane ka tutorial hai. Isme hum:

- Users create, read, update, aur delete karte hain (`/`)
- Drizzle ORM setup karte hain PostgreSQL (Neon) ke saath
- Next.js **Server Actions** use karke database queries server-side chalaate hain
- Drizzle Kit se migrations manage karte hain
- Type-safe schema definition TypeScript mein karte hain (alag schema file nahi chahiye)

Agar tum Naya ho database aur ORM ke liye, toh ye repo tumhari **seekhne ki shuruaat** ke liye best hai.

---

## 2. 🛠 Tech Stack

| Layer | Technology | Kyun use kiya |
|-------|------------|---------------|
| Framework | Next.js 16 (App Router) | Server Components, Server Actions, routing |
| ORM | Drizzle ORM | Type-safe, SQL-like query builder, lightweight |
| Database | PostgreSQL (Neon) | Serverless-friendly relational DB |
| SQL Client | `@neondatabase/serverless` | Neon serverless connection |
| Drizzle Dialect | `drizzle-orm/neon-http` | Neon HTTP-specific Drizzle client |
| Migrations | Drizzle Kit | SQL migrations generate karna |
| Styling | Tailwind CSS v4 | Fast, utility-first CSS |
| Language | TypeScript | Type safety across app |
| Package Manager | Bun | Fast installs |

---

## 3. 📁 Folder Structure

```text
11-drizzle-orm-intigretion/
├── drizzle/
│   ├── drizzle.config.ts         # Drizzle Kit config
│   └── 0000_white_talon.sql      # Generated migration SQL
├── lib/
│   └── db/
│       ├── index.ts              # Drizzle client instance (db)
│       └── schema.ts             # TypeScript schema (users table)
├── actions/
│   └── user-actions.ts           # Server Actions: CRUD for users
├── app/
│   ├── page.tsx                  # Home page (Next.js default)
│   └── layout.tsx                # Root layout (Geist fonts)
├── .env                          # DATABASE_URL (Neon)
├── package.json
└── README.md
```

---

## 4. 🧠 ORM kya hai? (Deep Knowledge)

**ORM = Object Relational Mapper.**

### Simple words mein (Hinglish):
Jab tum koi database (jaise PostgreSQL, MySQL) use karte ho, toh tumhe **SQL** likhna padta hai:

```sql
INSERT INTO users (email, password, created_at) VALUES ('rahul@example.com', 'pass123', NOW());
SELECT * FROM users WHERE id = 1;
```

Lekin tumhari application code (JavaScript/TypeScript) mein **objects** hote hain, na ki SQL rows. ORM ek "bridge" ka kaam karta hai jo:

1. Tumhare JS/TS objects ko SQL mein convert karta hai
2. Database se aaye SQL results ko wapas JS objects mein badal deta hai

### ORM ke fayde (Pros):
- ✅ **Type safety** — TypeScript se pata chalta hai ki kaunsa field kahan hai
- ✅ **SQL injection se bachav** — Params automatically escape hote hain
- ✅ **Migrations** — Schema change karne ke liye raw SQL likhne ki zaroorat kam hoti hai
- ✅ **Portable** — Ek database se dusri par switch karna aasaan ho jata hai

### ORM ke nuksan (Cons):
- ⚠️ Thoda overhead ho sakta hai complex queries ke liye
- ⚠️ Kabhi-kabhi raw SQL zyada fast aur flexible hota hai

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---

## 5. 💧 Drizzle ORM kya hai?

**Drizzle** ek modern, lightweight, aur TypeScript-first ORM hai Node.js aur TypeScript ke liye. Iska sabse bada plus point ye hai ki ye **schema-first** lekin **TypeScript mein** likhta hai — tumhe koi alag `.prisma` ya `.schema` file nahi banani padti, tum seedhe TypeScript mein table define karte ho.

### Drizzle ki khasiyat:
- ✅ **SQL-like API** — Queries likhna SQL jaisa lagta hai (`.select()`, `.insert()`, `.update()`, `.delete()`)
- ✅ **Type-safe** — Tumhare schema se types automatically derive hote hain
- ✅ **No runtime overhead** — Drizzle bahut fast hai kyunki ye bahut thin layer hai SQL ke upar
- ✅ **Migrations via Drizzle Kit** — SQL files generate hoti hain jo tum review kar sakte ho
- ✅ **Relational aur document-style** — PostgreSQL, MySQL, SQLite dono support karta hai

### Drizzle vs Prisma (short comparison):

| Point | Prisma | Drizzle |
|-------|--------|---------|
| Schema language | Apna `.prisma` schema | TypeScript (`pgTable`, `mysqlTable`, etc.) |
| Query style | Prisma Client methods | SQL-like builder (chaining) |
| Migrations | Prisma Migrate | Drizzle Kit (raw SQL files) |
| Bundle size | Thoda zyada | Bahut light |
| Control | Abstracted | Zyada SQL control milta hai |

---

## 6. 📝 Drizzle Schema (lib/db/schema.ts)

Drizzle mein tum schema **TypeScript mein** likhte ho. Ye hai repo ka core file:

```ts
// lib/db/schema.ts
import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
});
```

### Diagram Explanation — Users Table:

```text
TABLE: users
-----------
Column        | Type          | Modifiers
--------------|---------------|------------------------------------------
id            | serial        | PRIMARY KEY, auto-increment
email         | varchar(255)  | NOT NULL, UNIQUE
password      | varchar(255)  | NOT NULL   (column stored as "name")
created_at    | timestamp     | DEFAULT now(), NOT NULL
updated_at    | timestamp     | DEFAULT now(), NOT NULL
is_active     | boolean       | DEFAULT true, NOT NULL
```

### Drizzle Column Builders kya kaam karte hain?

| Builder | Arth (Hinglish) |
|---------|-----------------|
| `serial("id")` | Auto-increment integer primary key |
| `varchar("email", {length: 255})` | Variable-length string, max 255 chars |
| `timestamp("created_at")` | Date/time column |
| `boolean("is_active")` | True/false column |
| `.primaryKey()` | Row ko uniquely identify karta hai |
| `.notNull()` | Column mein null value allow nahi hoti |
| `.unique()` | Duplicate values allow nahi hoti (jaise email) |
| `.defaultNow()` | Current timestamp automatically set ho jati hai |
| `.default(true)` | Default value true set ho jati hai |

---

## 7. 🔌 Drizzle Client kaise setup karein (lib/db/index.ts)

Drizzle ka client banane ke liye hum Neon serverless ka use karte hain:

```ts
// lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
});

export { schema };
```

### Kyun `drizzle-orm/neon-http`?

Kyun ki hum **Neon (serverless PostgreSQL)** use kar rahe hain. Neon serverless functions mein har request ek nayi connection khol sakti hai, jo database connections khatam kar degi. `neon-http` HTTP ke zariye Neon se connect hota hai jo serverless environment ke liye design kiya gaya hai.

### Flow samjho:

```text
DATABASE_URL (.env)
      |
      v
neon(DATABASE_URL)  -->  SQL client (Neon serverless)
      |
      v
drizzle({ client: sql })  -->  Drizzle ORM instance (db)
      |
      v
db.insert(users).values({...})  -->  SQL query execute hota hai
```

> ⚠️ Note: `process.env.DATABASE_URL!` — exclamation mark TypeScript ko kehta hai ki ye value definitely hogi (non-null assertion).

---

## 8. ⚡ Server Actions + Drizzle ORM

Next.js mein **"use server"** function ko **Server Action** kehte hain. Ye server par chalte hain, client par nahi. Client se data submit hone par directly server action call hota hai — alag API route banane ki zaroorat nahi.

### actions/user-actions.ts (User CRUD)

```ts
"use server";

import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { use } from "react";  // (imported but not used in current code)

interface UserData {
    email: string;
    password: string;
}

// CREATE
export async function createUser(data: UserData) {
    await db.insert(users).values({
        email: data.email,
        password: data.password,
    });
}

// READ (all)
export async function getUser() {
    return await db.select().from(users);
}

// READ (one by id)
export async function userById(id: number) {
    return await db.select().from(users).where(eq(users.id, id));
}

// UPDATE
export async function updateUser(id: number, data: { email?: string }) {
    await db.update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id));
}

// DELETE
export async function deleteUser(id: number) {
    await db.delete(users).where(eq(users.id, id));
}
```

### Drizzle Query Methods cheatsheet:

| Operation | Drizzle Code | Kaam |
|-----------|--------------|------|
| **Create** | `db.insert(users).values({...})` | Nayi row insert karna |
| **Read (All)** | `db.select().from(users)` | Sabhi rows fetch karna |
| **Read (One)** | `db.select().from(users).where(eq(users.id, id))` | Ek specific row fetch karna |
| **Update** | `db.update(users).set({...}).where(eq(...))` | Kisi row ko update karna |
| **Delete** | `db.delete(users).where(eq(...))` | Kisi row ko delete karna |

### `eq()` kya hai?
`eq` Drizzle ka comparison operator hai jo `WHERE column = value` generate karta hai. Iska use `where()` clause mein kiya jata hai.

---

## 9. 📊 Diagram Explanations (ASCII Diagrams)

### A. Request Flow (Client → Server → Database)

```text
CLIENT (Browser)                    NEXT.JS SERVER                    DATABASE (Neon Postgres)
----------                          -----------------               --------------------------
1. Form Submit                      2. Server Action runs             4. SQL Query
   (form action)                    ("use server")                    (SELECT / INSERT / etc)
   ------------> ------------------> -----------------------------> ------------
   8. UI updates                    7. Returns data                   6. Returns rows
   <-------------------------------- ----------------------------- <------------
                                        3. Drizzle builds SQL
                                          (type-safe, auto-generated)
```

### B. Architecture Layer

```text
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (React Components — app/page.tsx)                 │
├─────────────────────────────────────────────────────────────┤
│  Action Layer (Next.js Server Actions — user-actions.ts)    │
├─────────────────────────────────────────────────────────────┤
│  ORM Layer (Drizzle ORM — drizzle-orm)                      │
├─────────────────────────────────────────────────────────────┤
│  Client Layer (@neondatabase/serverless — neon HTTP client) │
├─────────────────────────────────────────────────────────────┤
│  Database Layer (PostgreSQL on Neon)                        │
└─────────────────────────────────────────────────────────────┘
```

### C. Users Table Relationship (Future scope)

Abhi repo mein sirf `users` table hai. Agar tum future mein `posts` table jodna chaho:

```text
USERS                          POSTS
------                         -----
id                             id
email                          title
password                       content
created_at                     userId ────────┐
updated_at                     ┌───────────────┘
is_active                      |
                               1 User ──< Many >── Post
                               (one-to-many)
```

Drizzle mein iske liye `posts` schema mein ye add karo:

```ts
export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    userId: integer("user_id").references(() => users.id),  // foreign key
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## 10. 🌍 Real-Life Usages (Drizzle kahan use hota hai production mein?)

Drizzle sirf learning ke liye nahi, real companies bhi use karti hain:

| Use Case | Example | Drizzle ka fayda |
|----------|---------|-----------------|
| **E-commerce** | Products, Orders, Users | Type-safe orders, fast queries, relations |
| **SaaS Dashboard** | Projects, Team Members, Tasks | Lightweight, fast CRUD, SQL control |
| **Blog/CMS** | Posts, Categories, Comments | SQL-like API for nested/filtered data |
| **Social Media** | Users, Posts, Likes, Follows | Complex relations handle karna aasaan |
| **Admin Panel** | Users manage, Reports | Server Actions + Drizzle = tezi se development |

### Production Tips:
1. **Environment Variables:** `DATABASE_URL` kabhi git mein commit mat karo (`.gitignore` mein `.env` rakho).
2. **Migrations:** Deploy karne se pehle `npx drizzle-kit migrate` chalao ya SQL manually apply karo.
3. **Connection:** Neon serverless ke liye `drizzle-orm/neon-http` use karo taaki connection issues na aayein.
4. **Error Handling:** Drizzle queries ko `try/catch` mein wrap karo — DB down hone par app crash na ho.
5. **Schema changes:** Schema change karne ke baad `npx drizzle-kit generate` se naya SQL migration generate karo.

---

## 11. 🚀 Setup & Installation

### Step 1: Clone the repo

```bash
git clone https://github.com/neerajgir/master-frontend.git
cd master-frontend/Nextjs/11-drizzle-orm-intigretion
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
DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require&channel_binding=require'
```

> ⚠️ Apne credentials mat share karna! `.env` ko `.gitignore` mein daal do.

### Step 4: Generate Drizzle Client & Migrations

Schema se TypeScript types generate karne ke liye:

```bash
bunx drizzle-kit generate
# ya
npx drizzle-kit generate
```

Ye `lib/db/schema.ts` se SQL migration generate karega (`drizzle/` folder mein).

Database mein tables apply karne ke liye:

```bash
bunx drizzle-kit migrate
# ya
npx drizzle-kit migrate
```

### Step 5: Run the dev server

```bash
bun dev
# ya
npm run dev
```

Phir browser mein kholo: `http://localhost:3000`

---

## 12. 🧰 Drizzle Commands Cheatsheet

| Command | Kaam |
|---------|------|
| `drizzle-kit generate` | Schema se SQL migration generate karna |
| `drizzle-kit migrate` | Migration ko database mein apply karna |
| `drizzle-kit introspect` | Existing database se schema nikalna |
| `drizzle-kit check` | Schema validate karna |

```bash
# Naya migration generate karo
bunx drizzle-kit generate

# Migration database mein apply karo
bunx drizzle-kit migrate
```

> 💡 Tip: Drizzle ka koi alag "studio" GUI nahi hota Prisma ki tarah, lekin tum Neon console ya pgAdmin mein data dekh sakte ho.

---

## 13. ⚠️ Common Pitfalls & Best Practices

1. **`DATABASE_URL` mat leak karo:** `.env` kabhi git mein commit mat karo. `.gitignore` mein `.env` add karo.
2. **`"use server"` mat bhoolna:** Server Actions ke liye file ke top mein `"use server"` hona chahiye.
3. **Type assertions:** `process.env.DATABASE_URL!` — exclamation mark use kiya hai kyunki `.env` mein value hogi, lekin production mein check kar lo ki value present hai.
4. **Foreign keys:** Agar relation add karo toh `references(() => users.id)` mein callback function use karo (Drizzle ki requirement hai circular imports bachane ke liye).
5. **`eq()` import mat bhoolna:** `where()` clause mein `eq(users.id, id)` use karna zaroori hai — direct `users.id == id` kaam nahi karega.
6. **Migrations review karo:** `drizzle-kit generate` se jo SQL file banti hai, use database mein apply karne se pehle review kar lo.

---

## 14. 🤝 Contributing

Ye ek **learning repo** hai. Agar tum kuch naya seekhte ho ya improve karte ho, toh:

1. Fork karo
2. Naya branch banao (`git checkout -b feature/your-feature`)
3. Changes karo aur commit karo (`git commit -m "feat: ..."`)
4. Push karo (`git push origin feature/your-feature`)
5. Pull Request kholo

---

## 15. 📄 License

MIT License — seekho, share karo, aur improve karo.

---

## 🙋‍♂️ Author

Made with ❤️ for learning **Next.js + Drizzle ORM**.

Agar ye repo helpful laga, toh ⭐ star zoraro dena!

---

*Shubhkamnayein — Happy Coding! 🚀*
