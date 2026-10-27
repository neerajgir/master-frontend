# 💳 Stripe Integration in Next.js — Learning Repository

> **Hinglish guide:** Stripe kya hai, Payment Intents se lekar Checkout Session aur Webhooks tak — sab **deep explanation + code snippets + diagrams + real-life use cases** ke saath. Ye repo mera (aur tumhara) **payment/billing seekhne ka notebook** hai Next.js App Router ke saath.

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

---

## 📚 Table of Contents

| # | Topic | Kya milega |
|---|-------|-----------|
| 1 | [Intro — ye repo kya hai](#1--intro--ye-repo-kya-hai) | Kyun seekhna zaroori hai |
| 2 | [Stripe samjho — andar se kaise kaam karta hai](#2--stripe-samjho--andar-se-kaise-kaam-karta-hai) | Core objects ka deep knowledge |
| 3 | [Payment flow ke 3 tarike](#3--payment-flow-ke-3-tarike-kaunsa-kab-use-karein) | Payment Intents / Checkout / Billing |
| 4 | [Project setup — Next.js + Stripe](#4--project-setup--nextjs--stripe) | Install, env vars, folder structure |
| 5 | [Stripe Integration in Next.js — Code](#5--stripe-integration-in-nextjs--code) | Checkout, PaymentIntent, Elements, Billing Portal |
| 6 | [Webhooks — Asli Dil ka hissa](#6--webhooks--asli-dil-ka-hissa) | Signature verify + DB update |
| 7 | [Diagram Explanations](#7--diagram-explanations) | ASCII flowcharts har flow ke |
| 8 | [Security — galtiyan jo sab karte hain](#8--security--galtiyan-jo-sab-karte-hain) | Kya KABHI mat karna |
| 9 | [Real-Life Usages](#9--real-life-usages) | Production mein kaise use hota hai |
| 10 | [Testing & Debugging](#10--testing--debugging) | Test cards, CLI, dashboard |
| 11 | [Common Mistakes & FAQ](#11--common-mistakes--faq) | Interview + debugging ke liye |
| 12 | [Cheat Sheet + Practice Tasks](#12--quick-cheat-sheet--practice-tasks) | Revision & homework |

---

## 1. 📖 Intro — ye repo kya hai?

### Problem samjho

Jab tum koi SaaS ya e-commerce app banate ho, toh last step hota hai — **paisa lena**. Ab paisa lena itna simple nahi hai:

```
❌ Simple lagta hai:
"Bas ek UPI link bhej do / bank transfer karwa do"

✅ Reality:
- Card details kisi ke server par bhi nahi aani chahiye (PCI-DSS compliance)
- 3D Secure / OTP verification chahiye (RBI mandate India mein)
- Failed payments retry karne hote hain
- Refunds, subscriptions, invoices, GST bill...
- Fraud/chargeback handle karna
```

**Stripe** ye sab ka kaam ek API ke peeche chhupa deta hai. Tum sirf **token/clientSecret** handle karte ho — card number tumhare server par **kabhi aata hi nahi**.

### Ye repo kya cover karti hai

- 🔑 **Stripe core concepts** — PaymentIntent, Customer, Product, Price, Subscription, Invoice
- ⚡ **Next.js App Router** ke saath integration — Route Handlers + Server Actions + Client Components
- 🧾 **Checkout Session** se payment lena (sabse safe, sabse common)
- 🧩 **Stripe Elements** apne hi UI mein rakhna (custom checkout page)
- 🔁 **Subscriptions & Billing Portal** (recurring payments)
- 🪝 **Webhooks** — payment hua/tootna → database update (bina webhook ke app adhoora hai)
- 📊 **Diagrams** — har flow visual form mein
- 🌍 **Real-life usages** — kaunsi company kaise use karti hai

> **Yaad rakho:** Stripe integration ka 80% kaam *SDK calls* hain, aur 20% *samajhna* hai ki **kaunsa flow kab use karna chahiye**. Ye README 20% par focus karta hai.

---

## 2. 🧠 Stripe samjho — andar se kaise kaam karta hai

### 2.1 Stripe ke core objects

```
┌─────────────────────────────────────────────────────────────┐
│                    STRIPE DASHBOARD (tumhara "bank")        │
│                                                             │
│  Product  ──has many──►  Price (₹499/mo, ₹4999/yr)          │
│                                                             │
│  Customer ──pays via──►  PaymentIntent ──► Charge           │
│      │                        │                │            │
│      │                        │ (failed)       │ (refund)   │
│      │                        ▼                ▼            │
│      │                   PaymentMethod     Refund object    │
│      │                                                        │
│      └──subscribes──► Subscription ──► Invoice ──► InvoiceItem│
│                                                             │
│  Event (webhook payload)  ◄── har cheez par ek event banta hai│
└─────────────────────────────────────────────────────────────┘
```

| Object | Kya hai | Hinglish analogy |
|--------|---------|------------------|
| **Customer** | Ek bandey ka Stripe record | "Ghar ka khata" — jiske naam par sab bills |
| **Product** | Tumhara bechne wala item/plan | "Dukaan ka saman" |
| **Price** | Product ka daam (₹499/mo, one-time, usage-based) | "Daam ka tag" — Product↔Price = 1:N |
| **PaymentMethod** | Card/upi/pi details ka token | "Card ka proxy" — asli number Stripe ke paas |
| **PaymentIntent** | Ek payment collect karne ki koshish | "Bill ban gaya, ab paisa aana baaki" |
| **Charge** | Safal paisa ka actual record | "Paisa kat gaya" |
| **Checkout Session** | Hosted payment page ka snapshot | "Stripe ka ready-made counter" |
| **Subscription** | Recurring plan | "Har mahine auto-nakal" |
| **Invoice** | Bill ki PDF/jaabte record | "Gst wala bill" |
| **Event** | Kuch bhi hua → ek message | "Live commentary" — webhook ke through aata hai |

### 2.2 PaymentIntent — lifecycle (deep knowledge)

```
  create ──► requires_payment_method ──► requires_confirmation
                                              │
                              confirm() ◄─────┘
                                              │
                                              ▼
                          ┌── requires_action  (3DS/OTP chahiye)
                          │         │
                          │    user ne OTP enter kiya
                          │         ▼
                          ▼   processing ──► succeeded
              requires_payment_method   (ya)  ▲
                      ▲                       │
                      └─────── failed ◄────────┘
                              (card declined)
```

- **`client_secret`** — frontend ko do, wahi browser par payment confirm karta hai. Ye secret hota hai (customer ke session mein hi kaam karta hai).
- **`requires_action`** — yahan 3D Secure / OTP wala step aata hai. Stripe Elements khud UI dikhata hai.
- **Idempotency key** — same request 2 baar mat chalao, warna 2 baar paisa kat jayega.

```ts
await stripe.paymentIntents.create(
  { amount: 49900, currency: "inr", customer: cusId },
  { idempotencyKey: `order-${orderId}` }   // 🛡 retry par duplicate charge nahi hoga
);
```

### 2.3 Webhook kyun zaroori hai?

```
❌ Galat tarika (client trust karna):
   Browser ──"payment ho gaya!"──► tumhara server ──► premium unlock
   (user ne network tab se request forge kar di → free premium)

✅ Sahi tarika (Stripe par bharosa):
   Stripe server ──signed webhook──► /api/webhooks/stripe ──► DB update
   (browser ka koi role nahi, sab server-to-server)
```

> **Rule #1:** *User ko kabhi mat poocho "payment ho gaya kya?" — Stripe se poocho.*

### 2.4 App Router ke liye kya special hai?

| Next.js concept | Stripe mein kya use hota hai |
|-----------------|------------------------------|
| Route Handler (`app/api/*/route.ts`) | Checkout create + **Webhook receive** |
| Server Action | Secure server-side calls (checkout, portal) |
| Client Component | Stripe **Elements**, `confirmPayment()` |
| `process.env` (server only) | `STRIPE_SECRET_KEY` — kabhi client par nahi |
| `NEXT_PUBLIC_*` | Sirf `STRIPE_PUBLISHABLE_KEY` |
| Server-only import | `import "server-only"` se secret leak impossible |
| Route segment config | `export const runtime = "nodejs"` (Stripe SDK Node chahiye) |

---

## 3. ⚡ Payment flow ke 3 tarike — kaunsa kab use karein?

| Feature | **Payment Intents + Elements** | **Checkout Session** | **Billing (Subscriptions)** |
|---------|-------------------------------|----------------------|-----------------------------|
| UI | Tumhara apna page (full control) | Stripe ka hosted page | Stripe hosted + portal |
| Banane ka effort | Zyada | ⭐ Bahut kam | Medium |
| Card data tumhare server par | Kabhi nahi (Elements PCI-friendly) | Kabhi nahi | Kabhi nahi |
| Use case | Custom checkout, marketplace | Simple buy button, donation | SaaS plans, memberships |
| SCA/3DS handling | Auto (Elements ke andar) | Auto | Auto |
| Kahan redirect hota hai | Tumhari site par hi rehta hai | `checkout.stripe.com` par redirect | Redirect + `customer.portal` |

```
Decision tree:

Kya tumhe recurring (monthly/yearly) chahiye?
   ├─ HAAN ──► Stripe Billing (Subscription + Customer Portal)
   └─ NAI ──► Tumhara khud ka checkout page chahiye?
                  ├─ HAAN ──► Payment Intents + Stripe Elements
                  └─ NAI  ──► Checkout Session (fastest)
```

---

## 4. 🛠 Project setup — Next.js + Stripe

### 4.1 Install

```bash
# Server side (Node SDK) + Client side (JS + React wrappers)
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

| Package | Kahan chalta hai | Kaam |
|---------|------------------|------|
| `stripe` | **Server only** (Route Handler / Action) | Secret key se API calls |
| `@stripe/stripe-js` | Browser | `loadStripe()` → publishable key |
| `@stripe/react-stripe-js` | Browser (React) | `<Elements>`, `<PaymentElement>` |

### 4.2 Environment variables

```bash
# .env.local   (⚠️ .env ko kabhi commit mat karo — .gitignore mein rakho)
STRIPE_SECRET_KEY=sk_test_51N...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51N...
STRIPE_WEBHOOK_SECRET=whsec_...
```

```ts
// lib/stripe.ts
import "server-only"                    // 🛡 build time par hi client bundle se bahar
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",             // pin karo — warna SDK update se code toot sakta hai
  typescript: true,
  appInfo: { name: "My Learning Repo" },
})
```

```ts
// lib/stripe-client.ts  (client component ke liye)
"use client"
import { loadStripe, Stripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null> | null = null
export const getStripe = () =>
  (stripePromise ??= loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!))
```

> 💡 **Tip:** `loadStripe()` ko module level par call mat karo — `<StripeProvider>` ke andar lazily karo taaki har render par na chale.

### 4.3 Folder structure (is repo ka plan)

```
stripe/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts        # POST → Checkout Session banao + URL return
│   │   ├── payment-intent/route.ts  # POST → PaymentIntent banao (Elements flow)
│   │   ├── portal/route.ts          # POST → Customer Portal session
│   │   └── webhooks/
│   │       └── stripe/route.ts      # POST ← Stripe events (signature verify!)
│   ├── pricing/page.tsx             # Plans dikhao + Buy button
│   ├── checkout/page.tsx            # Client component: <Elements> + <PaymentElement>
│   ├── success/page.tsx             # Redirect target (webhook se verify!)
│   └── layout.tsx
├── components/
│   ├── CheckoutForm.tsx             # "use client" → useStripe/useElements
│   └── BuyButton.tsx
├── lib/
│   ├── stripe.ts                    # server stripe instance
│   ├── stripe-client.ts             # browser loadStripe
│   └── db.ts                        # orders/subscriptions table
├── .env.local
├── .env.example
├── README.md
└── package.json
```

---

## 5. 💳 Stripe Integration in Next.js — Code

### 5.1 Flow A — Checkout Session (sabse aasan, redirect wala)

**Step 1 — Server par session banao** (Server Action ya Route Handler):

```ts
// app/api/checkout/route.ts
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const { priceId, customerId } = await req.json()

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",                     // "payment" = one-time
      customer: customerId,                     // cus_xxx
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      allow_promotion_codes: true,
      // metadata: { orderId: "123" },          // webhook mein wapas mil jayega
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[checkout]", err)
    return NextResponse.json({ error: "Session create nahi hua" }, { status: 500 })
  }
}
```

**Step 2 — Client se call karo aur redirect karo:**

```tsx
// components/BuyButton.tsx
"use client"
import { useState } from "react"

export function BuyButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const { url } = await res.json()
      window.location.href = url          // Stripe hosted page par redirect 🚀
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? "Redirect ho raha hai..." : "₹499 — Abhi kharido"}
    </button>
  )
}
```

> **Flow:** tumhara page → `/api/checkout` → `checkout.stripe.com/...` → card bharo → `yourapp.com/success`. Beech ka card form **Stripe khud render karta hai**, tumhaare HTML mein ek line bhi nahi.

### 5.2 Flow B — Payment Intents + Elements (custom UI)

**Server — client_secret banao:**

```ts
// app/api/payment-intent/route.ts
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const { amount, currency = "inr", orderId } = await req.json()

  const intent = await stripe.paymentIntents.create(
    { amount, currency, automatic_payment_methods: { enabled: true } },
    { idempotencyKey: `order-${orderId}` },
  )

  return NextResponse.json({ clientSecret: intent.client_secret })
}
```

**Client — Elements + confirm:**

```tsx
// app/checkout/page.tsx
"use client"
import { useEffect, useState } from "react"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe-client"

function InnerForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [msg, setMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${location.origin}/success` },
      redirect: "if_required",     // UPI/card jahan possible, wahan page hi mat chhodo
    })

    if (error) setMsg(error.message ?? "Payment fail")
    else if (paymentIntent?.status === "succeeded") setMsg("✅ Payment success!")
    else setMsg(`Status: ${paymentIntent?.status}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Pay</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("")

  useEffect(() => {
    fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 49900, orderId: "ord_1" }),
    })
      .then((r) => r.json())
      .then((d) => setClientSecret(d.clientSecret))
  }, [])

  if (!clientSecret) return <p>Loading…</p>

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <InnerForm />
    </Elements>
  )
}
```

### 5.3 Flow C — Subscription + Customer Portal

```ts
// app/api/portal/route.ts  — user apna plan cancel/update khud kar sake
export async function POST(req: Request) {
  const { customerId, returnUrl } = await req.json()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? process.env.NEXT_PUBLIC_APP_URL,
  })

  return NextResponse.json({ url: session.url })
}
```

**Products/Prices Dashboard se banao** (ya code se):

```ts
const product = await stripe.products.create({ name: "Pro Plan" })
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 49900,          // ₹499.00 → paise mein (aise hi har currency!)
  currency: "inr",
  recurring: { interval: "month" },
})
```

> ⚠️ **`unit_amount` hamesha smallest currency unit mein** — INR/USD = paise/cents. `49900` = ₹499.00. `499` = ₹4.99 (galti se chhota daam!).

---

## 6. 🪝 Webhooks — Asli Dil ka hissa

### 6.1 Kya handle karna chahiye?

| Event | Kab aata hai | Tumhe kya karna hai |
|-------|--------------|---------------------|
| `checkout.session.completed` | User ne payment successfully kar li | Order/subscription ko `active` karo |
| `checkout.session.async_payment_failed` | UPI/jaisa async payment fail | Order `failed`, user ko mail |
| `payment_intent.succeeded` | Ek charge success | Access dena |
| `payment_intent.payment_failed` | Card declined | Retry prompt + dikhao kyun |
| `invoice.paid` | Har renewal cycle bhar gaya | Subscription extend karo |
| `invoice.payment_failed` | Renewal fail (card expired) | Dunning email, grace period |
| `customer.subscription.updated` | Plan upgrade/cancel hua | DB sync karo |
| `customer.subscription.deleted` | Subscription khatam | Access hatao |
| `charge.refunded` | Refund mila | Access wapas lo, order update |

### 6.2 Code — signature verify karte hue

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

export const runtime = "nodejs"   // Stripe SDK ko Node chahiye

export async function POST(req: Request) {
  const body = await req.text()                       // ⚠️ RAW text — JSON.parse mat karo!
  const signature = (await headers()).get("stripe-signature")

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!,             // whsec_... (dashboard se aata hai)
    )
  } catch (err) {
    console.error("❌ Signature verify fail:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      // ✅ session.customer / session.subscription se IDs lo
      // ✅ DB mein order ko paid karo, premium unlock karo
      break
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      // ⏳ dunning email bhejo
      break
    }
    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  return Response.json({ received: true })            // 200 fast do, warna Stripe retry karega
}
```

