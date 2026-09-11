import Button from './Button.jsx'

const Card = (props) => {
    // destructure props = {title, description}
  return (
    <div>
        <div className="max-w-sm w-full h-auto bg-white rounded-xl shadow-md p-6 mt-8 overflow-hidden transition-shadow">
        <img src={props.imageUrl} alt="simple-image" className="w-full h-80" />
        <div className="p-4 ">
        <h2 className="text-lg font-semibold text-gray-800">{props.title}</h2>
        <p className="mt-2 text-gray-600 text-sm">{props.description}</p>
        <Button button="Buy Now" />
      </div>
    </div>
    </div>
  )
}

export default Card