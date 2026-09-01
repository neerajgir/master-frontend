# 🧩 02-Components — React Components ka Learning Playground

> **Yeh repo React + Vite + Tailwind CSS v4 use karke components banana seekhne ke liye hai.**
> Idhar tum sab kuch explore karoge — basic custom components se lekar shadcn/ui ke production-ready components tak.

---

## 📦 Tech Stack

| Toolkit | Version | Kyu Use Hua |
|---|---|---|
| React | `19.x` | UI banane ka core library |
| Vite | `8.x` | Fast dev server + build tool |
| Tailwind CSS | `4.x` | Utility-first styling (CSS-first config) |
| shadcn/ui | latest | Copy-paste ready components + `cva` variants |
| lucide-react | `1.x` | Icons |
| Radix UI Slot | `1.x` | `asChild` pattern ke liye (composition) |

---

## 🚀 Run Karne Ke Liye

```bash
npm install        # dependencies install karo
npm run dev        # dev server start (usually localhost:5173)
npm run build      # production build
npm run lint       # ESLint check
```

> 💡 Agar `bun` use karte ho toh `bun install` bhi chal jaayega (repo mein `bun.lock` bhi hai).

---

## 🗂️ Project Structure

```
02-Components/
├── components.json          # shadcn/ui ka config
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx             # Entry point
    ├── App.jsx              # Root component
    ├── index.css            # Tailwind v4 CSS-first config
    ├── lib/
    │   └── utils.js         # cn() merge helper
    └── components/
        ├── Button.jsx       # Custom button (props ka basic use)
        ├── Card.jsx         # Custom card (composite component)
        ├── Header.jsx       # Tailwind template wala section
        ├── Hero.jsx         # (commented) Template copy
        └── ui/              # shadcn components
            ├── button.tsx
            ├── card.tsx
            └── input.tsx
```

---

## 1️⃣ Components Kya Hote Hain? (Intro + Deep Knowledge)

**Component** = React UI ka reusable, isolated building block. Ek function jo **props** leta hai aur **JSX** return karta hai.

```jsx
// src/components/Button.jsx
import React from 'react'

const Button = (props) => {
  return (
    <div>
      <button className="mt-4 px-4 rounded-lg py-2 bg-blue-600 text-white hover:bg-blue-700">
        {props.button}
      </button>
    </div>
  )
}

export default Button
```

### Deep Knowledge — 3 Golden Rules of Components

1. **Single Responsibility** — Ek component ek hi kaam kare. `Card` card hai, `<Button/>` button hai; Card mein apna Button inject hota hai.
2. **Reusability** — Ek baar banao, har jagah use karo. `App.jsx` mein ek hi `Card` component 3 jagah (Python, JavaScript, C++) use ho raha hai.
3. **Composition over Configuration** — Chhote components ko jodke bade component banate ho. `Card` → contains `Button`.

```
┌──────────────┐
│     App      │  (Root — layout aur data yahan se milta hai)
└──────┬───────┘
       │ passes props (imageUrl, title, description)
       ▼
┌──────────────┐
│    Card      │  (Reusable — 3 baar use hua)
└──────┬───────┘
       │ renders
       ▼
┌──────────────┐
│    Button    │  (Sabse chhota, fully reusable)
└──────────────┘
```

> **React Component Tree hota hai** — Root `App`, phir branches (Card), phir leaves (Button). Yahi tree structure React DevTools mein dikhta hai.

---

## 2️⃣ Props — Data Flow Ka Basic

Props = **Function arguments** UI ke liye. Parent component child ko data pass karta hai.

```jsx
// src/components/Card.jsx
import Button from './Button.jsx'

const Card = (props) => {
  // destructure props = {title, description, imageUrl}
  return (
    <div>
      <div className="max-w-sm w-full h-auto bg-white rounded-xl shadow-md p-6 mt-8 overflow-hidden transition-shadow">
        <img src={props.imageUrl} alt="simple-image" className="w-full h-80" />
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800">{props.title}</h2>
          <p className="mt-2 text-gray-600 text-sm">{props.description}</p>
          <Button button="Buy Now" />
        </div>
      </div>
    </div>
  )
}

export default Card
```

### Deep Knowledge

- **Props top-to-bottom flow karte hain** (one-way data flow). Child kabhi directly parent ko data nahi bhejta (uske liye callback functions use hote hain).
- Props **immutable** hain — component ke andar `props.title = "x"` nahi change karna (React render cycle barbaad ho jaata hai). Change karna hai toh useState se naya data lo.
- **Destructuring pattern** (popular hai):

```jsx
const Card = ({ imageUrl, title, description }) => {
  return <img src={imageUrl} />   // props.title ki jagah seedha title
}
```