**3 golden rules:**

1. **Raw body lo** (`await req.text()`), `req.json()` se signature toot jata hai.
2. **`constructEvent` / `constructEventAsync`** hi verify karta hai ki request sach mein Stripe se aayi hai (HMAC signature).
3. **`return Response.json({received:true})`** jaldi do — 3 second se der ho toh Stripe event 3 baar retry karta hai (usse duplicate processing).

> 💡 **Handler ko idempotent banao:** Stripe same event **kabhi-kabhi do baar** bhej sakta hai. `event.id` ko DB mein store karo aur pehle check karo — warna 2 baar access mat do.

---

## 7. 📊 Diagram Explanations

### 7.1 Checkout Session flow (redirect)

```
  Browser (Next.js)            Your Server              Stripe                 DB
        │                          │                      │                    │
        │  1. "Buy" click          │                      │                    │
        ├─────────────────────────►│                      │                    │
        │                          │ 2. checkout.sessions │                    │
        │                          │    .create()         │                    │
        │                          ├─────────────────────►│                    │
        │                          │ 3. { url }           │                    │
        │                          │◄─────────────────────┤                    │
        │  4. { url }              │                      │                    │
        │◄─────────────────────────┤                      │                    │
        │ 5. window.location.href  │                      │                    │
        │──────────────────────────────────────────────►│                    │
        │                          │                      │                    │
        │  6. card + OTP form (Stripe-hosted)             │                    │
        │──────────────────────────────────────────────►│                    │
        │                          │  7. charge success   │                    │
        │                          │◄─────────────────────┤                    │
        │                          │                      │                    │
        │  8. redirect → /success?session_id=...          │                    │
        │◄───────────────────────────────────────────────┤                    │
        │                          │                      │                    │
        │                          │  9. POST /api/webhooks/stripe (signed)    │
        │                          │◄─────────────────────┤                    │
        │                          │ 10. verify signature │                    │
        │                          │ 11. order = "paid"    │                    │
        │                          ├───────────────────────────────────────────►│
        │                          │ 12. 200 {received}   │                    │
        │                          ├─────────────────────►│                    │
```

