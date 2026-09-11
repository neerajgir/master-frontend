import { useCart } from "./hooks/useCart.js"
import {products} from "./data/product.js"
import ProductCart from "./components/ProductCart.jsx"
import Cart from "./components/Cart.jsx"

const App = () => {
  const { cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice, } = useCart()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">🛍️ Shopping Cart</h1>
          <p className="text-slate-600 mt-2">Custom Hooks Example with Tailwind CSS</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product) => (
                <ProductCart key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
          <section className="lg:col-span-1">
            <div className="sticky top-20">
              <Cart cart={cart} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} clearCart={clearCart} totalItems={totalItems} totalPrice={totalPrice} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App