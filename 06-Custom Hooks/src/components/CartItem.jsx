import {FaTrash, FaMinus, FaPlus} from 'react-icons/fa'

const CartItem = ({item, onUpdateQuantity, onRemove}) => {
  return (
    <div>
      div
      <h3>{item.name}</h3>
      <p>${item.price}</p>
      <div>
        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
          <FaMinus/>
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
          <FaPlus/>
        </button>
      </div>
      <button onClick={() => onRemove(item.id)}>
        <FaTrash/>
      </button>
    </div>
  )
}

export default CartItem