> ⚠️ **Step 9, step 8 se bharosemand hai.** `/success` page par user aa sakta hai bina pay kiye (URL type karke) — isliye **sirf webhook ke basis par** DB update karo, success page ke basis par nahi.

### 7.2 Webhook request structure

```
POST /api/webhooks/stripe
Headers:
  stripe-signature: t=1718000000,v1=8a3f...   ◄── t = timestamp, v1 = HMAC-SHA256

Body: RAW JSON
{ "id": "evt_1N...", "type": "checkout.session.completed", "data": { "object": {...} } }

Server kya karta hai:
  expected = HMAC(rawBody + timestamp, whsec_xxx)
  actual   = header ka v1
  match?   ✅ → process   ❌ → 400 (koi aur Stripe ke naam se request bhej raha tha)
```

### 7.3 Subscription lifecycle

```
  User ──► Checkout Session (mode: subscription)
                    │
                    ▼
        checkout.session.completed
                    │  (subscription = "trialing" ya "active")
                    ▼
             ┌──────────────┐   invoice.paid    ┌──────────┐
             │   active     │◄─────────────────┤  billing  │  har month auto charge
             └──────┬───────┘                   └──────────┘
       cancel / 3 failed retries                  │
                    ▼                              │ invoice.payment_failed ×3
             ┌──────────────┐                      ▼
             │  canceled /  │◄────────────  past_due → unpaid
             │  canceled    │                  (grace period → access band)
             └──────────────┘

  User Portal se khud plan change kar sakta hai:
  Billing Portal ──► subscription.updated event ──► tumhara DB sync ✅
```

