import {FaShoppingCart} from 'react-icons/fa'

const ProductCart = ({product, onAddToCart}) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product)}>
        <FaShoppingCart/> Add to Cart
      </button>
    </div>
  )
}

export default ProductCart