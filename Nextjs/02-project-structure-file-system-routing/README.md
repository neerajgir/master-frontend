# 02 — Project Structure + File-System Routing in Next.js (App Router)

> **Hinglish me full deep-dive:** Next.js me folder hi route hai, file hi UI hai. Ye repo usi concept ko practically seekhne ke liye banaya gaya hai.

```bash
bun dev
# open -> http://localhost:3000
```

---

## 1. Intro — File-System Routing kya hai?

React (CRA / Vite) me hum khud `react-router-dom` se route define karte the:

```jsx
// React me humko khud likhna padta tha
<Route path="/about" element={<About />} />
<Route path="/user/:userId" element={<User />} />
```

**Next.js App Router me ulta hai:**

> **Folder = Route, `page.jsx` = UI**

Matlab tumhe koi config file me route register nahi karna. Tum bas `app/` ke andar folder banao, usme `page.jsx` daal do — route ready!

Is repo me yahi kiya gaya hai:

```
app/
├── layout.jsx              -> Poori app ka shared shell (Navbar + Footer)
├── page.jsx                -> / (Home)
├── about/
│   ├── page.jsx            -> /about
│   └── myself/
│       └── page.jsx        -> /about/myself (Nested Route)
├── contact/
│   └── page.jsx            -> /contact
└── user/
    ├── page.jsx            -> /user (list page)
    └── [userId]/
        └── page.jsx        -> /user/1, /user/2 ... (Dynamic Route)
```

Deep baat: Next.js build time pe ye folder tree scan karta hai aur apne aap **Route Manifest** bana deta hai. Tum `.next/dev/routes-manifest.json` me dekh sakte ho. Isiliye isko **convention over configuration** kehte hain.

---

## 2. Is Project ka Live Route Map

| URL | File | Kya render hota hai? |
|-----|------|----------------------|
| `/` | `app/page.jsx` | Hero section (Home) |
| `/about` | `app/about/page.jsx` | Testimonial / About section |
| `/about/myself` | `app/about/myself/page.jsx` | Sirf `Myself` text (Nested demo) |
| `/contact` | `app/contact/page.jsx` | Map + Feedback form |
| `/user` | `app/user/page.jsx` | 3 Cards wali list |
| `/user/101` | `app/user/[userId]/page.jsx` | `UserIdPage 101` |

Try karo browser me:

```
/ -> /about -> /about/myself
/user -> /user/5 -> /user/neeraj
```

Last wala interesting hai — `neeraj` string bhi chalega kyuki `[userId]` kuch bhi catch kar leta hai.

---

## 3. Folder-and-File Conventions (Sabse Important Topic)

Next.js kuch naam **reserve** karke rakhta hai. Jaise hi tum ye naam doge, Next.js unko special power de deta hai.

### 3.1 Special Files (Reserved Names)

```
app/
├── layout.jsx       # Shared UI (Navbar/Footer) — bina re-render ke persist karta hai
├── page.jsx         # Route ka main UI — ye nahi hoga to route 404 dega
├── loading.jsx      # Suspense fallback — data load hote time dikhta hai
├── error.jsx        # Koi crash ho to ye UI dikhta hai (Error Boundary)
├── not-found.jsx    # notFound() call pe ya galat dynamic id pe
├── route.js         # UI nahi, direct API banata hai (GET/POST handler)
├── template.jsx     # layout jaisa hi, par har navigation pe re-mount hota hai
├── default.jsx      # Parallel Routes me jab koi slot match na ho
└── globals.css      # Poori app ki global styling
```

> **Yaad rakhne ka funda:**
> `page.jsx` ke bina folder route NAHI banta. Folder sirf URL segment hai, `page.jsx` usko public karta hai.

Example — Khali folder ka koi route nahi banta:

```
app/user/profile/        -> ❌ 404 (kyuki andar page.jsx nahi hai)
app/user/profile/page.jsx -> ✅ /user/profile ban gaya
```