- **Default values** bhi de sakte ho:

```jsx
const Button = ({ button = "Click Me", onClick }) => {
  return <button onClick={onClick}>{button}</button>
}
```

- **Props Vs State (Important!)**
  - `props` = data jo *andar* aata hai (parent se) → read-only
  - `state` = data jo component *khud* manage karta hai → change ho sakta hai

```
┌── Parent (App) ──────────────┐
│  state: users, carts         │
│        │                     │
│        │  props ↓            │
│        ▼                     │
│  ┌── Card ──────────────┐    │
│  │ props: title         │    │
│  │ state: isLiked (own) │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
```

---

## 3️⃣ Tailwind Config — v4 mein CSS-first approach

Tailwind v4 mein **`tailwind.config.js` ki zaroorat nahi** — sab config CSS mein `@theme` block se hota hai!

```css
/* src/index.css — poora config yahi hai */
@import "tailwindcss";

/* Agar custom colors/tokens chaahiye:
@theme {
  --color-brand: #ff6b35;
  --font-display: "Roboto", sans-serif;
}
*/
```

### Deep Knowledge — v3 vs v4

| Tailwind v3 | Tailwind v4 |
|---|---|
| `tailwind.config.js` file required | CSS-first (`@theme`, `@variant`) |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` ek line sirf |
| JS config objects | TS/JS config arbitrary values (`w-274.25` jaise v4 features) |
| `@apply` heavily used | `@apply` hai but CSS variables preferred |

- Tumhara `Header.jsx` hi dekh lo — `w-274.25`, `aspect-1097/845`, `bg-linear-to-tr`, `rotate-30` ye sab **v4 dynamic utilities** hain jo bina config ke kaam karte hain. 😎
- v4 **`@tailwindcss/vite`** plugin use karta hai (package.json mein dekha? `@tailwindcss/vite: ^4.3.3`).

> Agar aage custom design system chahiye — palette, spacing scale, fonts — toh `index.css` mein `@theme` block use karo, JS config nahi.

---

## 4️⃣ shadcn/ui — Production-Ready Kaise Banana Hai

shadcn **library nahi** hai — yeh aapke project mein **copy kare jaane wale source components** hain. Tum copyright ho, customize karo, production mein use karo.

### Setup (already done — `components.json` dekhke)

```bash
npx shadcn@latest init
npx shadcn@latest add button card input
```

`components.json` mein:
- `style: "new-york"` → modern edge size wala style
- `baseColor: "neutral"` → color tokens
- `aliases` → `@/components/ui`, `@/lib/utils`

### shadcn Button — CVA (Class Variance Authority)

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive ...",
        outline: "border border-input ...",
        secondary: "bg-secondary ...",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

### Deep Knowledge — CVA kya karta hai?

CVA = `class-variance-authority`. Yeh **variant-based styling** ka king hai:

- Ek function jo `variant + size` deke sirf **relevant classes** deta hai
- Custom `className` tumhare `cn()` se merge hota hai
- **`asChild` + Radix Slot** pattern:

```tsx
const Comp = asChild ? Slot : "button"
```

Radio, Link, custom element — sab `Button` bana sakte ho bina HTML button ke. Yeh **composition** ka asli power hai!

### `cn()` helper — shadcn ka secret sauce

```js
// src/lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

- `clsx` = conditions based classes jodne ke liye (`clsx("a", isActive && "b")`)
- `twMerge` = do conflicting Tailwind classes ko solve karta hai (jaise `px-4` vs `px-8` → last ka jitaata hai)

```
Example:
  buttonVariants({ variant: "default" })   +   className="px-8"
                     │                              │
                     ▼                              ▼
  "bg-primary h-9 px-4 ..."            "px-8"
                     │                              │
                     └──────── twMerge ─────────────┘
                                    │
                                    ▼
                "bg-primary h-9 px-8 ..."   (px-8 wins, px-4 removed 🎯)
```

> shadcn **dark mode** bhi ready deta hai — `dark:` variants sab components mein kaam karte hain kyunki CSS variables `--background`, `--foreground` etc. use hue hain.

---

## 5️⃣ daisyUI — Class-Based Component Library

**daisyUI** = Tailwind ke **uppar ek component layer**. Tum `btn btn-primary btn-lg` jaise classes likho, wo kuch component wala look de deti hai.

> ⚠️ daisyUI v4 + Tailwind v4 mein free CDN bhi hai, aur install bhi ho sakta hai.

### Install karna hoga toh:

```bash
npm i daisyui
```

```css
/* index.css (v4 style) */
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --default;
}
```

### Usage example

