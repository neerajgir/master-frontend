"use client"
import React, {useState} from 'react'

const ClientComponent = () => {
    const [username, setUsername] = useState("Aadi")
  return (
    <div>
        {username}
        <button onClick={() => setUsername("Neeraj")}>
            Change Name
        </button>
    </div>
  )
}

export default ClientComponent