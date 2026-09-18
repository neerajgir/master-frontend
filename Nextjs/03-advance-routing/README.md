# Advanced Routing in Next.js App Router (03)

Yeh repo Next.js ke **App Router** mein advanced routing concepts ka deep-dive hai — har concept ek real folder structure ke saath samjha gaya hai, taaki tum sirf theory nahi, balki practical understanding bhi pakdo.

Agar tumne basic file-based routing (`app/page.js`, dynamic segments `[id]`) seekh liya hai, toh ab time hai ki Next.js ke powerful routing features ko master karo: nested routes, catch-all, groups, intercepting routes, parallel routes aur unmatched-route handling. Yeh sab milke tumhe production-grade app banane ki foundation dete hain.

---

## Table of Contents

1. [Nested Dynamic Routing](#1-nested-dynamic-routing)
2. [Limitations of Nested Dynamic Routes](#2-limitations-of-nested-dynamic-routes)
3. [Catch-All Segments](#3-catch-all-segments)
4. [Optional Catch-All Segments](#4-optional-catch-all-segments)
5. [Route Groups](#5-route-groups)
6. [Private Folders & External Files](#6-private-folders--external-files)
7. [Intercepting Routes](#7-intercepting-routes)
8. [Parallel Routes & Slots](#8-parallel-routes--slots)
9. [Unmatched Routes & Default Convention](#9-unmatched-routes--default-convention)
10. [Not Found Page](#10-not-found-page)
11. [Diagram Explanations](#11-diagram-explanations)
12. [Real-Life Usages](#12-real-life-usages)

---

## 1. Nested Dynamic Routing

### Concept
Dynamic segments (`[param]`) ko hum nest kar sakte hain — matlab ek segment ke andar doosra dynamic segment. Isse hierarchical URLs bante hain jaise `/user/:userId/post/:postId`.

### Folder Structure (repo se)
```
app/
└── user/
    ├── page.jsx                 → /user
    └── [userId]/
        ├── page.jsx             → /user/:userId
        └── post/
            └── [postId]/
                ├── page.jsx     → /user/:userId/post/:postId
                └── comment/
                    └── [commentId]/
                        └── page.jsx   → /user/:userId/post/:postId/comment/:commentId
```

### Code Snippet
`app/user/[userId]/post/[postId]/page.jsx`:
```jsx
const PostPage = async ({ params }) => {
  const { userId, postId } = await params;
  return (
    <div>
      User: {userId} | Post: {postId}
    </div>
  );
};

export default PostPage;
```

> **Note:** Next.js 15+ mein `params` ek Promise hai, isliye `await params` zaroori hai. Purani versions mein yeh seedha object hota tha.

### Deep Knowledge
- Har nested segment apna khud ka `layout.js` de sakta hai — jo parent layout ke upar render hota hai.
- URL hierarchy data hierarchy reflect karti hai: user → posts → comments.
- Server Components naturally nested data fetch kar sakte hain kyunki har level pe alag query ho sakta hai.

---

## 2. Limitations of Nested Dynamic Routes

Har cheez ka trade-off hota hai. Nested dynamic routes ke kuch important limitations:

| Limitation | Explanation |
|---|---|
| **URL Length** | Bahut zyada nesting se URL lamba aur unreadable ho jaata hai (`/a/b/c/d/e/f`). |
| **SEO Impact** | Search engines shallow URLs prefer karte hain. Deep nesting crawlability kam kar sakti hai. |
| **Performance** | Har nested layout ek extra React tree layer add karta hai — re-render cost badhti hai. |
| **Data Fetching Complexity** | Ek hi page ke liye multiple levels se data collect karna padta hai — waterfall requests ka risk. |
| **Maintenance** | Route rename/delete karna mushkil ho jaata hai kyunki bahut jagah dependencies hoti hain. |
| **Static Generation** | `generateStaticParams()` har level pe likhna padta hai — deeply nested routes ke liye boilerplate explode ho jaata hai. |

### Example Problem
Agar `/user/[userId]/post/[postId]/comment/[commentId]` static generate karna ho, toh teeno levels ke combinations pre-compute karne padte hain — combinatorial explosion.

### Solution Tip
Jahan possible ho, flat routes use karo ya query params (`?tab=settings`) prefer karo deep nesting ki jagah.

---

## 3. Catch-All Segments

### Concept
Catch-all segment `[...slug]` **ek ya zyada** path segments capture karta hai. URL mein at least ek segment hona zaroori hai.

### Folder Structure
```
app/
└── blog/
    └── [...slug]/
        └── page.jsx     → /blog/a, /blog/a/b, /blog/a/b/c ...
```

### Code Snippet
```jsx
const BlogPost = async ({ params }) => {
  const { slug } = await params; // ["a", "b"] for /blog/a/b
  return <div>Path parts: {slug.join(' / ')}</div>;
};
```

### Key Points
- `slug` hamesha **array** aata hai.
- `/blog` alone match **nahi** karega — at least one segment chahiye.
- CMS-driven pages, documentation sites ke liye perfect hai.

---

## 4. Optional Catch-All Segments

### Concept
`[[...slug]]` zero ya more segments capture karta hai. Matlab base route bhi match hota hai.

### Repo Example
```
app/
└── docs/
    └── [[...slug]]/
        └── page.jsx
```

Matches:
- `/docs`          → slug = undefined
- `/docs/intro`    → slug = ['intro']
- `/docs/api/auth` → slug = ['api', 'auth']

### Code Snippet (`app/docs/[[...slug]]/page.jsx`)
```jsx
import React from 'react'

const DocsPage = async ({ params }) => {
  const { slug } = await params;
  return (
    <div>DocsPage {slug ? slug.join('/') : 'Home'}</div>
  );
}

export default DocsPage;
```

### Difference Summary
| Syntax | `/foo` matches? | `/foo/bar` matches? |
|---|---|---|
| `[...slug]` | ❌ No | ✅ Yes |
| `[[...slug]]` | ✅ Yes | ✅ Yes |

---

## 5. Route Groups

### Concept
Route groups folders ko logically organize karte hain **bina URL affect kiye**. Parentheses `(groupName)` se define hote hain.

### Repo Example
```
app/
├── (admin)/
│   ├── dashboard/
│   │   └── page.jsx       → /dashboard
│   └── settings/
│       └── page.jsx       → /settings
```

Notice: URL mein `(admin)` **nahi** dikhta — sirf `/dashboard` aur `/settings` accessible hain.

### Use Cases
- Alag-alag layouts share karna (marketing vs admin panel).
- Team-wise code organization without polluting URLs.
- Feature-based grouping (`(auth)`, `(shop)`, `(profile)`).

### Important Rule
Do same-named routes different groups mein conflict create karte hain:
```
(app-a)/about/page.js   → /about
(app-b)/about/page.js   → /about   ❌ BUILD ERROR
```

---

## 6. Private Folders & External Files

### Concept
Underscore `_` prefix wale folders/files **routing se exclude** hote hain. Yeh sirf internal organization ke liye hain.

### Repo Example
```
app/(admin)/dashboard/_components/page.jsx
```
Yeh file route **nahi** banati. Sirf helper/component files rakhne ke liye useful hai.

### Naming Conventions
| Prefix | Meaning |
|---|---|
| `_folderName` | Private folder — router ignore karta hai |
| `.filename` | Dot-prefixed files bhi ignored (e.g., `.eslintrc`) |

### Why Use?
- Co-location: components usi feature folder ke andar rakho, lekin route mat banao.
- Clear separation between routable pages aur utility code.

---

## 7. Intercepting Routes

### Concept
Intercepting routes ek existing route ko "intercept" karke doosra UI dikhate hain — typically modal/popup ke liye. Direct navigation pe original page, soft navigation pe intercepted view.

### Marker Tokens
Token | Meaning
---|---
`(.)` | Same level intercept
`(..)` | One level up
`(...)` | Two levels up
`(..)(..)` | Far ancestor intercept

### Repo Examples

**Same-level intercept:**
```
app/one/(.)two/page.jsx        → intercepts /one/two when navigated from /one
```

**Far ancestor intercept:**
```
app/one/two/(..)(..)four/page.jsx   → intercepts /four when coming from /one/two
```

**Deep relative intercept:**
```
app/one/two/inner-two/(...)final/page.jsx  → intercepts /final
```

### How It Works
1. User clicks `<Link href="/four">` while on `/one/two`.
2. Next.js detects client-side navigation.
3. Instead of rendering `/four/page.jsx`, it renders `(..)(..)four/page.jsx`.
4. Agar user directly `/four` type kare ya refresh kare → normal `/four/page.jsx` render hoga.

### Real Pattern: Photo Modal (Instagram-style)
```
feed/photos/[photoId]/page.jsx           → full photo page
feed/(.)photos/[photoId]/page.jsx        → modal overlay version
```

### Caveats
- Intercepting routes sirf **client-side transitions** pe kaam karte hain.
- Hard reload / direct URL entry par bypass ho jaate hain.
- Debugging tricky ho sakta hai kyunki same URL do alag components render kar sakta hai context-dependent.

---

## 8. Parallel Routes & Slots

### Concept
Parallel routes allow karte hain ki ek layout mein **multiple independent pages simultaneously** render ho sakein — har slot apna loading/error state handle karta hai independently.

### Slot Naming
Folder name `@slotName` hota hai. Layout mein corresponding prop milta hai.

### Repo Example
```
app/admin-dashboard/
├── layout.jsx              ← receives { children, team, analytics }
├── page.jsx                ← main content (children)
├── @team/
│   ├── page.jsx
│   ├── default.jsx         ← fallback when no active subroute
│   └── team-docs/page.jsx
└── @analytics/
    ├── page.jsx
    └── default.jsx
```

### Layout Code (`app/admin-dashboard/layout.jsx`)
```jsx
const AdminLayout = ({ children, team, analytics }) => {
  return (
    <div className="grid grid-cols-2 gap-4 h-screen p-4">
      <div>{children}</div>
      <div className="grid grid-rows-2 gap-4">
        <div>{team}</div>
        <div>{analytics}</div>
      </div>
    </div>
  );
};
```

### Key Rules
- Har slot ke paas `default.jsx` hona chahiye — warna unmatched condition pe crash.
- Slots optional props hain — agar koi active route nahi hai toh `undefined` milta hai.
- Independent navigation: ek slot update hone pe doosra re-render nahi hota.
- Perfect for dashboards, sidebars, notifications panels.

### Streaming Benefit
Har slot separately stream ho sakta hai — slow API wali slot baaki UI ko block nahi karti.

---

## 9. Unmatched Routes & Default Convention

### Concept
Jab koi URL kisi specific route se match nahi karta but parent path exist karta hai, tab Next.js `default.js(x)` convention use karta hai — especially parallel slots mein.

### Flow
```
User visits /admin-dashboard/team/non-existent-subroute
→ @team slot tries to match
→ No matching page found
→ Falls back to @team/default.jsx
```

### Repo Example (`app/admin-dashboard/@team/default.jsx`)
Fallback UI provide karta hai jab primary page available na ho.

### Why Not Just Rely on not-found?
- `not-found.jsx` poore subtree ko replace kar deta hai.
- `default.js` sirf us slot ko fill karta hai — baaki layout intact rehta hai.
- Granular control milta hai per-slot.

---

## 10. Not Found Page

### Global vs Local

**Global (`app/not-found.jsx`):**
```jsx
const NotFoundPage = () => (
  <div>404 - Page Not Found</div>
);
```
Poore app ke liye fallback.

**Scoped (`app/user/not-found.jsx`):**
Sirf `/user/*` subtree ke under trigger hota hai.

### Programmatic Trigger
```jsx
import { notFound } from 'next/navigation';

const DynamicUserPage = async ({ params }) => {
  const { userId } = await params;
  if (Number(userId) > 10) {
    notFound();   // nearest not-found.jsx bubble karega
  }
  return <div>User {userId}</div>;
};
```

### Resolution Order
1. Current segment ka `not-found.jsx`
2. Parent segment ka `not-found.jsx`
3. Root `app/not-found.jsx`
4. Built-in Next.js 404

---

## 11. Diagram Explanations

### A. Route Group + Layout Sharing
```
app/
├── (marketing)/
│   ├── layout.js      → MarketingHeader/Footer
│   ├── about/page.js  → /about
│   └── pricing/page.js→ /pricing
└── (shop)/
    ├── layout.js      → ShopNav/CartProvider
    ├── products/page.js → /products
    └── cart/page.js     → /cart
```
URL clean rehta hai, lekin har group ka apna layout shell hai.

### B. Intercepting Route Lifecycle
```
Scenario 1: Client-side nav (/one → click link to /two)
   Browser URL: /one/two
   Rendered:    app/one/(.)two/page.jsx   ← MODAL VIEW

Scenario 2: Direct visit / refresh /one/two
   Browser URL: /one/two
   Rendered:    app/one/two/page.jsx      ← FULL PAGE
```

### C. Parallel Slots Data Flow
```
Request: GET /admin-dashboard
          │
          ├─► children  → app/admin-dashboard/page.jsx
          ├─► team      → app/admin-dashboard/@team/page.jsx
          └─► analytics → app/admin-dashboard/@analytics/page.jsx
          
Each fetched IN PARALLEL, streamed independently.
```

### D. Catch-All Matching Matrix
```
Route Pattern        | /docs | /docs/x | /docs/x/y
---------------------|-------|---------|----------
[...slug]            |  ✗    |   ✓     |   ✓
[[...slug]]          |  ✓    |   ✓     |   ✓
```

---

## 12. Real-Life Usages

### E-Commerce Platform
- `(customer)` group: shop, product, checkout pages with shopping layout
- `(seller)` group: inventory, orders dashboard with seller-specific auth guard
- `/product/[category]/[id]` nested dynamic for SEO-friendly catalog
- Intercepting routes for quick-view modals without leaving listing page

### Social Media App (Instagram Clone)
- Feed list → tap photo → intercepted route shows modal
- Share direct link → opens dedicated photo page
- Parallel slots: feed + stories sidebar + notification drawer load independently

### Documentation Site
- `[[...slug]]` catches all doc paths dynamically from Markdown/MDX files
- Version switching via route groups: `(v1)`, `(v2)`
- Scoped `not-found.jsx` for broken internal doc links

### Analytics Dashboard
- Parallel routes: charts widget, table widget, filters panel — each streams separately
- Slow DB queries in one slot don't freeze entire dashboard
- Default conventions show skeleton loaders per section

### Multi-Tenant SaaS
- Tenant isolation via middleware + route groups
- `/[tenant]/dashboard`, `/[tenant]/billing` nested dynamics
- Private `_lib` folders keep tenant resolution logic out of public routes

### Content Management (Headless CMS Integration)
- Catch-all handles arbitrary CMS-defined slugs
- Preview mode uses intercepting routes to inject draft overlays
- Draft/published separation through route groups `(preview)` and `(live)`

---

## Quick Reference Cheat Sheet

| Feature | Syntax | Purpose |
|---|---|---|
| Dynamic Segment | `[id]` | Single param capture |
| Nested Dynamic | `[a]/[b]` | Hierarchical params |
| Catch-All | `[...slug]` | One or more segments |
| Optional Catch-All | `[[...slug]]` | Zero or more segments |
| Route Group | `(name)` | Organize without URL change |
| Private Folder | `_name` | Exclude from routing |
| Intercept Same Level | `(.)target` | Modal on client nav |
| Intercept Parent | `(..)target` | Upward interception |
| Intercept Root | `(...)target` | Absolute interception |
| Parallel Slot | `@slotName` | Concurrent independent views |
| Default Fallback | `default.js` | Unmatched slot handler |
| Not Found | `not-found.js` | 404 boundary |

---

## Running This Project

```bash
npm install
npm run dev
```

Open http://localhost:3000 and explore:
- `/user/neeraj/post/1/comment/5` → nested dynamic
- `/docs/getting-started/install` → optional catch-all
- `/dashboard` → route group (no `(admin)` in URL)
- `/admin-dashboard` → parallel routes with slots
- Click around intercepting examples in `/one` subtree

---

*Happy routing!* 🚀