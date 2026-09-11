import {FaShoppingCart} from 'react-icons/fa'

const ProductCart = ({product, onAddToCart}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{product.name}</h3>
        <p className="text-2xl font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</p>
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <FaShoppingCart/> Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCart