# React Learning Repo — Zero to Zustand (Hinglish Notes)

> Bhai log, ye repo mera React learning journey hai. Chai ke saath code, rote learning nahi — **concept + code + real-life use** wala approach.
> Har folder ek alag project hai: `01-Start` se lekar `07-Zustand` tak. Neeche har topic ko Hinglish me deep me samjhaya hai, saath me code snippet jo isi repo se liya gaya hai.

## Repo Structure Kya Hai?

```
React/
├── 01-Start/                  # React app ka pehla hello world, Vite setup
├── 02-Components/             # Reusable Card, Header, Button components
├── 03-State/                  # useState se counter, input handling
├── 04-Queue/                  # Queue Management App - state + list update ka real example
├── 05-Advance Component Props/# Basic, Children, Complex, Ref, Theme (Context) Props
├── 06-Custom Hooks/           # useCart custom hook + useEffect + useMemo + localStorage
└── 07-Zustand/                # Zustand global store - counter, posts, auth+theme
```

Har folder ko alag se run kar sakte ho:

```bash
cd "05-Advance Component Props"
npm install
npm run dev
# ya agar bun use kar rahe ho
bun install
bun run dev
```

---

## 0. Intro — React Hai Kya? Aur Kyun?

Simple bhasha me:

* **React ek UI library hai, framework nahi.** Matlab sirf view layer sambhalta hai.
* **Component-based hai:** Poora UI chhote-chhote function tukdo me tod do. Jaise `Button`, `Card`, `Navbar`.
* **Declarative hai:** Tum bolo *kya dikhana hai*, React khud figure out karta hai *kaise update karna hai* (Virtual DOM se).
* **Unidirectional data flow:** Data parent se child ki taraf jaata hai via `props`. Wapas aane ke liye function bhejo.

Tumhara pehla component isi repo me aisa hai (`01-Start/src/App.jsx`):

```jsx
function App() {
  return (
    <>
      <h1>Learn React with Chai Code</h1>
      <p>This is subheading.</p>
    </>
  )
}
export default App
```

Deep baat:

1. `App` ek function hai jo JSX return karta hai. JSX, HTML jaisa dikhta hai par JS hai.
2. `<> </>` ko Fragment bolte hain — bina extra div ke multiple element return karne ke liye.
3. `export default App` isliye taaki `main.jsx` me `import App from './App.jsx'` kaam kare.

`02-Components/src/App.jsx` me tumne component reuse seekha:

```jsx
<div className="flex gap-4">
  <Card imageUrl="..." title="Buy Python" description="..." />
  <Card imageUrl="..." title="Buy JavaScript" description="..." />
  <Card imageUrl="..." title="Buy C++" description="..." />
</div>
```

Yehi React ki power hai — **ek Card likho, 100 jagah alag data ke saath use karo.**

---

## 1. Advance Components and Props — Full Picture

Props ka matlab: **Properties**. Parent component child ko data bhejta hai, jaise function me argument bhejte ho.

Golden rules jo hamesha yaad rakho:

1. **Props read-only hain.** Child directly `props.title = "new"` nahi kar sakta. Change karna hai to parent me `useState` rakho aur setter function prop me bhejo.
2. **Props one-way flow hain:** Parent -> Child. Reverse ke liye callback bhejo.
3. **Re-render trigger:** Jab parent re-render hota hai ya props change hote hain, child bhi re-render hota hai (agar memo nahi hai).

Mental model:

```
App (state rakhta hai)
 └── Card (props: title, imageUrl, description)
      └── Button (props: text, color, onClick)
```

Tumhare `05-Advance Component Props` folder me 5 type ke props ka live demo hai. Ek-ek karke samajhte hain.

---

## 2. Basic Prop — String, Number, Function, Boolean

File: `05-Advance Component Props/src/components/BasicProp.jsx`

### Concept:

Sabse simple prop — string / number / boolean / function pass karna.

Tumne `Button` component banaya:

```jsx
function Button({ text, color, size, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium
        ${size === 'small' ? "text-sm px-3 py-1" : ""}
        ${size === 'medium' ? "text-base px-6 py-2" : ""}
        ${color === 'primary' && !disabled ? "bg-blue-500 text-white" : ""}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >{text}</button>
  )
}
```

Use aise kiya:

