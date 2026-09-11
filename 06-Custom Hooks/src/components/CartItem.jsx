import {FaTrash, FaMinus, FaPlus} from 'react-icons/fa'

const CartItem = ({item, onUpdateQuantity, onRemove}) => {
  return (
    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
        <p className="text-blue-600 font-semibold text-sm">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          className="bg-slate-200 hover:bg-slate-300 text-slate-900 p-1 rounded transition-colors duration-200"
          title="Decrease quantity"
        >
          <FaMinus size={12}/>
        </button>
        <span className="w-6 text-center font-semibold text-slate-900">{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="bg-slate-200 hover:bg-slate-300 text-slate-900 p-1 rounded transition-colors duration-200"
          title="Increase quantity"
        >
          <FaPlus size={12}/>
        </button>
      </div>
      <button 
        onClick={() => onRemove(item.id)}
        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded ml-2 transition-colors duration-200"
        title="Remove from cart"
      >
        <FaTrash size={14}/>
      </button>
    </div>
  )
}

export default CartItem