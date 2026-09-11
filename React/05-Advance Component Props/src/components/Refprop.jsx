import {useRef, forwardRef} from 'react'

//input component accept ref 
const CustomInput = forwardRef(({label, placeholder, className}, ref) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
      ref={ref} 
      type="text"
      placeholder={placeholder}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} 
      />
    </div>
  )
})

CustomInput.displayName = 'CustomInput'

const Refprop = () => {
  const inputRef = useRef(null)
  const secondInputRef = useRef(null)
  const focusInput = ()=>{
    inputRef.current?.focus();
  }
  const getInputValue = ()=>{
    if(inputRef.current){
      alert(`Input Value: ${inputRef.current.value}`)
    }
  }
  const clearInputValue = ()=>{
    if(inputRef.current){
      inputRef.current.value = ''
      inputRef.current.focus();
    }
  }
   const focusSecondInput = ()=>{
    secondInputRef.current?.focus();
  }
  return (
    <section className="p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ref Props</h2>
      <p className="text-gray-600 mb-6">Refs provide a way to access DOM nodes or React elements directly. Use{" "}
     <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded">forwardRef</code> to pass refs to custom components.
      </p>
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Try it out</h3>
          <CustomInput
          ref={inputRef}
          label="First Input with ref"
          placeholder="Type something..."
          />
          <CustomInput
          ref={secondInputRef}
          label="Second Input with ref"
          placeholder="Type something else..."
          />
          <div className="flex flex-wrap gap-3 mt-4">
            <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={focusInput}
            >Focus First Input</button>
            <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={focusSecondInput}
            >Focus Second Input</button>
            <button
              onClick={getInputValue}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Get First Input Value
            </button>
            <button
              onClick={clearInputValue}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Clear First Input
            </button>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h4 className="font-semibold text-gray-800 mb-2">
            When to use refs:
          </h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Managing focus, text selection, or media playback</li>
            <li>Triggering imperative animations</li>
            <li>Integrating with third-party DOM libraries</li>
            <li>Accessing DOM measurements (scroll position, element size)</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Refprop