```jsx
const [clickCount, setClickCount] = useState(0)
const [isDisabled, setIsDisabled] = useState(false)

<Button text="Primary button" color="primary" disabled={isDisabled}
  onClick={() => setClickCount(clickCount + 1)} />

<Button text="Always Disabled" color="secondary" size="large"
  disabled={true} onClick={() => setClickCount(clickCount + 1)} />
```

### Deep Knowledge:

* **Destructuring:** `{ text, color }` karne se `props.text` baar-baar nahi likhna padta. Clean code lagta hai.
* **Function as prop:** `onClick={() => setClickCount(clickCount+1)}` — dhyan do, yahan function *pass* ho raha hai, *call* nahi ho raha. Agar `onClick={setClickCount(...)}` likh doge to render hote hi chal jayega — common beginner mistake.
* **Boolean prop shorthand:** `disabled` likhna = `disabled={true}`. Lekin dynamic case me `disabled={isDisabled}` use karo.
* **Default value:** `function Card({ color = 'blue' })` — agar parent ne color nahi bheja to blue le lega.

### Real-life Usage:

E-commerce site ke saare buttons — Add to Cart, Buy Now, Wishlist — ek hi `Button` component, bas `color`, `size`, `text`, `onClick` alag-alag.

### Common Mistake:

```jsx
// GALAT - har render pe naya function, child hamesha re-render
<Button onClick={() => doSomething()} />

// SAHI jab heavy child ho - useCallback se memoize karo
const handleClick = useCallback(() => doSomething(), [])
<Button onClick={handleClick} />
```

---

## 3. Children Prop — Wrapper / Layout Wala Concept

File: `05-Advance Component Props/src/components/ChildrenProp.jsx`

### Concept:

Jab tum aisa likhte ho:

```jsx
<Card title="User Profile">
  <p>Name: Neeraj Gir</p>
  <p>Email: neeraj@chai.com</p>
  <button>View Reports</button>
</Card>
```

To `<Card>` ke open-close tag ke andar jo kuch hai, wo automatically `children` prop me aata hai.

Tumhara `Card` implementation:

```jsx
function Card({ children, title, color = 'blue' }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50/50',
    green: 'border-green-500 bg-green-50/50',
    purple: 'border-purple-500 bg-purple-50/50',
  }
  return (
    <div className={`border-l-4 ${colorClasses[color]} p-6 rounded-r-lg`}>
      {title && <h3 className="text-xl font-bold mb-3">{title}</h3>}
      <h4>I will be here, ALWAYS</h4>
      <div>{children}</div>
    </div>
  )
}
```

Aur layout ke liye `Container`:

```jsx
function Container({ children, layout = 'vertical' }) {
  const layoutClasses = {
    vertical: 'flex flex-col space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  }
  return <div className={layoutClasses[layout]}>{children}</div>
}

// Use:
<Container layout="grid">
  <Card title="User Profile">...</Card>
  <Card title="Statistics">...</Card>
</Container>
```

### Deep Knowledge:

* `children` kuch bhi ho sakta hai — string, JSX, array, dusra component, function bhi.
* Ye **Composition** hai, Inheritance nahi. React docs bhi yahi bolte hain — wrapper banao, copy-paste mat karo.
* Modal, Sidebar, Layout, ThemeBox sab `children` se bante hain.

### Real-life Usage:

* `Modal` component: header/footer fixed, beech ka content `children` se aayega.
* Dashboard `Layout`: `<Layout><DashboardContent /></Layout>` — Navbar/Sidebar fixed, andar page change.
* Shadcn UI ka `Card`: `<Card><CardHeader>...<CardContent>...</Card>` — ye sab children composition hai.

---

## 4. Complex Prop With Complex Data — Object / Array / Function Together

File: `05-Advance Component Props/src/components/ComplexProp.jsx`

### Concept:

Real project me prop sirf string nahi hota. Poora object aata hai.

Tumne `UserProfileCard` banaya jo 3 heavy props leta hai:

```jsx
function UserProfileCard({ user, theme, actions }) {
  return (
    <div className={`${theme.backgroundColor} ${theme.textColor}`}>
      <h4>{user.name}</h4>
      <p>{user.email}</p>
      {user.stats && (
        <div className="grid grid-cols-3">
          {Object.entries(user.stats).map(([key, value]) => (
            <div key={key}>
              <div>{key}</div>
              <div>{value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
      <button onClick={actions.primary.onClick}>
        {actions.primary.label}
      </button>
    </div>
  )
}
```

Parent se data aise gaya:

