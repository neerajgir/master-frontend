import React from 'react'

const Button = (props) => {
  return (
    <div>
        <button className="mt-4 px-4 rounded-lg py-2 bg-blue-600 text-white hover:bg-blue-700">{props.button}</button>
    </div>
  )
}

export default Button