```html
<button className="btn btn-primary">Primary</button>
<button className="btn btn-outline btn-error">Error Outline</button>
<button className="btn btn-ghost btn-lg">Ghost Large</button>

<card class="card w-96 bg-base-100 shadow-xl">
  <figure><img src="img.png" alt="img"/></figure>
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>desc</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy</button>
    </div>
  </div>
</card>
```

### Deep Knowledge — daisyUI vs shadcn

| daisyUI | shadcn/ui |
|---|---|
| Pre-built **class names** (`btn`, `card`, `modal`) | **Source code** copy hota hai, tum full control |
| Theme system built-in (20+ themes toggle) | CSS variables wala theme |
| Design change karne mein dikkat (classes baked hain) | Design change = code change (easy) |
| **200+ components** out-of-box | ~40 polished headless-style components |

**Kis tym kya use kare:**
- **Prototype jaldi** banani hai → **daisyUI**
- **Production-grade, custom-branding** wala design → **shadcn/ui**
- Global branding teams ne daisyUI ke classes pe workaround nahi kiya → mostly shadcn hi jaata hai

---

## 6️⃣ Aceternity UI — Premium/Bling Components

**Aceternity UI** (aceternity.com) — woh "wow-effect" wale components jo har startup landing page pe dikhte hain. Sparkles, gradients, beams, bento grids, animated border etc.

> Yeh bhi copy-paste components hain (jaise shadcn) but **design-heavy**, interactive 3D/fancy visuals ke liye.

### Common pattern (Animated shimmer button jaise)

```jsx
// Aceternity ke dabur wale buttons ki style — motion framer ki zaroorat hai
import { motion } from "framer-motion"

export const ShimmerButton = ({ children }) => {
  return (
    <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e2e8f0_0%,#a78bfa_50%,#e2e8f0_100%)]" />
      <span className="relative z-10 flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-white">
        {children}
      </span>
    </button>
  )
}
```

### Install karne ke liye:

```bash
npm i framer-motion clsx tailwind-merge
npx shadcn@latest init   # pehle shadcn ho, kyunki Aceternity uske aliases use karta hai
# ya manually code copy karo
```

### Deep Knowledge

- Aceternity deps: **framer-motion** (animation), **clsx + tailwind-merge** (same `cn()`), kabhi **@radix-ui** (dropdowns/tooltips).
- **Bento Grid** — trending pattern jisme different-size cards ek grid mein effectively arrange ho. Marketing pages (Vercel, Linear, Notion) mein bhar hua dikhega.
- Fancy cheezon ka **perf cost yaad rakho** — `animate-[spin...]` on blur gradients chala sakte ho but mobile pe throttle hota hai. Use sambhal ke.

---

## 7️⃣ shadcn Blocks — Pre-Built Sections Jo Copy Kare

**shadcn Blocks** (ui.shadcn.com/blocks) shadcn ecosystem ka hissa — pura **dashboard/sections** copy-paste ke liye ready.

- Login pages, dashboard sidebars, stats cards, pricing, auth forms — sab ready.
- **Copy karo → paste karo → data colors adjust → ready.**

```bash
# shadcn packages bolna hai toh (blocks use ni hote direct CLI se kuch cases mein)
npx shadcn@latest add sidebar button card table avatar dropdown-menu
```

### Deep Knowledge

- Blocks **hardcode** hote hain (jest tumhare project ka data inject karna hota hai — kahin API se).
- Tumhara `Header.jsx` ko dekhna — wo bilkul **Tailwind UI section** style mein hai (`bg-gray-900 py-24`, stats grid). Yeh blocks ka andaz hi hota hai — pehle copy, baad mein customize.
- **Customization flow:**
  1. Copy block code
  2. Layout tweak karo
  3. Colors apne brand se replace karo
  4. Real data/API se jodo
  5. Responsive test karo (mobile pehle!)

---

## 8️⃣ Tailwind CSS Blocks (tailblocks / tailwindui style)

**Tailwind blocks** = Tailwind ke **sirf HTML+classes** wale pre-made sections. Ye bro chahte ho to [tailblocks.cc](tailblocks.cc) ya Tailwind UI (paid) dekh lo.

```
.gitignore
├── package.json
├── package-lock.json
├── bun.lock
├── components.json
├── index.html
├── eslint.config.js
├── tsconfig*.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── App.css
│   ├── lib/
│   │   └── utils.js
│   ├── assets/
│   └── components/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Header.jsx
│       ├── Hero.jsx
│       └── ui/
│           ├── button.tsx
│           ├── card.tsx
│           ├── input.tsx
└── public/
```

### Ek typical "team section" block (kuch aisa):