```jsx
const users = [
  {
    user: {
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "👩‍💼",
      role: "Admin",
      status: "Active",
      stats: { posts: 145, followers: 2834, following: 421 }
    },
    theme: {
      backgroundColor: "bg-gradient-to-br from-purple-50 to-blue-50",
      textColor: "text-purple-950",
    },
    actions: {
      primary: {
        label: "View Profile",
        onClick: () => setMessage("Viewing Alice's profile"),
        className: "bg-purple-600 text-white"
      }
    }
  }
]

{users.map((userData, index) => (
  <UserProfileCard key={index} {...userData} />
))}
```

### Deep Knowledge:

* `{...userData}` ko **spread props** bolte hain. Matlab `user={userData.user} theme={userData.theme} actions={...}` teeno ek line me pass ho gaya.
* **Optional chaining / guard:** `{user.stats && (...)}` — agar stats nahi hai to crash nahi hoga. API data me field missing hona bahut common hai.
* **Key prop:** `map` me `key` dena mandatory hai taaki React samjhe kaunsi row change hui. Index ko key banana last option hai, real me `user.id` use karo.
* **Function inside object:** `actions.primary.onClick` — ye pattern admin panel, data table me bahut use hota hai.

### Real-life Usage:

* User directory, product listing, comment section — jahan API se array of objects aata hai aur har object se ek card banta hai.
* Table component jisme `columns` aur `data` dono complex props hain.

---

## 5. useRef and forwardRef — DOM Ko Direct Pakadna

File: `05-Advance Component Props/src/components/Refprop.jsx`

### Concept:

Normal me React state se UI update hota hai. Par kabhi-kabhi tumhe DOM node ko directly chhoona padta hai — jaise input pe focus karna, scroll karna, video play karna. Tab `useRef` aata hai.

`useRef` ek dabba hai jisme `.current` hota hai. Ye change hone pe re-render **nahi** karta — yahi `useState` se difference hai.

Tumhara code:

```jsx
import { useRef, forwardRef } from 'react'

const CustomInput = forwardRef(({ label, placeholder }, ref) => {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} type="text" placeholder={placeholder} />
    </div>
  )
})
CustomInput.displayName = 'CustomInput'

const Refprop = () => {
  const inputRef = useRef(null)
  const secondInputRef = useRef(null)

  const focusInput = () => inputRef.current?.focus()

  const getInputValue = () => {
    if (inputRef.current) {
      alert(`Input Value: ${inputRef.current.value}`)
    }
  }

  const clearInputValue = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

  return (
    <>
      <CustomInput ref={inputRef} label="First Input" placeholder="Type..." />
      <CustomInput ref={secondInputRef} label="Second Input" placeholder="..." />
      <button onClick={focusInput}>Focus First Input</button>
      <button onClick={getInputValue}>Get Value</button>
      <button onClick={clearInputValue}>Clear</button>
    </>
  )
}
```

### Deep Knowledge:

* **forwardRef kyun chahiye?** Normal function component `ref` prop ko samajh nahi pata. `forwardRef` bolta hai — "ye ref ko andar wale `<input>` tak pahuncha do". React 19 me ab function component me direct `ref` as prop mil jata hai, `forwardRef` ki need kam ho gayi, par purane code me yehi milega.
* `useRef(null)` ka initial value `null` hai, jab `<input ref={inputRef}>` mount hota hai tab React khud `inputRef.current = inputDOMNode` kar deta hai.
* `?.` (optional chaining) isliye taaki agar ref abhi attach nahi hua to error na aaye.
* **useRef ke 2 use-case:**
  1. DOM access (focus, scroll, measure)
  2. Mutable value jo render ke paar yaad rahe par re-render na kare — jaise `timerId = useRef()`, `prevValue = useRef()`

### Real-life Usage:

* Form me "OTP box me auto-focus next input", Search bar me page load pe focus.
* Chat app me naya message aane pe auto-scroll to bottom: `divRef.current.scrollIntoView()`.
* Third-party library (chart, map) ko DOM node dena.

### Kab useRef MAT use karo:

Har cheez ke liye ref mat use karo. Agar value UI pe dikhani hai to `useState` use karo. Ref change invisible hota hai.

---

## 6. Context API and Prop Drilling — Problem + Solution

File: `05-Advance Component Props/src/components/ThemeToggler.jsx`

### Problem — Prop Drilling Kya Hai?

Socho tree aisa hai:

```
App (theme state)
 └── Header
      └── Navbar
           └── ThemeButton (isko theme chahiye)
```