### 3.2 Special Folder Conventions

```bash
# 1. Dynamic Segment — single value pakadta hai
app/user/[userId]/page.jsx        -> /user/1 , /user/2

# 2. Catch-All — aage ke saare segments pakadta hai
app/docs/[...slug]/page.jsx       -> /docs/a , /docs/a/b , /docs/a/b/c

# 3. Optional Catch-All — upar wala + khaali bhi chalega
app/shop/[[...slug]]/page.jsx     -> /shop , /shop/men , /shop/men/shoes

# 4. Route Group — URL pe asar NAHI daalta, sirf organize karne ke liye
app/(auth)/login/page.jsx         -> URL: /login ( (auth) gayab! )
app/(auth)/register/page.jsx      -> URL: /register

# 5. Private Folder — routing se bilkul ignore
app/_components/Navbar.jsx        -> koi route NAHI banega

# 6. Parallel / Intercepted (advanced)
app/@modal/page.jsx               -> Parallel route slot
app/(.)photo/page.jsx             -> Intercept karke modal me dikhao
```

Is repo me `( )` aur `_` use nahi hua hai — humne `components/` ko `app/` ke **bahar** rakha hai taaki wo kabhi route na bane. Yehi best practice hai.

---

## 4. Types of Folder-Files in Next.js — Deep Knowledge

### A. `layout.jsx` — Shared Route Shell

Is project ka sabse powerful file:

```jsx
// app/layout.jsx
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Navbar />          {/* Har page pe same rahega */}
        <main className="h-screen">
          {children}        {/* Yaha /about, /contact, /user badalte rehte hain */}
        </main>
        <Footer />          {/* Har page pe same rahega */}
      </body>
    </html>
  );
}
```

**Deep knowledge:**

1. `layout.jsx` server component hota hai by default.
2. Jab tum `/` se `/about` pe jaate ho, poora page reload NAHI hota — sirf `{children}` wala hissa badalta hai. `Navbar` / `Footer` re-mount nahi hote. Isiliye navigation super-fast lagta hai.
3. Nested layout bhi ho sakta hai. Example: `app/user/layout.jsx` banao to sirf `/user/*` pages pe sidebar aa jayega, baaki pages pe nahi.

```
app/layout.jsx        -> sab pe lagta hai (Navbar + Footer)
app/user/layout.jsx   -> sirf /user aur /user/[userId] pe lagega
```

### B. `page.jsx` — Asli Route UI

```jsx
// app/about/myself/page.jsx
const Myself = () => {
  return <div>Myself</div>
}
export default Myself
```

Bas `export default` component hona chahiye. Ye Server Component hota hai, isme tum direct `async/await` + DB call bhi kar sakte ho.

### C. Dynamic `page.jsx` — `[userId]` wala magic

```jsx
// app/user/[userId]/page.jsx
const UserIdPage = async ({ params }) => {
  const { userId } = await params; // Next 15+ me params Promise hai!
  return <div>UserIdPage {userId}</div>
}
export default UserIdPage
```

**Deep knowledge — Beginner sabse zyada yahi galti karte hain:**

* Purane Next me `params.userId` direct milta tha. **Next 15/16 me `params` async hai**, isiliye `await params` karna padta hai. Tumhare repo me sahi pattern use hua hai.
* `/user/5` kholo to `userId = "5"` milega (hamesha string me milta hai!).
* Real life me yaha tum API call karoge:

```jsx
const res = await fetch(`https://api.example.com/users/${userId}`);
const user = await res.json();
```

### D. `components/` — Non-route code

```jsx
// components/Navbar.jsx
import Link from "next/link";

<Link href={"/about"} className="mr-5 hover:text-white">
  About
