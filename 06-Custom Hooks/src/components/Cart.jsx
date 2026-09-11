import CartItem from './CartItem.jsx'

const Cart = ({cart, onRemove, onUpdateQuantity, clearCart, totalItems, totalPrice}) => {
  if(cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Cart Summary</h2>
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">🛒 Your cart is empty</p>
          <p className="text-slate-400 text-sm mt-2">Add items to get started!</p>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Cart Summary</h2>
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Items:</span>
          <span className="font-semibold text-slate-900">{totalItems}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-900 bg-blue-50 p-3 rounded-lg">
          <span>Total:</span>
          <span className="text-blue-600">${typeof totalPrice === 'string' ? totalPrice : totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
          Checkout
        </button>
        <button 
          onClick={clearCart}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Clear Cart
        </button>
      </div>
    </div>
  )
}

export default Cart