Bina Context ke tumhe `theme` ko Header -> Navbar hote hue ThemeButton tak pass karna padega, bhale Header/Navbar ko theme se koi matlab na ho. Isi ko **prop drilling** bolte hain — pipe bichhana har floor se jabki paani sirf top floor se ground floor bhejna hai.

```jsx
// Prop drilling wala dukh
<App theme={theme}>
  <Header theme={theme}>
    <Navbar theme={theme}>
      <ThemeButton theme={theme} />
    </Navbar>
  </Header>
</App>
```

### Solution — Context API

Context ek global pipe hai. Provider upar lagao, jisko chahiye `useContext` se pee lo.

Tumhara Theme example:

```jsx
import { createContext, useContext, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")
  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"))

  const value = { theme, toggleTheme, isDark: theme === "dark" }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
```

Use karna kitna easy:

```jsx
const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
)

function ThemedCard({ title, children }) {
  const { isDark } = useTheme()
  return (
    <div className={isDark ? "bg-gray-800 text-white" : "bg-white"}>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  )
}
```

### Deep Knowledge:

* `createContext()` default value leta hai, par real value `Provider value={...}` se aati hai.
* Custom hook `useTheme()` banana best practice hai — error handling ek jagah, import clean.
* **Context ka dard:** Jab `value` change hota hai, us Provider ke andar ke **saare** consumer re-render hote hain, chahe unko wo field chahiye ho ya nahi. Isliye bade app me Context ko tod do — `AuthContext`, `ThemeContext` alag-alag. Ya Zustand/Redux use karo.

### Real-life Usage:

Theme (dark/light), Auth user, Language (i18n), Sidebar open/close — jo data poore app me chahiye.

---

## 7. useContext in Multiple Components — Ek Store, Sab Consumer

Same `ThemeToggler.jsx` me tumne 3 component me `useTheme()` use kiya — yehi multiple consumer pattern hai:

```jsx
function ThemeToggleButton() {
  const { toggleTheme, isDark } = useTheme()
  return <button onClick={toggleTheme}>{isDark ? "🌙" : "☀️"}</button>
}

function ThemedCard({ title, children }) {
  const { isDark } = useTheme()
  return <div className={isDark ? "bg-gray-800" : "bg-white"}>{children}</div>
}

function ThemedButton({ children, variant, onClick }) {
  const { isDark } = useTheme()
  // variant + theme milake class decide
}
```

### Deep Knowledge:

* Ek Provider, N consumer. Koi prop pass nahi, phir bhi sab sync me theme change karte hain.
* Ye pattern samajh loge to Redux/Zustand samajhna halwa hai — wahan bhi `useStore()` se multiple component same store padhte hain.
* Interview me poochte hain: "Context vs Props?" — Jawab: Props = direct parent-child, explicit. Context = deep tree ya global data, implicit.

---

## 8. Custom Hooks — Logic Ka Reuse

File: `06-Custom Hooks/src/hooks/useCart.js`

### Concept:

Custom hook ek normal function hai jiska naam `use` se start hota hai aur andar React hooks (`useState`, `useEffect`) use karta hai. Iska kaam — **UI se logic alag karna.**

Tumne poora cart logic ek hook me daal diya:

```jsx
import { useState, useEffect, useMemo } from "react"

export function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id)
      if (found) return prev.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      )
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id))

  const totalItems = useMemo(() =>
    cart.reduce((t, i) => t + i.quantity, 0), [cart])

  const totalPrice = useMemo(() =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart])

  return { cart, addToCart, removeFromCart, totalItems, totalPrice }
}
```

Aur `App.jsx` super clean ho gaya:

```jsx
const App = () => {
  const { cart, addToCart, removeFromCart, totalItems, totalPrice } = useCart()
  return (
    <>
      {products.map(p => <ProductCart product={p} onAddToCart={addToCart} />)}
      <Cart cart={cart} totalItems={totalItems} totalPrice={totalPrice} />
    </>
  )
}
```

### Deep Knowledge:

* **Lazy init:** `useState(() => JSON.parse(...))` — function deke init karne se localStorage sirf pehli baar padha jata hai, har render pe nahi.
* **Functional update:** `setCart((prev) => ...)` — jab naya state purane state pe depend kare to hamesha function form use karo. Nahi to stale closure bug aayega (fast click pe quantity galat).
* **Rules of Hooks:** Hook sirf top-level pe, sirf React function / custom hook me. `if` ke andar `useState` kabhi mat likho.

