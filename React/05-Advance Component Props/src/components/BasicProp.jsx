import { useState } from "react";

function Button({text, color, size, onClick, disabled}){
    return(
      <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium transition-all duration-300 
      ${size === 'small' ? "text-sm px-3 py-1" : ""}
      ${size === 'large' ? "text-lg px-8 py-3" : ""}
      ${!size || size === 'medium' ? "text-base px-6 py-2" : ""}
      ${color === 'primary' && !disabled ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
      ${color === 'secondary' && !disabled ? "bg-gray-500 hover:bg-gray-600 text-white" : ""}
      ${color === 'danger' && !disabled ? "bg-red-500 hover:bg-red-600 text-white" : ""}
      ${color === 'success' && !disabled ? "bg-green-500 hover:bg-green-600 text-white" : ""}
      ${disabled && color === 'primary' ? "bg-blue-300 text-white cursor-not-allowed opacity-60" : ""}
      ${disabled && color === 'secondary' ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60" : ""}
      ${disabled && color === 'danger' ? "bg-red-300 text-white cursor-not-allowed opacity-60" : ""}
      ${disabled && color === 'success' ? "bg-green-300 text-white cursor-not-allowed opacity-60" : ""}
      ${!disabled ? "cursor-pointer" : ""}
      `}
      >{text}</button>
    )
}

const BasicProp = () => {
  const [clickCount, setClickCount] = useState(0)
  // New state to dynamically manage button status
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <section className="p-8 bg-white rounded-xl shadow-2xl max-w-4xl mx-auto my-8 border border-gray-100">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">Basic Props</h2>
      <p className="text-gray-600 mb-6">
        Props allow you to pass data and event handlers from a parent component down to a child component, making your UI elements highly reusable.
      </p>

      {/* Controller Controls: Toggle Enable / Disable */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg flex flex-wrap items-center gap-4 border border-blue-100">
        <span className="text-sm font-semibold text-blue-900">
          Dynamic Control State: <span className="underline">{isDisabled ? "Disabled 🛑" : "Enabled ✅"}</span>
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsDisabled(true)} 
            className="px-4 py-1.5 text-sm bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
          >
            Disable Buttons
          </button>
          <button 
            onClick={() => setIsDisabled(false)} 
            className="px-4 py-1.5 text-sm bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
          >
            Enable Buttons
          </button>
        </div>
      </div>
      
      {/* Section 1: Different Colors */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center justify-between">
          <span>Different Colors (Controlled by State)</span> 
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono">Clicks: {clickCount}</span>
        </h3>
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
          <Button text="Primary button" color="primary" disabled={isDisabled} onClick={()=>setClickCount(clickCount + 1)}/>
          <Button text="Secondary button" color="secondary" disabled={isDisabled} onClick={()=>setClickCount(clickCount + 1)}/>
          <Button text="Danger button" color="danger" disabled={isDisabled} onClick={()=>setClickCount(clickCount + 1)}/>
          <Button text="Success button" color="success" disabled={isDisabled} onClick={()=>setClickCount(clickCount + 1)}/>
        </div>
      </div>
      
      {/* Section 2: Different Sizes & Hardcoded Disabled States */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center justify-between">
          <span>Different Sizes & Fixed States</span>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono">Clicks: {clickCount}</span>
        </h3>
        <div className="flex flex-wrap gap-3 items-center p-4 bg-gray-50 rounded-lg">
          <Button text="Small" color="primary" size="small" onClick={()=>setClickCount(clickCount + 1)}/>
          <Button text="Always Disabled" color="secondary" size="large" disabled={true} onClick={()=>setClickCount(clickCount + 1)}/>
          <Button text="Dynamic Size" color="danger" size="medium" disabled={isDisabled} onClick={()=>setClickCount(clickCount + 1)}/>
          <Button text="Success button" color="success" onClick={()=>setClickCount(clickCount + 1)}/>
        </div>
      </div>
    </section>
  )
}

export default BasicProp;