```jsx
function TeamSection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 grid-cols-1 md:grid-cols-3">
        {team.map((member) => (
          <div key={member.name} className="text-center">
            <img className="mx-auto h-24 w-24 rounded-full" src={member.avatar} alt="" />
            <h3 className="mt-6 text-base font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-600">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Deep Knowledge — Kab kis "block" wali cheez use karein:

| Cheez | Purpose |
|---|---|
| shadcn Blocks | Dashboard, app UI, forms — code ownership chahiye |
| Tailwind UI / tailblocks | Marketing sections, landing — pure static |
| Aceternity | Fancy demo wali landing — wow factor |
| daisyUI | Fast class-based demo |
| shadcn/ui core | Reusable base components (Button, Card, Input) |

**Kiski jarurat hai yeh decide karne ke liye:** pehle `purpose` fix karo — landing page? dashboard? e-commerce? Design system? — phir upar wala table se match karo.

---

## 9️⃣ Diagram Explanations — Kaise Data Flow Hota Hai

### Component Tree pehle jaise hi:

```
                    ┌────────────────────────┐
                    │           App          │  ← Root, data source
                    └──────────┬─────────────┘
                               │ passes imageUrl, title, description
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌──────────┐      ┌──────────┐      ┌──────────┐
     │  Card 1  │      │  Card 2  │      │  Card 3  │   ← 3 reuse
     └────┬─────┘      └──────────┘      └──────────┘
          │ renders
          ▼
      ┌───────┐
      │Button │   ← Sabse reusable leaf
      └───────┘
```

### Props/State Category Diagram

```
                ┌─── React Component ───┐
                │                        │
   Props (in) ⬅ │                        │ ➡ State (internal)
   (immutable)  │       renders          │ (mutable, useState)
                │                        │
                └────────────────────────┘
                         │
                         ▼
                     JSX / DOM
```

### shadcn CVA → Variant → Class flow

```
    <Button variant="destructive" size="lg" />
                 │            │
                 ▼            ▼
      cva() → "bg-destructive  h-10 rounded-md px-8 ..."
                 │
                 ▼
        cn(...) + twMerge
                 │
                 ▼
        Final className applied ✔
```

---

## 🔟 Real-Life Usages — Industry Mein Kaise Use Hota Hai

| Component | Real world example |
|---|---|
| **Button + variants** | Flipkart's "Add to Cart" (default), "Delete" (destructive), "Ghost" for nav links |
| **Card** | Product listing (yaad karo App mein Python/JS/C++ wale cards hai) |
| **Header/Hero** | Landing page hero, SaaS pricing header (tumhara Header stats dikha raha hai — offices, colleagues — yeh careers page pattern hai) |
| **shadcn sidebar + table** | Dashboard admin panels, CRM (HubSpot, Zoho inspire) |
| **Input + Form** | Login/signup, search bar, checkout forms |
| **Aceternity bento/shimmer** | Product launches, saas landing hero — "premium feel" demos |
| **daisyUI modal/toast** | Quick prototype, internal tools, MVP shipp karne ke liye |

**Industry flow dekhna hota hai:**
```
Design Team (Figma)
   ↓ design tokens (colors, spacing, fonts)
Frontend Dev
   ↓ tokens ko CSS variables mein = Tailwind @theme
   ↓ base components shadcn (Button, Card, Input)
   ↓ features (sections, pages) — blocks ya handcrafted
Dashboard + Landing → Production
```

---

## 🎯 Next Steps / Practice Ideas

1. [ ] `Card.jsx` ko shadcn `Card` component se upgrade karo
2. [ ] Button mein `onClick`, `variant`, `size` props add karo
3. [ ] daisyUI install karke same Card ka daisy version banao — dono compare karo
4. [ ] Aceternity ka bento grid ya sparkles section banake dekho
5. [ ] shadcn Blocks se ek login + dashboard page copy karo
6. [ ] Dark mode toggle add karo (Tailwind v4 + shadcn ready hai)

---

## 📚 Concepts Cheatsheet (Ek Nazar Mein)

```
Component   → Function jo JSX return karta hai
Props       → Parent se data (immutable, one-way)
State       → Component ka khud ka data (mutable)
Composition → Chhote components ko jodna
AsChild     → Radix Slot, custom element jo compose ho
CVA         → Variant-based class generation
cn()        → clsx + twMerge = smart class merging
CSS-first  → Tailwind v4 ka config style (@theme)
```

---

Happy Coding! 🚀 Agar kuch practice karna ho — pehle `npm run dev` chalalo aur App.jsx mein components tweak karke result dekho. **Best tarika seekhne ka = break karo, fix karo, samjho.**