</Link>
```

`components/` ko `app/` ke bahar isiliye rakha taaki Next.js usko route na samjhe. Agar tum `app/Navbar/page.jsx` bana doge to `/Navbar` route ban jayega — jo humko nahi chahiye!

---

## 5. Nested Routing — `/about/myself` kaise bana?

Diagram se samjho:

```
URL:  /about/myself
       │      │
Folder: app/about/myself/page.jsx
       │      │
Matlab: app/  -> root (/)
        about/ -> /about segment
        myself/ -> /myself segment
        page.jsx -> "ab isko public kar do"
```

Code level pe koi nesting likhni nahi padti. Folder ke andar folder = URL ke andar URL.

Real-life example:

```
app/
├── dashboard/
│   ├── page.jsx              -> /dashboard
│   ├── settings/page.jsx     -> /dashboard/settings
│   └── analytics/page.jsx    -> /dashboard/analytics
```

`/dashboard/settings` khulne pe agar `app/dashboard/layout.jsx` hai to Dashboard ka sidebar bhi saath me dikhega + andar Settings ka content. Yehi **nested layout** ka power hai.

---

## 6. Dynamic Routing — `[userId]` kaise kaam karta hai?

```
Static:  app/user/page.jsx            -> sirf /user
Dynamic: app/user/[userId]/page.jsx   -> /user/1, /user/2, /user/abc ... sab kuch
```

Diagram:

```
Browser request: /user/42
                    │
Next.js dekhta hai: /user ke andar [userId] naam ka folder hai?
                    │  YES -> ye dynamic hai, 42 ko pakad lo
                    ▼
params = { userId: "42" }
                    │
page.jsx me: const { userId } = await params
                    ▼
Screen pe: "UserIdPage 42"
```

**Catch-all se compare karo:**

```bash
[userId]      -> ek segment:        /user/5 ✅ , /user/5/posts ❌
[...slug]     -> multiple segments: /docs/a/b/c ✅
[[...slug]]   -> upar wala + empty: /shop ✅ , /shop/a/b ✅
```

Real-life usages:

* `/product/[id]` — E-commerce (Amazon jaisa)
* `/blog/[slug]` — Blog post (`/blog/how-to-learn-nextjs`)
* `/user/[userId]` — Profile page (Is repo me yahi demo hai)

---

## 7. Shared Route (`layout.jsx`) — Navbar/Footer har page pe kyun dikhte hain?

```
┌─────────────────────────────────┐
│ <Navbar />  (layout se, fixed)  │
├─────────────────────────────────┤
│                                 │
│  {children}                     │
│  / -> Home ka hero              │
│  /about -> About ka testimonial │
│  /user/5 -> UserIdPage 5        │
│  (sirf ye hissa badalta hai)    │
│                                 │
├─────────────────────────────────┤
│ <Footer />  (layout se, fixed)  │
└─────────────────────────────────┘
```

Is repo me `app/layout.jsx` hi **shared-route** hai. Tum chahe 100 pages bana lo, Navbar/Footer dobara likhne ki zaroorat nahi.

Interview me poocha jaata hai: *"layout vs template me kya farak hai?"*

* `layout` = persist karta hai, state/input preserve rehta hai, re-render nahi hota.
* `template` = har navigation pe naya mount hota hai, state reset ho jaata hai, animation ke liye best hai.

---

## 8. `<Link>` — `<a>` tag kyun nahi use kiya?

`components/Navbar.jsx` dekho:

```jsx
import Link from "next/link";

<Link href={"/"}>Home</Link>
<Link href={"/about"}>About</Link>
<Link href={"/user"}>User</Link>
<Link href={"/contact"}>Contact</Link>
```

Agar tum `<a href="/about">` likhte to poora page server se dobara load hota (full refresh, Navbar bhi dobara mount hota, slow).

`<Link>` **client-side navigation** karta hai:

1. Hover karte hi Next.js destination page ko background me **prefetch** kar leta hai.
2. Click pe sirf `{children}` wala hissa swap hota hai. `layout` same rehta hai.
3. Browser ka back/forward bhi fast kaam karta hai.

Real-life me:

```jsx
// ✅ Sahi — fast
<Link href={`/user/${id}`}>View Profile</Link>

