# 🔐 Next.js 16 + Clerk — Authentication & Authorization (Hinglish Guide)

Ye repo ek **learning project** hai jo dikhata hai ki Next.js 16 (App Router) aur [Clerk](https://clerk.com) ka use karke secure authentication aur authorization kaise implement kiya jata hai. Isme ClerkProvider, sign-in/sign-up pages, UserButton, aur middleware-based route protection shamil hai.

## 📋 Table of Contents

1. [Introduction — Authentication vs Authorization](#-introduction---authentication-vs-authorization)

2. [Project Structure](#-project-structure)
3. [Configure Clerk — Environment Variables & Setup](#-configure-clerk---environment-variables--setup)

4. [ClerkProvider Setup (`app/layout.tsx`)](#-clerkprovider-setup-applayout-tsx)

5. [Clerk Middleware (`proxy.ts`)](#-clerk-middleware-proxy-ts)

6. [Sign-In & Sign-Up Pages](#-sign-in--sign-up-pages)

7. [Protected Routes & Authorization](#-protected-routes--authorization)

8. [User Session & UserButton](#-user-session--userbutton)

9. [Authentication Flow Diagram](#-authentication-flow-diagram)
10. [Authorization Flow Diagram](#-authorization-flow-diagram)

11. [Real-Life Usages](#-real-life-usages)

12. [Running the Project](#-running-the-project)

13. [Troubleshooting](#-troubleshooting)

---
## 1. Introduction — Authentication vs Authorization

### Authentication (AuthN) — "Kaun ho tum?"
Authentication yeh verify karta hai ki user wo hai jo dawa kar raha hai. Clerk mein yeh email/password, social login (Google, GitHub), phone OTP, etc. ke through hota hai.

```
User -----> Clerk Sign-In -----> Clerk verify karta credentials -----> Session set hota hai -----> Browser
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
clerk/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx           # Auth layout (centered sign-in/sign-up)
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/  # Clerk sign-in page
│   │   └── sign-up/
│   │       └── [[...sign-up]]/  # Clerk sign-up page
│   ├── page.tsx                 # Home page with UserButton
│   ├── layout.tsx               # Root layout with ClerkProvider
│   └── globals.css
├── proxy.ts                     # Clerk middleware for route protection
├── .env                         # Clerk keys
├── package.json
└── next.config.ts
```
## 3. Configure Clerk — Environment Variables & Setup

### `.env` file

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### Variable Explain Table

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (client-side) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side) |

### Clerk Dashboard Setup
1. [Clerk Dashboard](https://dashboard.clerk.com) pe account create karein
2. New application create karein
3. API keys copy karein aur `.env` mein paste karein
4. Social providers (Google, GitHub) configure karein

---

## 4. ClerkProvider Setup (`app/layout.tsx`)

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
```

### Deep Knowledge
- **`ClerkProvider`**: Clerk context provide karta hai poore app mein, jisse authentication state access ho sake
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**: Ye env var client-side pe available hota hai (NEXT_PUBLIC_ prefix ke bina)
- **Session management**: Clerk automatically session manage karta hai, cookies set karta hai

---

## 5. Clerk Middleware (`proxy.ts`)

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
};
```

### Deep Knowledge
- **`clerkMiddleware()`**: Ye Clerk ka middleware hai jo request pe session check karta hai
- **`matcher`**: Ye batata hai kaunse routes pe middleware run hoga
- **Route protection**: Middleware automatically protected routes pe auth check karta hai

---

## 6. Sign-In & Sign-Up Pages

### Sign-In Page

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

### Sign-Up Page

```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

### Deep Knowledge
- **Catch-all route**: `[...sign-in]` catch-all route hai jo Clerk ke internal routing handle karta hai
- **Clerk components**: `SignIn` aur `SignUp` components pre-built hain, custom UI bhi bana sakte ho

---

## 7. Protected Routes & Authorization

### Client-side protection

```tsx
import { useAuth } from "@clerk/nextjs";

export default function ProtectedPage() {
  const { isSignedIn, userId } = useAuth();
  
  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {userId}</div>;
}
```

### Server-side protection

```tsx
import { auth } from "@clerk/nextjs/server";

export default async function ServerProtectedPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return <div>Unauthorized</div>;
  }
  
  return <div>Welcome, {userId}</div>;
}
```
## 8. User Session & UserButton

### Home Page (`app/page.tsx`)

```tsx
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <UserButton />
    </div>
  );
}
```

### Deep Knowledge
- **`UserButton`**: Clerk ka pre-built component jo user avatar, sign-out, account settings dikhata hai
- **Session**: Clerk automatically session manage karta hai, cookies set karta hai
- **`useUser`**: User details access karne ke liye hook

---

## 9. Authentication Flow Diagram

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────▶│  Sign-In     │────▶│  Clerk      │────▶│  Session │
│         │     │  Page        │     │  Verify     │     │  Created │
└─────────┘     └──────────────┘     └─────────────┘     └──────────┘
                                                              │
                                                              ▼
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Browser│◀────│  Cookies     │◀────│  Set        │◀────│  Session │
│         │     │  Set         │     │  Cookies    │     │  Token   │
└─────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

### Flow Explanation
1. User sign-in page pe jata hai
2. Clerk credentials verify karta hai
3. Session create hota hai
4. Cookies set hote hain browser mein
5. User authenticated ho jata hai

---

## 10. Authorization Flow Diagram

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│ Request │────▶│  Middleware  │────▶│  Session    │────▶│  Allowed │
│         │     │  (proxy.ts)  │     │  Check      │     │  /Denied │
└─────────┘     └──────────────┘     └─────────────┘     └──────────┘
                                          │
                                          ▼
                                    ┌─────────────┐
                                    │  Redirect   │
                                    │  to Sign-In │
                                    └─────────────┘
```

### Flow Explanation
1. User protected route access karta hai
2. Middleware (proxy.ts) request intercept karta hai
3. Session check hota hai
4. Agar authenticated hai toh allow, nahi toh redirect to sign-in

---

## 11. Real-Life Usages

### 1. SaaS Application
- User authentication with Clerk
- Role-based access (admin, user, viewer)
- Subscription management

### 2. E-commerce
- Customer login/signup
- Order history protection
- Admin dashboard

### 3. Blog/CMS
- Author authentication
- Draft post protection
- Comment moderation

### 4. Dashboard Application
- Multi-tenant support
- User preferences
- Activity tracking

### Role-Based Authorization Example

```tsx
import { useUser } from "@clerk/nextjs";

export default function AdminPanel() {
  const { user } = useUser();
  
  const isAdmin = user?.publicMetadata?.role === "admin";
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Panel</div>;
}
```

### Production Checklist
- [ ] Environment variables set karein
- [ ] Social providers configure karein
- [ ] Webhooks setup karein (user events)
- [ ] Role-based access implement karein
- [ ] Error handling add karein

---

## 12. Running the Project

```bash
# Dependencies install karein
bun install

# Dev server start karein
bun dev
```

Ab browser mein kholein: `http://localhost:3000`

---

## 13. Troubleshooting

| Problem | Solution |
|---------|----------|
| `Missing publishable key` | Check `.env` file, restart dev server |
| `Invalid secret key` | Verify `CLERK_SECRET_KEY` in `.env` |
| `Middleware not working` | Check `proxy.ts` matcher config |
| `Session not persisting` | Check browser cookies, clear cache |

---

## 🤝 Contributing

Ye ek learning repo hai. Agar koi naya feature add karna hai (like: webhooks, organizations, custom UI), toh PR kholein.

---

**Made with ❤️ for learning Next.js + Clerk**

*Authenticate securely, authorize wisely. 🔐*
