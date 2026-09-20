"use client"
import React, {useState} from 'react'


const HomePage = () => {
  const [name, setName] = useState("Neeraj")
  return (
    <div>
      {name}
      <button onClick={() => setName("Neeraj Kumar")}>
        change name
      </button>
    </div>
  )
}


export default HomePage