### 7.4 3D Secure / OTP kaise fit hota hai (India focus)

```
  card bharo → stripe.confirmPayment() → RBI 2FA (OTP)
        │
        ▼
  paymentIntent.status = "requires_action"
        │  (Elements OTP modal dikhata hai — tumhara code nahi)
        ▼
  user ne OTP enter kiya
        │
   ┌────┴─────┐
   ▼          ▼
succeeded   requires_payment_method  (galat OTP / fail)
   │              │
   ▼              └──► naya card maango, retry
 fulfil order
```

> India mein har card payment par **2FA (OTP) mandatory** hai. Stripe Elements/Checkout dono ye handle kar lete hain — tumhe alag se OTP UI nahi banana.

### 7.5 Server vs Client responsibility

```
┌─────────────────────────── SERVER (Route Handler / Action) ───────────────────────────┐
│ ✅ secret key rakhna                          ❌ secret key kabhi "use client" file mein│
│ ✅ session/intent create karna                ❌ amount client se andha-andha trust     │
│ ✅ webhook signature verify                   ❌ signature verify bina process karna   │
│ ✅ DB update (order = paid)                   ❌ client ke "success" message par bharosa│
└───────────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────── CLIENT (Browser) ──────────────────────────────────┐
│ ✅ publishable key + clientSecret                                 ❌ secret key       │
│ ✅ <PaymentElement> render + confirmPayment()                      ❌ webhook secret   │
│ ✅ redirect, loading, error states                                 ❌ final access decision│
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. 🔒 Security — galtiyan jo sab karte hain

1. **Secret key client par nahi** — `NEXT_PUBLIC_` sirf publishable key ke liye. Ek baar leak ho jaye toh **Dashboard → Rotate key** turant.
2. **Webhook signature verify kabhi skip mat karo** — warna koi bhi `POST /api/webhooks/stripe` bhejkar apna plan "active" karwa sakta hai.
3. **Amount server par fix karo** — `amount` client se mat lo. `priceId` lo aur server par `prices.retrieve()` se daam nikalo (ya hardcoded rakho).
4. **Success page ≠ payment success** — hamesha webhook/`retrieve` se verify karo.
5. **Idempotency keys** — retry (network flap, double click) par duplicate charge nahi.
6. **`.env.local` git mein nahi** — `.env.example` commit karo, values nahi.
7. **`redirect: "if_required"`** use karo jahan possible — unnecessary redirect = extra bounce, aur `success_url` par user tabhi aaye jab sab real ho.
8. **Amount in smallest unit** — `49900` = ₹499.00.
9. **Webhook endpoint ka `apiVersion` + `event.type` whitelist** — `default:` case mein kuch mat karo.
10. **Refund/chargeback ke liye `charge.refunded`** handler rakhna bhoolo toh user ka access cancel hone ke baad bhi chalta rahega.

---

## 9. 🌍 Real-Life Usages

| Scenario | Kaunsa flow | Kaise |
|----------|-------------|-------|
| 🛍 **E-commerce one-time order** | Checkout Session (`mode: "payment"`) | `metadata.orderId` → webhook mein order paid |
| 📱 **App Store style digital purchase** | Payment Intents + Elements | Apne UI mein, `redirect: "if_required"` |
| 💰 **SaaS monthly plan (₹499/mo)** | Billing: Subscription + `invoice.paid` | Har month access check `subscription.status === "active"` |
| 🎓 **Course + 1 year access** | Subscription yearly ya timed entitlement | Webhook se `expiresAt` set karo |
| 🤝 **Marketplace (2 parties ko paisa)** | **Stripe Connect** | Platform fee split, `destination_charges` |
| 🎁 **Donation (variable amount)** | Checkout Session + `allow_promotion_codes` ya Elements | User khud amount daale |
| 📦 **Usage-based billing (API calls)** | Metered Price + Usage Records | `subscriptionItems.createUsageRecord()` |
| 🔁 **Freelance/retainer invoice** | Invoice + hosted invoice link | Client ko mail, card se bhare |
| 🆓 **Free trial, card upfront** | Subscription with `trial_period_days` | `invoice.paid` tabhi jab trial khatam |
| 🏪 **POS / offline + online sync** | Stripe Terminal | Same inventory, alag channel |
| 🧾 **GST invoice India mein** | Checkout `custom_text` / Tax Rates | Stripe Tax se automatic tax |
| 🪝 **Dunning (failed renewal recover)** | `invoice.payment_failed` | Email series + grace period |

**Ek real product ka flow (Netflix-jaisa SaaS):**

```
Pricing page → Buy button → /api/checkout (mode: subscription)
   → Stripe Checkout → card + OTP → webhook checkout.session.completed
   → DB: user.plan = "pro", renewalDate = subscription.current_period_end
   → har mahine invoice.paid → extend
   → user "Cancel" → Billing Portal → webhook subscription.deleted → plan = "free"
