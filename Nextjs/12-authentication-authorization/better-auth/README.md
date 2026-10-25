# 🔐 Next.js 16 + Better Auth — Authentication & Authorization (Hinglish Guide)

Ye repo ek **learning project** hai jo dikhata hai ki Next.js 16 (App Router) aur [Better Auth v1.7](https://better-auth.com) ka use karke secure authentication aur authorization kaise implement kiya jata hai. Isme Prisma ORM (PostgreSQL), GitHub & Google OAuth, session-based route protection, aur sign-out flow shamil hai.

---

## 📋 Table of Contents

1. [Introduction — Authentication vs Authorization](#-introduction---authentication-vs-authorization)
2. [Project Structure](#-project-structure)
3. [Setup — Better Auth + DATABASE_URL + OAuth Secrets](#-setup---better-auth--databaseurl--oauth-secrets)
4. [Auth Configuration (`lib/auth.ts`)](#-auth-configuration-libauth-ts)
5. [Auth Client (`lib/auth-client.ts`)](#-auth-client-libauth-client-ts)
6. [Route Protection — Security Middleware](#-route-protection---security-middleware)
7. [Sessions & Sign-Out Flow](#-sessions--sign-out-flow)
8. [Login & Signup Pages](#-login--signup-pages)
9. [Protected Dashboard](#-protected-dashboard)
10. [Real-Life Usages](#-real-life-usages)
11. [Running the Project](#-running-the-project)
12. [Troubleshooting](#-troubleshooting)

---

## 1. Introduction — Authentication vs Authorization

### Authentication (AuthN) — "Kaun ho tum?"
Authentication yeh verify karta hai ki user wo hai jo dawa kar raha hai. Example: Email/password login, Google Sign-in, GitHub login.

```
User -----> Login Form -----> Better Auth -----> Session Cookie -----> Browser
```

### Authorization (AuthZ) — "Tum kya kar sakte ho?"
Authorization yeh decide karta hai ki authenticate hone ke baad user kiske paas ja sakta hai aur kya kar sakta hai. Example: Sirf logged-in users `/dashboard` dekh sakte hain, admin sirf `/admin` access kar sakta hai.

| Concept | Authentication | Authorization |
|---------|---------------|---------------|
| **Hindi Arth** | Pehchaan (Identity) | Adhikar (Permission) |
| **Question** | "Tum kaun ho?" | "Tum kya access kar sakte ho?" |
| **Example** | Login with Google | Sirf admin delete post kar sakta hai |
| **Timing** | Pehle hota hai | Baad mein hota hai |

---

## 2. Project Structure

```
12-authentication-authorization/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── api/auth/[...all]/route.ts
│   ├── dashboard/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── middleware.ts
├── components/
│   ├── login-form.tsx
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── auth-guard.ts
│   └── db.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── middleware.ts
└── package.json
```

---

## 3. Setup — Better Auth + DATABASE_URL + OAuth Secrets

Sabse pehle `.env` file banayein root directory mein:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=AggfeNx6fFeKflezvLqIcHR5vjehLSHt
BETTER_AUTH_URL=http://localhost:3000

# Database (PostgreSQL - Neon)
DATABASE_URL='postgresql://neondb_owner:password@ep-xxx.pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'

# GitHub OAuth
GITHUB_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GITHUB_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"

# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
```

### Environment Variables Explain (Hinglish):

| Variable | Kya hai? | Kya kaam aata hai? |
|----------|----------|-------------------|
| `BETTER_AUTH_SECRET` | Random string (32+ chars) | Session encryption aur signing ke liye use hota hai. `openssl rand -base64 32` se generate kar sakte ho. |
| `BETTER_AUTH_URL` | App ka base URL | Better Auth ko redirect URLs banane ke liye chahiye hota hai (OAuth callbacks). |
| `DATABASE_URL` | PostgreSQL connection string | Prisma ke through DB connect hota hai. Users, sessions, accounts store karne ke liye. |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth App credentials | GitHub se "Sign in with GitHub" enable karne ke liye. |
| `GOOGLE_CLIENT_ID/SECRET` | Google Cloud Console credentials | Google se "Sign in with Google" enable karne ke liye. |

---

## 4. Auth Configuration (`lib/auth.ts`)

Yahan Better Auth initialize hota hai with Prisma adapter aur social providers.

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
    },

---

## 5. Auth Client (`lib/auth-client.ts`)

Client-side operations (login, signup, signOut) ke liye:

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000"
})
```

**Client-side methods available:**
- `authClient.signIn.email({ email, password })` — Email/password sign in
- `authClient.signUp.email({ name, email, password })` — Create new account
- `authClient.signIn.social({ provider: "github" | "google" })` — OAuth sign in
- `authClient.signOut()` — Sign out user
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },

---

## 6. Route Protection — Security Middleware

### Server-Side Guards (`lib/auth-guard.ts`):

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }
    return session;
}

export async function requireUnAuth() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        redirect("/");
    }
    return session;
}
```

### Next.js Middleware (`middleware.ts`):


---

## 7. Sessions & Sign-Out Flow

### Session Lifecycle:

```
1. User Login (Email/Password or OAuth)
        │
        ▼
2. Better Auth verify karta credentials
        │
        ▼
3. Session create hota hai DB mein (Session table)
        │
        ▼
4. Encrypted session cookie set hota hai browser mein
        │
        ▼
5. Agle requests par cookie se session verify hota hai
        │
        ▼
6. User Sign Out ──► Session delete (DB + cookie clear)
```

### Sign-Out Implementation:

```typescript
// Client component mein:
"use client"
import { authClient } from "@/lib/auth-client"

function LogoutButton() {
  async function handleLogout() {
    await authClient.signOut()
    window.location.href = "/login"
  }

  return <button onClick={handleLogout}>Sign Out</button>
}
```

### Session Data Structure:

```typescript
{
  user: {
    id: "user_123",
    name: "John Doe",
    email: "john@example.com",

---

## 8. Login & Signup Pages

### Login Form (`components/login-form.tsx`):

Ye `"use client"` component hai jo `react-hook-form` aur `authClient.signIn.email` use karta hai:

```typescript
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { authClient } from "@/lib/auth-client"

export function LoginForm() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()

  async function handleSubmit(values) {
    try {
      await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSocialSignIn(provider: "github" | "google") {
    await authClient.signIn.social({ provider })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input {...form.register("email")} placeholder="Email" />
      <input {...form.register("password")} type="password" placeholder="Password" />
      <button type="submit" disabled={isLoading}>Login</button>

      <button onClick={() => handleSocialSignIn("github")}>
        Continue with GitHub
      </button>
      <button onClick={() => handleSocialSignIn("google")}>
        Continue with Google
      </button>
    </form>
  )

---

## 9. Protected Dashboard (`app/dashboard/page.tsx`)

Sirf authenticate users access kar sakte hain:

```typescript
import { requireAuth } from "@/lib/auth-guard"
import Image from "next/image"

export default async function DashboardPage() {
  const session = await requireAuth()
  const { user } = session

  return (
    <div className="text-center p-8">
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {user.image && <Image src={user.image} alt="Avatar" width={80} height={80} />}
    </div>
  )
}
```

---

## 10. Real-Life Usages

Ye project real-world mein iske liye use ho sakta hai:

| Use Case | Kaise Implement Karein |
|----------|----------------------|
| **E-commerce Website** | Customer login, order history, admin panel (`role: "admin"`) |
| **SaaS Application** | Multi-tenant auth, subscription-based access |
| **Blog/CMS** | Author login, post publish rights, comment system |
| **Dashboard/Analytics** | Sirf logged-in users data dekh sakein |
| **Team Collaboration** | Role-based access (owner, member, viewer) |

### Role-Based Authorization Example:

```typescript
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "admin") {
    redirect("/unauthorized")
  }
  return session
}
```

### Production Checklist:

1. ✅ `BETTER_AUTH_SECRET` strong ho (production mein env se load karein)
2. ✅ `BETTER_AUTH_URL` production domain par set ho (localhost nahi)
3. ✅ `DATABASE_URL` secure connection string ho (SSL enable)
4. ✅ OAuth secrets code mein hardcode na karein — `.env` mein rakhein
5. ✅ HTTPS use karein production mein (secure cookies ke liye)
6. ✅ Rate limiting enable karein Better Auth plugins se
7. ✅ Email verification enable karein (`requireEmailVerification: true`)

---

## 11. Running the Project

```bash
# Dependencies install karein
bun install

# Prisma generate karein
bunx prisma generate

# Database push karein (schema sync)
bunx prisma db push --accept-data-loss

# Dev server start karein
bun dev
```

Ab browser mein kholein: `http://localhost:3000`

---

## 12. Troubleshooting

| Problem | Solution |
|---------|----------|
| `Prisma schema mismatch: Missing columns user.role` | `bunx prisma db push` chalayein |
| `GET /api/auth/error?error=internal_server_error` | Check `.env` variables, specially `BETTER_AUTH_SECRET` aur `DATABASE_URL` |
| OAuth redirect mismatch | `BETTER_AUTH_URL` sahi ho aur GitHub/Google console mein callback URL add ho |
| Session expire ho raha hai | `betterAuth` config mein session expiry check karein |

---

## 🤝 Contributing

Ye ek learning repo hai. Agar koi naya feature add karna hai (like: 2FA, password reset, role management), toh PR kholein.

---

**Made with ❤️ for learning Next.js + Better Auth**

*Authenticate securely, authorize wisely. 🔐*
}
```

### Signup Page (`app/(auth)/signup/page.tsx`):

Naye users ke liye account creation:

```typescript
"use client"
import { authClient } from "@/lib/auth-client"
import { useForm } from "react-hook-form"

export default function SignupPage() {
  const form = useForm()

  async function handleSubmit(values) {
    await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input {...form.register("name")} placeholder="Full Name" />
      <input {...form.register("email")} type="email" placeholder="Email" />
      <input {...form.register("password")} type="password" placeholder="Password" />
      <button type="submit">Sign up</button>
    </form>
  )
}
```

    image: "https://...",
    role: "user",
    emailVerified: true
  },
  session: {
    id: "session_abc",
    expiresAt: "2026-10-27T...",
    token: "encrypted_token"
  }
}
```

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/account/:path*"],
};
```

### Middleware Flow Diagram:

```
Request ko /dashboard
        │
        ▼
┌─────────────────┐
│ middleware.ts   │──► Session check karta hai
└─────────────────┘
        │
    ┌───┴───┐
   Yes     No
  Session   No Session
  exists?    │
   │         ▼
   ▼   ┌─────────────────┐
NextResponse.next()  NextResponse.redirect("/login")
   │
   ▼
Dashboard render hota hai
```
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: false,
            },
        },
    },
});
```

### Deep Knowledge:

- **`prismaAdapter`**: Better Auth ko Prisma se connect karta hai taaki users, sessions, accounts, aur verification tables automatically manage ho sakein.
- **`secret`**: Ye bahut important hai. Isse session cookies encrypt kiye jate hain. Production mein strong secret use karein.
- **`baseURL`**: OAuth callbacks (GitHub/Google redirect) ke liye zaroori hai. Bina iske social login kaam nahi karega.
- **`emailAndPassword.enabled: true`**: Email/password login enable karta hai. Default `false` hota hai.
- **`user.additionalFields.role`**: Custom field jisse hum role-based authorization (RBAC) implement kar sakte hain (admin, user, moderator, etc.)
