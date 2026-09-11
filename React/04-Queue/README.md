# 📋 Queue Management App — React Learning Project

Ek simple **Queue Management System** jo React mein bani hai. Customer ko queue mein add karo, unka service status update karo (waiting → serving → completed), aur remove karo.

Yeh project React ke core concepts ko samajhne ke liye perfect hai:

- 📦 **State Management** (`useState`)
- 🔀 **Component Communication** (parent ↔ child data-flow)
- ❓ **Conditional Rendering**
- 🔁 **`map` & `filter`**
- 📝 **Form handling**
- 🎨 **Styling ke saath polish**

---

## 🚀 Run Karna Kaise Hai

```bash
# dependencies install karo
npm install
# ya agar bun use kar rahe ho
bun install

# dev server chalayein
npm run dev        # ya: bun run dev
```

---

## 📁 Project Structure

```
04-Queue/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # entry point — app ko render karta hai
    ├── App.jsx           # parent component — saara state yahan hai
    ├── App.css           # global styling
    └── components/
        ├── QueueForm.jsx     # form — naya customer add karta hai
        └── QueueDisplay.jsx  # list — queue ko dikhata hai
```

![Diagram: App → QueueForm, App → QueueDisplay](https://via.placeholder.com/600x120/4f46e5/fff?text=App+—props→+QueueForm+&+QueueDisplay)

---

## 🧠 Core Concepts (Deep Dive)

### 1. State Management — `useState`

Saara data ek page par manage karte hain. `App` component mein ek `queue` array hai jo sab customers ko hold karta hai.

```jsx
const [queue, setQueue] = useState([])
```

`useState` do cheezein return karta hai:
1. **Current value** — `queue`
2. **Update function** — `setQueue`

> ⚠️ **Important:** `setQueue` dena reboot/update karta hai. React ek baar mein jaise hi state badle, component re-render hota hai aur UI update ho jaati hai.

---

### 2. Data Flow in Components (Props)

React mein data **top-down** (parent → child) props ke through jata hai, aur **bottom-up** (child → parent) callback functions ke through.

```
┌─────────────┐
│     App     │  ← State (queue) yahan rehta hai
└──────┬──────┘
       │
   props (data down)
       │
┌──────▼──────┐     ┌──────────────┐
│ QueueForm   │     │ QueueDisplay │
│ (onAdd prop)│     │ (queue,      │
│             │     │  onUpdate,   │
│             │     │  onRemove)   │
└─────────────┘     └──────────────┘
       ▲                     ▲
       │               callbacks (events up)
```

**Data Down — Props:**
`App` apna `queue` array props ke through `QueueDisplay` ko deta hai:

```jsx
<QueueDisplay
  queue={queue}
  onUpdateStatus={updateStatus}
  onRemove={removeFromQueue}
/>
```

**Events Up — Callbacks:**
Child event karta hai to parent ka function call hota hai:

```jsx
// QueueForm mein
<button onClick={onAdd}>Add Customer</button>
```

Yehi **"lifting state up"** principle hai — Zustand ko sabse upar rakho aur neeche props bhejo.

---

### 3. Handling Forms & Passing Data

`QueueForm` mein user se name aur service liya jata hai. Controlled input (value + onChange) use karte hain:

```jsx
const [name, setName] = useState('')
const [service, setService] = useState('')

const handleSubmit = (e) => {
  e.preventDefault()               // page reload roko
  if (!name.trim() || !service.trim()) return  // validation
  onAdd({ name, service })         // data parent tak pahunchao
  setName('')                      // form reset karo
  setService('')
}
```

- `e.preventDefault()` — bina iske form submit hone par page refresh ho jayega.
- **Controlled inputs:** value state se aati hai, onChange state update karta hai.
- `onAdd` ke through object parent `App` ko pass hota hai.

`App` mein data milta hai aur unique `id` + `status` add karta hai:

```jsx
const addToQueue = (customer) => {
  setQueue([...queue, { ...customer, id: Date.now(), status: 'waiting' }])
}
```

> `Date.now()` se unique id milti hai. Spread operator `...` se purani queue copy hota hai aur naya item append hota hai. **Never mutate state directly!**

---

### 4. Conditional Rendering (Kaafi Examples)

Conditional rendering ka matlab — **kahi condition ke hisaab se alag UI dikhana**. Yahan teen examples:

#### Example 1 — Empty State (Ternary `? :`)
Jab queue khali ho, alag message dikhao:

```jsx
{queue.length === 0 ? (
  <div className="empty-state">
    <p>No customers yet. Add someone to the queue above.</p>
  </div>
) : (
  <div className="queue-list">
    {/* customers yahan */}
  </div>
)}
```

#### Example 2 — Button dikhane ka logic (`&&`)
Status ke hisaab se alag button dikhana. `&&` operator tabhi render karta hai jab condition `true` ho:

```jsx
{customer.status === "waiting" && (
  <button onClick={() => onUpdateStatus(customer.id, 'serving')}>
    Start Service
  </button>
)}
{customer.status === "serving" && (
  <button onClick={() => onUpdateStatus(customer.id, 'completed')}>
    Complete
  </button>
)}
```

- `waiting` → "Start Service" button
- `serving` → "Complete" button
- `completed` → koi action button nahi

#### Example 3 — Dynamic CSS Class (Switch)
Status ke hisaab se alag color badge:

```jsx
const statusClass = (status) => {
  switch (status) {
    case 'waiting':   return 'status-waiting'
    case 'serving':   return 'status-serving'
    case 'completed': return 'status-completed'
    default:          return 'status-waiting'
  }
}

<span className={`status-badge ${statusClass(customer.status)}`}>
  {customer.status}
</span>
```

| Short-hand | Meaning | Example |
|-----------|---------|---------|
| `cond && <JSX>` | `true` to dikha, warna kuch nahi | `{ready && <p>Ready</p>}` |
| `cond ? A : B` | `true` to A, `false` to B | `{count > 0 ? 'Yes' : 'No'}` |
| `cond || fallback` | `false/undefined` to fallback | `{name || 'Guest'}` |

---

### 5. `map` & `filter` — List Rendering

#### `filter` — remove karne ke liye
Queue mein se ek customer ko remove karna:

```jsx
const removeFromQueue = (id) => {
  setQueue(queue.filter(customer => customer.id !== id))
}
```

`filter` ek naya array banata hai jisme sirf wo items hain jo condition `true` karte hain. Yahan `id` wala customer **exclude** ho jata hai.

#### `map` — har item ko render karne ke liye

```jsx
{queue.map((customer) => (
  <div className="customer-card" key={customer.id}>
    <h3>{customer.name}</h3>
    <p>{customer.service}</p>
  </div>
))}
```

> 🔑 **KEY IMPORTANT!** Har list item ko `key` dena zaroori hai (yahan `customer.id`). Key React ko batati hai kaunsa item kaunsa hai — bina key ke list update mein bugs aate hain. Isliye `index` ki jagah unique `id` use karna best hai.

#### `map` — state update (status change)

```jsx
const updateStatus = (id, newStatus) => {
  setQueue(queue.map(customer =>
    customer.id === id
      ? { ...customer, status: newStatus }  // is item ka status badlo
      : customer                            // baaki waise hi raho
  ))
}
```

Ye "darwaza" wala pattern — map + ternary ek kaam — babut common hai.

---

### 6. Diagram Explanations

#### Data Lifecycle
```
[User types in form] → [state name/service] → [submit]
                                                   │
              [App.addToQueue] ←── onAdd(object) ←─┘
                   │
        setQueue([...queue, {...customer, id, status:'waiting'}])
                   │
          state change → re-render → props down
                   │
        [QueueDisplay] render hota hai (map)
                   │
          waiting? → Start button
          serving? → Complete button
          remove?  → filter → setQueue
```

#### Array State Flow (Immutable Updates)

```
Push karne ke liye:   ...old, newItem
Update karne ke liye: old.map(x => cond ? {...x, ...} : x)
Remove karne ke liye: old.filter(x => !cond)
```

> ⚠️ **Kabhi `queue.push()` mat use karo!** Isse state mutate ho jati hai aur React ko kabhi pata nahi chalega. Hamesha naya array banao (`...`, `map`, `filter`).

---

### 7. Real-Life Usages

Yeh concept sirf app ke liye nahi — real world mein har jagah use hota hai:

| Concept | Real-life use |
|---------|--------------|
| **Queue/State** | Restaurant booking, hospital token system, support ticket systems |
| **map** | Kisi bhi list ko render karna — products, posts, chat messages, notifications |
| **filter** | Search bar (jab type karo, list filter), cart mein remove item |
| **Conditional rendering** | Login vs Logout button, loading spinner (data aane tak), empty cart vs items |
| **Form + onSubmit** | Login page, signup, checkouts, contact forms |
| **Props/data flow** | Kisi bhi component tree mein data pas karna |

Practical scenarios socho:
- 🏥 **Hospital app:** Patient ka status (waiting → with doctor → done) — bilkul isi queue pattern jaisa.
- 🛒 **E-commerce cart:** Items map karke dikhao, remove par filter, total update ho.
- 📱 **Social feed:** Posts render karo, like par status update, block karne par filter.
- 🎟️ **Support tickets:** Ticket ka priority/status change — exact same pattern.

---

## 🔧 Optimization Tip

State update mein kabhi mutating methods (push, splice) use mat karo. Yaad rakho — **immutability** = naye references = React ko pata chalta hai ki kya badla.

```jsx
// ❌ Wrong
queue.push(newCustomer)

// ✅ Right
setQueue([...queue, newCustomer])
```

---

## ✅ Learnings Summary

Iss project se aapne seekha:

1. `useState` se state manage karna
2. Props se parent→child data bhejna
3. Callbacks se child→parent events bhejna
4. `map`, `filter`, `&&`, `? :` se UI manipulate karna
5. Form handling aur controlled inputs
6. Styling ke saath response props banana

**Next steps:** Isse aage badhne ke liye `useReducer`, `useEffect`, ya Context API explore karo (jab state complex ho jaye).

---

*Made with ❤️ for learning React — 04-Queue*