```

---

## 10. 🧪 Testing & Debugging

### Test cards (test mode — asli paisa nahi katega)

| Card | Kya hota hai |
|------|--------------|
| `4242 4242 4242 4242` | ✅ Success (koi OTP nahi — test mode) |
| `4000 0025 0000 3155` | ⚠️ 3D Secure → OTP flow test (`111111` OTP) |
| `4000 0000 0000 9995` | ❌ Insufficient funds |
| `4000 0000 0000 0002` | ❌ Card declined |
| Future date + random CVV | — | 
| Currency `inr`, any future expiry | — |

> Test mode ke liye alag keys: `sk_test_` / `pk_test_`. Production keys **kabhi** dev machine par mat rakho.

### Local par webhook kaise test karein?

Stripe dashboard se request nahi aayegi localhost par — **Stripe CLI** chahiye:

```bash
stripe login                                  # ek baar
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# → ye aapko whsec_... de dega → .env.local mein daalo, server restart

stripe trigger checkout.session.completed     # manual event bhejo
```

> ⚠️ **`stripe listen` har baar naya `whsec_` de sakta hai** — naya aaye toh `.env.local` update karo, warna "Invalid signature".

### Debug checklist

```
400 Invalid signature  → raw body liya? webhook_secret match? (CLI vs dashboard endpoint)
Card doesn't appear    → publishable key sahi? <Elements> wrap kiya? getStripe() awaited?
"price not found"      → test key + test price ID? (test aur live alag hote hain)
amount invalid         → smallest unit? integer hai (float nahi)?
No webhook hitting     → `stripe listen` chal raha? route POST export hai? body read ki?
session create 400     → price + customer same mode ke? (test/live mismatch)
```

**Logs:** Stripe Dashboard → **Developers → Logs** mein har API call + failure reason dikhta hai — pehle yahan dekho.

---

## 11. ⚠️ Common Mistakes & FAQ

| # | Galti | Sahi jawab |
|---|-------|-----------|
| 1 | `req.json()` se webhook body lena | `await req.text()` — raw chahiye |
| 2 | Client ke "payment done" par DB update | Sirf webhook se confirm karo |
| 3 | `amount: 499` likh diya (₹499 samajh kar) | `49900` — smallest unit |
| 4 | `console.log(stripe)` — secret log mein | Logger config mein redact karo |
| 5 | Subscription ka status check sirf create time par | Har request par `subscriptions.retrieve()` / DB sync |
| 6 | Webhook mein heavy kaam (email, image) | 200 jaldi do, kaam queue/baad mein |
| 7 | `success_url` par entitlement dena | Redirect sirf UX ke liye, authority webhook ki |
| 8 | Prod key repo ke `.env` mein commit | `.gitignore` + key rotate |
| 9 | Test/live price ID mix | `price_test_...` = test mode only |
| 10 | Idempotency skip | `idempotencyKey` har create call par |

**FAQ (interview ke liye):**

- **Q: Stripe ko card details kaise milti hain bina mere server ke?**
  → Elements/Checkout browser se Stripe ke iframe mein card capture karta hai → tumhe sirf `PaymentMethod` token/`clientSecret` milta hai. Tum **SAQ-A** (sabse chhota PCI scope) mein aate ho.

- **Q: Webhook vs polling?**
  → Polling = har 10 sec DB check (latency + load). Webhook = Stripe push karta hai (instant, signed, retried). Webhook hi standard hai.

- **Q: `client_secret` aur `whsec_` mein farq?**
  → `client_secret` = ek specific payment confirm karne ka token (customer ke browser ke liye). `whsec_` = webhook signature verify karne ka shared secret (sirf server). Dono secret hain, dono kabhi client par nahi.

- **Q: Paise kitne din mein milte hain?**
  → Standard payout schedule (rolling T+2/T+7 jaisa country-wise). Ye **Stripe ka bank settlement** hai, app logic nahi — Dashboard → Balance dikhta hai.

- **Q: Currency kaise set karein?**
  → `currency: "inr"` + `unit_amount` paise mein. Checkout mein country ke hisaab se alag currencies bhi de sakte ho (`automatic_currency`).

---

## 12. 🗃 Quick Cheat Sheet

```ts
import { stripe } from "@/lib/stripe"                 // server only