Apne khud ke hooks banao: `useFetch`, `useLocalStorage`, `useDebounce`, `useOnlineStatus`.

### Real-life Usage:

* `useCart` — shopping site.
* `useAuth` — login/logout/user.
* `useFetch` — har API call ke liye loading/error/data ka combo.

---

## 9. useEffect — Side Effect Wala Manager

Is repo me `useEffect` 2 jagah mast use hua hai (`useCart.js`):

```jsx
// 1. Cart save karna jab bhi cart badle
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart))
}, [cart])

// 2. Dusre tab se sync + cleanup
useEffect(() => {
  const handleStorage = (e) => {
    if (e.key === "cart") setCart(JSON.parse(e.newValue || "[]"))
  }
  window.addEventListener("storage", handleStorage)
  return () => window.removeEventListener("storage", handleStorage)
}, [])
```

### Concept Hinglish me:

* `useState` = data yaad rakhna. `useEffect` = data ke change pe **bahar ki duniya** me kuch karna (API, localStorage, event listener, timer).
* Second argument **dependency array** hai — React ko batata hai kab dobara chalana hai.

| Code | Matlab |
|------|--------|
| `useEffect(() => {...})` | Har render pe chalo (rarely use) |
| `useEffect(() => {...}, [])` | Sirf mount pe ek baar chalo + unmount pe cleanup |
| `useEffect(() => {...}, [cart])` | Jab `cart` badle tab chalo |
| `return () => {...}` | Cleanup — listener hatana, timer clear karna |

### Deep Knowledge:

* **Cleanup bhoolna = memory leak.** Event listener lagaya aur hataya nahi to har mount pe ek aur listener jud jayega.
* **StrictMode me double run:** Dev me `useEffect` 2 baar chalta hai bug pakadne ke liye. Isliye effect me API POST mat karo bina guard ke.
* `04-Queue` wale app me agar tum queue ko backend se fetch karte to `useEffect(() => { fetchQueue() }, [])` likhte.

### Real-life Usage:

* Page load pe API fetch, search input pe debounce API, auth token refresh, WebSocket connect/disconnect, page title update.

---

## 10. useMemo — Heavy Calculation Ko Cache Karna

Same `useCart.js` se:

```jsx
const totalItems = useMemo(() => {
  return cart.reduce((total, item) => total + item.quantity, 0)
}, [cart])

const totalPrice = useMemo(() => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}, [cart])
```

### Concept:

Socho cart me 10,000 items hain. Har chhote re-render (jaise hover, input type) pe `reduce` dobara chalega — waste. `useMemo` bolta hai — "jab tak `cart` same hai, purana result de do, dobara calculate mat karo."

### Deep Knowledge:

* `useMemo(() => value, [deps])` — value cache karta hai. `useCallback(() => fn, [deps])` — function cache karta hai. `useRef` — render ke paar dabba.
* **Premature optimization mat karo.** Chhote array pe `useMemo` ka overhead fayde se zyada hai. Jab calculation heavy ho ya child `React.memo` ho tabhi use karo.
* Interview line: "`useMemo` re-render rokta nahi, calculation rokta hai. Re-render rokne ke liye `React.memo` + `useCallback` combo chahiye."

### Real-life Usage:

* Cart total, filter + sort on big list, chart data transform, expensive formatting.

```jsx
const filtered = useMemo(() =>
  products.filter(p => p.name.includes(search)), [products, search])
```

---

## 11. Zustand — Bina Dard Ka Global State (+ Diagram)

Files: `07-Zustand/src/store/counterStore.js`, `postStore.js`, `AppStore.js`

### Zustand Hai Kya?

Context ka problem yaad hai? Ek value badli, sab re-render. Redux me boilerplate bahut. Zustand beech ka rasta hai — **chhota, fast, hook-based global store.** No Provider hell.

Install:

```bash
npm install zustand
```

Tumhara counter store — poora store sirf 8 line:

```js
import { create } from 'zustand'

export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

Use karna:

```jsx
function Counter() {
  const { count, increment, decrement } = useCounterStore()
  return (
    <>
      <h1>{count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </>
  )
}
```

Auth + Theme ka combined slice (`AppStore.js`):

```js
export const useAppStore = create((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  theme: 'light',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}))
```

Async + loading state (`postStore.js`):

```js
export const usePostStore = create((set) => ({
  posts: [], loading: false, error: null,
  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts')
      const data = await res.json()
      set({ posts: data, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  }
}))
```

### Diagram — Data Ka Flow Samjho

**Prop Drilling wala dukh:**

```
        App (state)
          |
        Header (bekaar me pass)
          |
        Navbar (bekaar me pass)
          |
      ThemeButton (actual user)
```

**Context API wala fix:**

```
      [ ThemeProvider ]
       /      |       \
  CardA    CardB    Button
  (useTheme) (useTheme) (useTheme)
  => Provider se direct pipe, beech wale free
```

**Zustand wala superpower (no Provider):**

```
        ┌─────────────┐
        │   STORE     │
        │ count, user │
        │ posts, theme│
        └──────┬──────┘
               │  subscribe (selector se)
     ┌─────────┼──────────┐
     ▼         ▼          ▼
 Counter    Navbar     Posts
 count only user only  posts only
 => Jo component jo field padhega,
    sirf wahi re-render hoga
```

Selector pro-tip (re-render bachao):

```js
// YE poora store subscribe karega - chhota app me ok
const { count, increment } = useCounterStore()

// YE best hai - sirf count change pe render
const count = useCounterStore((s) => s.count)
const increment = useCounterStore((s) => s.increment)
```

### Zustand vs Context vs Redux — Kab Kya?

| Need | Use karo |
|------|----------|
| Parent-child data | Props |
| Deep tree, theme/auth | Context |
| Big app, frequent update, multiple slice, async | Zustand |
| Bahut badi team, strict DevTools/time-travel | Redux Toolkit |

### Real-life Usage:

Cart store, Auth store, Wishlist, Notification, Multi-step form data — jo 5-6 component me chahiye aur prop drilling se gandagi fail rahi ho.

---

## 12. Real-Life Usages — Sab Kuch Ek Saath (Interview Ready)

| Topic | Real project me kahan | Tumhare repo me kahan |
|-------|----------------------|----------------------|
| Components | Navbar, Footer, ProductCard | `02-Components` |
| useState | Counter, form input, toggle | `03-State`, `04-Queue` |
| Basic prop | Button variant, Badge | `05-.../BasicProp.jsx` |
| Children prop | Modal, Layout, Card wrapper | `05-.../ChildrenProp.jsx` |
| Complex prop | User list, data table | `05-.../ComplexProp.jsx` |
| useRef + forwardRef | Focus, scroll, video control | `05-.../Refprop.jsx` |
| Context + prop drilling fix | Theme, Auth, Language | `05-.../ThemeToggler.jsx` |
| Custom hook | Cart, fetch, localStorage | `06-Custom Hooks/useCart.js` |
| useEffect | API fetch, localStorage sync, listener | `useCart.js` me 2 effect |
| useMemo | Cart total, filter/sort | `useCart.js` me totalItems/Price |
| Zustand | Global cart/auth/posts | `07-Zustand/store/*` |
| Queue state update | Token system, support ticket | `04-Queue/App.jsx` |

Queue app ka pro pattern bhi note kar lo (`04-Queue/src/App.jsx`):

```jsx
const [queue, setQueue] = useState([])

const addToQueue = (customer) =>
  setQueue([...queue, { ...customer, id: Date.now(), status: 'waiting' }])

const updateStatus = (id, newStatus) =>
  setQueue(queue.map(c => c.id === id ? { ...c, status: newStatus } : c))

const removeFromQueue = (id) =>
  setQueue(queue.filter(c => c.id !== id))
```

Ye 3 line — **add (spread), update (map), delete (filter)** — React me list handling ka 90% hai. CRUD, Todo, Cart sab isi pe chalta hai.

---

## Aage Kya Seekhu? (Roadmap)

1. `useReducer` — jab state logic complex ho (cart + coupon + address ek saath).
2. `React.memo + useCallback` — performance tuning.
3. React Router — multi-page feel.
4. Zustand middleware — `persist` (auto localStorage), `devtools`.
5. Data fetching library — TanStack Query (caching, retry, background refetch).

```js
// Zustand persist ka teaser - refresh ke baad bhi cart bacha rahega
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(persist((set) => ({
  cart: [],
  add: (item) => set((s) => ({ cart: [...s.cart, item] }))
}), { name: 'cart-storage' }))
```

---

Made with ❤️ by Neeraj Gir — seekhte raho, banate raho. Chai piyo, code karo. ☕💻