// ❌ Galat — slow full reload
<a href={`/user/${id}`}>View Profile</a>
```

Bonus props jo kaam aate hain:

```jsx
<Link href="/about" prefetch={false}>About</Link>  {/* prefetch band */}
<Link href="/user" replace>Back nahi jana</Link>   {/* history replace */}
```

---

## 9. Full Project Diagram (Is Repo ka)

```
C:.
├── app/
│   ├── layout.jsx ───────────── RootLayout (Navbar + {children} + Footer)
│   ├── page.jsx ─────────────── / (Home hero)
│   ├── globals.css
│   ├── favicon.ico
│   │
│   ├── about/
│   │   ├── page.jsx ─────────── /about
│   │   └── myself/
│   │       └── page.jsx ─────── /about/myself  [NESTED]
│   │
│   ├── contact/
│   │   └── page.jsx ─────────── /contact
│   │
│   └── user/
│       ├── page.jsx ─────────── /user (list)
│       └── [userId]/
│           └── page.jsx ─────── /user/:userId  [DYNAMIC]
│
├── components/
│   ├── Navbar.jsx ───────────── <Link> navigation
│   └── Footer.jsx ───────────── static footer
│
├── public/  (images, svg)
├── next.config.mjs
├── jsconfig.json
└── package.json (next@16, react@19, tailwind@4, bun)
```

Navigation flow:

```
User clicks "User" in Navbar
        │  <Link href="/user">
        ▼
app/layout.jsx (same rehta hai)
        │
        └──> app/user/page.jsx render (3 cards)
                │
                └── User clicks /user/7 (future me Link lagega)
                        │
                        └──> app/user/[userId]/page.jsx, userId="7"
```

---

## 10. Real-Life Usages — Ye sab seekh ke kya banega?

| Concept | Real Project me kaha lagega? |
|---------|------------------------------|
| Nested routing | `/dashboard/settings`, `/course/react/lesson-5` (LMS), `/about/team` |
| Dynamic routing | `/product/iphone-16`, `/blog/my-first-post`, `/profile/neeraj` |
| Route Groups `(auth)` | Login/Register ka alag layout, URL clean rakhna (`/login` na ki `/auth/login`) |
| Private folders `_` | `_components`, `_utils` ko route banne se rokna |
| Shared `layout.jsx` | Admin sidebar, E-commerce header/cart, Docs sidebar |
| `loading.jsx` | Product list aate time skeleton UI |
| `error.jsx` | Payment fail / API down pe friendly message |
| `route.js` | `/api/users` khud Next.js me banana (backend alag nahi chahiye) |
| `<Link>` | Saari internal navigation — kabhi `<a>` mat use karo internal links ke liye |

Mini challenge (khud try karo):

1. `app/blog/[slug]/page.jsx` banao aur `slug` ko screen pe print karo.
2. `app/docs/[...slug]/page.jsx` banao aur `/docs/a/b/c` khol ke `slug` array dekho.
3. `app/(auth)/login/page.jsx` banao — URL me `(auth)` aana chahiye ya nahi? Check karo.
4. `app/user/loading.jsx` me `Loading user...` likho aur `/user` pe throttle karke dekho.

---

## 11. Kaise chalaye?

```bash
# install (bun use ho raha hai is repo me)
bun install

# dev server
bun dev

# production check
bun run build
bun run start
```

---

**Yaad rakhne wali 3 lines:**

1. **Folder URL banata hai, `page.jsx` usko dikhata hai.**
2. **`layout.jsx` shared rehta hai, `{children}` badalta hai.**
3. **`[ ]` ka matlab dynamic hai, `( )` ka matlab URL me dikhega hi nahi.**

Happy learning! 🚀
