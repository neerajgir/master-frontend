# 03-State 🔄 | React `useState` Deep Dive (Hinglish)

> **Yeh repo mera learning journey hai** jahan main React ke **State** concept ko zero se samajh raha hoon — real code snippets, diagrams, multiple examples, inline-CSS tricks aur real-life use cases ke saath.

---

## 📚 Table of Contents

1. [Intro: State kya hota hai?](#-1-intro-state-kya-hota-hai)
2. [useState Hook — Syntax & Basics](#-2-usestate-hook--syntax--basics)
3. [Multiple Examples of State](#-3-multiple-examples-of-state)
4. [Inline CSS in React](#-4-inline-css-in-react)
5. [Diagram Explanations (Visual Flow)](#-5-diagram-explanations-visual-flow)
6. [Real-Life Usages of State](#-6-real-life-usages-of-state)
7. [Best Practices & Common Pitfalls](#-7-best-practices--common-pitfalls)
8. [Project Code Walkthrough](#-8-project-code-walkthrough)
9. [Run Locally](#-9-run-locally)

---

## 🧠 1. Intro: State kya hota hai?

**State** ek React component ki **memory / variable** hoti hai jo UI ko control karti hai. Jab state change hoti hai, React **automatically** component ko re-render karta hai aur UI update ho jaata hai.

Socho aise:
> 🧠 **State = Component ka dimag** — dimag me jo value hai, wahi screen pe dikhti hai. Dimag badlo, screen bhi badal jaati hai.

### React me 2 tarah ke "data" hote hain:
| Type | Kaun handle karta hai? | Kab change hota hai? |
|------|------------------------|----------------------|
| **Props** | Parent component | Parent ke marzi se |
| **State** | Khud component (internally) | Event / Logic se khud change hota hai |

```jsx
// Props - bahar se aata hai
function Welcome(props) {
  return <h1>Hello {props.name}</h1>
}

// State - andar manage hota hai
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 🤔 Why State important hai?

Bina state ke React me kuch bhi **dynamic** nahi ho sakta — koi counter, koi toggle, koi form input, koi animation. State hi React ka **dil** hai.

---

## ⚙️ 2. `useState` Hook — Syntax & Basics

`useState` ek **Hook** hai jo React ko bolta hai:  
_"Is component ko ek variable yaad rakhna hai, aur jab ye badle toh UI update karna."_

### 📌 Syntax

```jsx
import { useState } from "react"

const [state, setState] = useState(initialValue)
//     ↑      ↑                       ↑
//   current setter function      default value
//   value   jo naya value set karega
```

### 📌 Example 1: Simple Counter

```jsx
import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0) // initial value 0

  return (
    <div>
      <p>Taps: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

### 📌 Example 2: Toggle (On/Off)

```jsx
function Bulb() {
  const [isOn, setIsOn] = useState(false)

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? "💡 On" : "🌑 Off"}
    </button>
  )
}
```

### 📌 Example 3: Text Input

```jsx
function NameInput() {
  const [name, setName] = useState("")

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Apna naam likho"
    />
  )
}
```

---

## 🎯 3. Multiple Examples of State

### 🔢 Example A: Multiple States in One Component

```jsx
function UserForm() {
  const [name, setName] = useState("")
  const [age, setAge] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />
      <label>
        <input
          type="checkbox"
          checked={isSubscribed}
          onChange={(e) => setIsSubscribed(e.target.checked)}
        />
        Subscribe
      </label>
    </form>
  )
}
```

### 🎲 Example B: Array state (Todo list)

```jsx
function Todo() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState("")

  const addTodo = () => {
    setTodos([...todos, { id: Date.now(), text }])
    setText("")
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 🧊 Example C: Object state

```jsx
function Profile() {
  const [user, setUser] = useState({ name: "", email: "" })

  const update = (key, value) => {
    setUser({ ...user, [key]: value }) // ← spread zaroori hai!
  }

  return (
    <>
      <input onChange={(e) => update("name", e.target.value)} />
      <input onChange={(e) => update("email", e.target.value)} />
    </>
  )
}
```

### 🧮 Example D: Functional Updater (Stale state fix)

```jsx
// ❌ Galat - purana count use karega
setCount(count + 1)

// ✅ Sahi - latest value guarantee
setCount((prev) => prev + 1)
```

Jab ek hi event me **multiple updates** karna ho toh functional form zaroori hai.

```jsx
const triple = () => {
  setCount(c => c + 1)
  setCount(c => c + 1)
  setCount(c => c + 1)
  // Final: +3 (stale nahi hoga)
}
```

---

## 🎨 4. Inline CSS in React

React me tum **directly** `style` attribute me CSS object likh sakte ho. Yeh **dynamic styling** ke liye perfect hai — kyunki values state se aati hain!

### 📌 Basic Inline Style

```jsx
function Button() {
  return (
    <button style={{ backgroundColor: "blue", color: "white", padding: "10px" }}>
      Click Me
    </button>
  )
}
```

> ⚠️ **Important**: Inline CSS me `kebab-case` nahi, **camelCase** use hota hai.  
> `background-color` ❌ → `backgroundColor` ✅

### 📌 Dynamic Inline Style with State

```jsx
function ThemeBox() {
  const [dark, setDark] = useState(false)

  const containerStyle = {
    backgroundColor: dark ? "#222" : "#fff",
    color: dark ? "#fff" : "#000",
    padding: "20px",
    borderRadius: "8px",
    transition: "all 0.3s ease"
  }

  return (
    <div style={containerStyle}>
      <p>{dark ? "🌙 Dark Mode" : "☀️ Light Mode"}</p>
      <button onClick={() => setDark(!dark)}>Toggle Theme</button>
    </div>
  )
}
```

### 📌 Style as Computed Expression

```jsx
function ProgressBar({ value }) {
  return (
    <div style={{ width: "100%", height: "20px", background: "#eee" }}>
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: value > 50 ? "green" : "orange",
          borderRadius: "5px"
        }}
      />
    </div>
  )
}
```

### 📌 Multiple styles merge karna

```jsx
const baseStyle = { padding: "10px", borderRadius: "5px" }
const primaryStyle = { background: "blue", color: "white" }

<button style={{ ...baseStyle, ...primaryStyle }}>Submit</button>
```

### 🆚 Inline CSS vs External CSS

| Inline CSS | External CSS (App.css) |
|-----------|------------------------|
| Dynamic values ke liye best | Static styling ke liye best |
| Component ke saath co-located | Global / shared styles |
| Re-render pe performance hit | Cached hota hai |
| Pseudo-classes (`:hover`) ❌ | Pseudo-classes ✅ |

**Rule of thumb:**  
> 🔹 State-driven styling → Inline  
> 🔹 Static layout / theme → External CSS

---

## 🗺️ 5. Diagram Explanations (Visual Flow)

### 📊 Diagram 1: How `useState` works internally

```
┌──────────────────────────────────────────┐
│         React Component                  │
│                                          │
│   const [count, setCount] = useState(0)  │
│                                          │
│   ┌─────────────┐                        │
│   │   Memory    │   count = 0            │
│   │   (State)   │   (initial value)      │
│   └──────┬──────┘                        │
│          │                               │
│          ▼                               │
│   ┌─────────────┐                        │
│   │  Render UI  │   <p>{count}</p>       │
│   └─────────────┘                        │
│                                          │
│   User clicks button ──► setCount(1)     │
│                          │               │
│                          ▼               │
│                   ┌─────────────┐        │
│                   │  Re-render  │        │
│                   │  count = 1  │        │
│                   └─────────────┘        │
└──────────────────────────────────────────┘
```

### 📊 Diagram 2: setState ka lifecycle

```
   Click Event
       │
       ▼
   ┌──────────────┐
   │  setCount(5) │   ← nayi value ya function
   └──────┬───────┘
          │
          ▼
   ┌──────────────────┐
   │  React schedules │   ← batching (multiple updates ek saath)
   │     re-render    │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │   New VDOM build │
   │   (diff karta)   │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │   Real DOM me    │   ← sirf badle hue part update
   │   patch karta    │
   └──────────────────┘
```

### 📊 Diagram 3: Multiple States in one component

```
   <App/>
      │
      ├── useState("Neeraj") ──► name      → renders in <h1>
      │
      ├── useState(25)        ──► age       → renders in <p>
      │
      ├── useState(false)     ──► isAdmin   → controls button visibility
      │
      └── useState([])        ──► tasks     → renders in <ul>
```

### 📊 Diagram 4: Props vs State Flow

```
   ┌─────────────┐
   │   Parent    │
   │  (stateful) │
   └──────┬──────┘
          │ props
          ▼
   ┌─────────────┐
   │    Child    │     ← yahan state nahi hai,
   │  (stateless)│        data sirf receive karta hai
   └─────────────┘
```

---

## 🌍 6. Real-Life Usages of State

State har jagah use hoti hai — kuch common examples:

| App Feature | State Use |
|-------------|-----------|
| 🔔 Notification Bell | `unreadCount` (number state) |
| 🛒 Shopping Cart | `cartItems` (array state) |
| 🌗 Dark Mode Toggle | `theme` (string state) |
| 🔍 Search Filter | `query` (string state) |
| 📄 Pagination | `currentPage` (number state) |
| ✅ Form Validation | `errors`, `values` (object state) |
| 📊 Live Charts | `dataPoints` (array state) |
| 🎮 Game Score | `score`, `lives` (number state) |
| 🪟 Modal Open/Close | `isModalOpen` (boolean state) |
| 💬 Chat Messages | `messages` (array state) |

### 🎯 Example: Real-life Search Bar

```jsx
function SearchableList() {
  const [query, setQuery] = useState("")
  const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry"]

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <input
        placeholder="Search fruits..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {filtered.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 🎯 Example: Modal toggle

```jsx
function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      {open && (
        <div className="modal" style={modalStyle}>
          <p>Hello!</p>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </>
  )
}

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  padding: "20px",
  borderRadius: "8px"
}
```

---

## 🛡️ 7. Best Practices & Common Pitfalls

### ✅ Best Practices

1. **State ko top-level me rakho** — agar 2 siblings ko same data chahiye, parent me rakho.
2. **Functional updater use karo** jab nayi value purani pe depend kare.
3. **Object/Array state me hamesha spread karo** (`...state`) — direct mutate mat karo.
4. **Minimum state rakho** — jo value `props` se derive ho sakti hai, alag state mat rakho.
5. **State ka naam descriptive rakho** — `count` se accha `cartItemCount`.

### ❌ Common Pitfalls

| ❌ Galat | ✅ Sahi |
|----------|---------|
| `state.count = 5` (direct mutation) | `setState({...state, count: 5})` |
| `setCount(count + 1)` (in async loops) | `setCount(c => c + 1)` |
| State me `input` controlled na rakhna | `value={input}` + `onChange` |
| Inline object har render pe naya banana (perf) | `useMemo` ya constant me baahar rakho |

```jsx
// ❌ Har render pe naya object
<button style={{ color: "red" }} />

// ✅ Baahar define karo
const btnStyle = { color: "red" }
<button style={btnStyle} />
```

---

## 🔍 8. Project Code Walkthrough

Yeh project ek **Counter app** hai jisme:
- Counter increase / decrease / reset buttons
- Input se **custom value set** karna
- Inline CSS use ki gayi hai buttons aur input pe

### 📄 `src/App.jsx`

```jsx
import { useState } from "react"
import "./App.css"

const App = () => {
  const [count, setCount] = useState(0)   // Counter value
  const [input, setInput] = useState(0)   // User input for "Set to X"

  return (
    <div>
      <h1>Counter</h1>

      {/* Current count display */}
      <div className="card">Count is {count}</div>

      {/* Buttons */}
      <button
        onClick={() => setCount(count + 1)}
        style={{ margin: "0 5px" }}
      >
        Increase
      </button>

      <button
        onClick={() => setCount((c) => Math.max(c - 1, 0))}
        style={{ margin: "0 5px" }}
      >
        Decrease
      </button>

      <button
        onClick={() => setCount(0)}
        style={{ margin: "0 5px" }}
      >
        Reset
      </button>

      {/* Custom set with input */}
      <div style={{ margin: "20px 0" }}>
        <input
          style={{
            width: "100px",
            border: "1px solid white",
            margin: "0 5px",
            padding: "0.6em 1.2em"
          }}
          value={input}
          onChange={(e) => setInput(Number(e.target.value))}
          type="text"
        />
        <button
          style={{ margin: "0 5px" }}
          onClick={() => {
            setCount(Number(input))
            setInput(0)
          }}
        >
          Set to {input}
        </button>
      </div>
    </div>
  )
}

export default App
```

### 🔑 Yahan kya kya seekha:

| Concept | Kahan use hua |
|---------|---------------|
| `useState` initial value | `useState(0)` |
| Multiple states | `count` + `input` |
| Functional updater | `setCount((c) => Math.max(c - 1, 0))` |
| Inline style object | `style={{ margin: "0 5px" }}` |
| Controlled input | `value={input}` + `onChange` |
| Type casting | `Number(e.target.value)` |

---

## 🚀 9. Run Locally

```bash
# Install dependencies
npm install
# ya
bun install

# Start dev server
npm run dev
# ya
bun run dev
```

Open browser at: `http://localhost:5173`

### 📦 Build for production

```bash
npm run build
npm run preview
```

---

## 🎓 Summary Cheat Sheet

```jsx
// 1. Import
import { useState } from "react"

// 2. Declare
const [value, setValue] = useState(defaultValue)

// 3. Read
<div>{value}</div>

// 4. Update
setValue(newValue)
// ya
setValue(prev => prev + 1)

// 5. Inline style
<div style={{ color: "red", fontSize: 20 }} />
```

---

## 🔗 Resources for Further Learning

- 📖 [React Official Docs – State](https://react.dev/learn/state-a-components-memory)
- 📖 [useState API Reference](https://react.dev/reference/react/useState)
- 🎥 [React State in Hinglish – YouTube](https://youtube.com)

---

> ✍️ **Author**: Neeraj  
> 📁 **Repo**: Frontend Master / 03-State  
> 🎯 **Goal**: React fundamentals zero se samajhna, with real code, diagrams aur Hinglish notes.