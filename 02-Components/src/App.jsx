import React from 'react'

const App = () => {
  return (
    <div className="font-bold bg-amber-300 text-blue-900 border-2 p-4">Components 
    <h1 className="text-emerald-600 dark:text-sky-600 border-2 p-4 rounded-xl">Welcome To React</h1>
    <div className="max-w-sm w-full h-auto bg-white rounded-xl shadow-md p-6 mt-8 overflow-hidden transition-shadow">
      <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93" alt="simple-image" className="w-full h-80" />
      <div className="p-4 ">
        <h2 className="text-lg font-semibold text-gray-800">Cards</h2>
        <p className="mt-2 text-gray-600 text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit. In, alias!</p>
        <button className="mt-4 px-4 rounded-lg py-2 bg-blue-600 text-white hover:bg-blue-700">Buy Now</button>
      </div>
    </div>
    </div>
  )
}

export default App