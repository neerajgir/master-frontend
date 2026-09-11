import {CartItem} from './CartItem.jsx'

const Cart = ({cart, onUpdateQuantity, onRemove, total}) => {
  if(cart.length === 0) {
    return <div>Your cart is empty</div>
  }
  return (
    <div>
      <h2>Shopping Cart</h2>
      {cart.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
      <div>
        <h3>Total: ${typeof total === 'string' ? total : total.toFixed(2)}</h3>
        <button>Checkout</button>
      </div>
    </div>
  )
}

export default Cart