// 1. One-time payment (hosted)
stripe.checkout.sessions.create({ mode: "payment", line_items: [{ price, quantity: 1 }],
  success_url, cancel_url })

// 2. Subscription (hosted)
stripe.checkout.sessions.create({ mode: "subscription", line_items: [{ price, quantity: 1 }],
  success_url, cancel_url })

// 3. Custom UI
stripe.paymentIntents.create({ amount: 49900, currency: "inr",
  automatic_payment_methods: { enabled: true } })      // → clientSecret

// 4. Customer (N+1 order ke liye reuse)
stripe.customers.create({ email, name })

// 5. Portal (user khud manage kare)
stripe.billingPortal.sessions.create({ customer, return_url })

// 6. Refund
stripe.refunds.create({ charge: chargeId, amount: 49900 })

// 7. Webhook verify
stripe.webhooks.constructEventAsync(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
```

| Kaam | Kya use karo |
|------|--------------|
| Ek baar ka payment, simple | **Checkout Session** |
| Custom design checkout | **Payment Intents + Elements** |
| Monthly/yearly plan | **Billing (Subscription)** |
| User khud plan badle/cancel kare | **Customer Portal** |
| 2-sided payment (platform) | **Stripe Connect** |
| Fail hua payment | **`invoice.payment_failed` + dunning** |
| Local webhook testing | **Stripe CLI `stripe listen`** |

---

## 13. 🏃 Running this project

```bash
# 1. deps
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# 2. .env.local bharo (test keys — https://dashboard.stripe.com/test/apikeys)

# 3. dev server
npm run dev
# → http://localhost:3000

# 4. (alag terminal) webhook forwarder
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Env variables:**

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # stripe listen se
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 14. 📝 Practice Tasks (homework)

1. ☐ Checkout Session flow banao — pricing page + buy button + `/success`
2. ☐ Webhook handler likho jo `checkout.session.completed` par DB mein order `paid` kare (Stripe CLI se trigger karke test)
3. ☐ Signature verify **galat** secret ke saath 400 aa raha hai — prove karo (negative test)
4. ☐ Payment Intents + `<PaymentElement>` wala custom checkout page banao
5. ☐ Subscription plan + Customer Portal se cancel flow complete karo
6. ☐ Failed renewal (`invoice.payment_failed`) par grace period + email log lagao
7. ☐ `charge.refunded` webhook se access auto-revoke karo
8. ☐ **Bonus:** Stripe Connect se marketplace split payment demo banao

---

## 📚 Resources

- [Stripe Docs](https://docs.stripe.com/payments/quickstart) — official, bahut accha likha hai
- [Stripe Testing](https://docs.stripe.com/testing) — test cards
- [Stripe CLI](https://docs.stripe.com/stripe-cli) — local webhooks
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Stripe x Next.js guide](https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=elements)
- [PCI Compliance (SAQ-A)](https://stripe.com/docs/security/stripe-compliance)

---

> 🙏 **Note:** Ye ek **learning repo** hai — code snippets production-quality hain par simplified. Real product mein: error monitoring (Sentry), queue for webhook side-effects, aur har price ID config/DB se lo hardcoded mat rakho.
>
> Happy shipping! 💸
