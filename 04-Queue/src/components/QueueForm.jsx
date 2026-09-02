import React from 'react'
import { useState } from 'react'
import {FaUserPlus} from "react-icons/fa"

const QueueForm = ({onAdd}) => {
    const [name, setName] = useState('')
    const [service, setService] = useState('')
    const handleSubmit = (e)=>{
        e.preventDefault()
        if(!name.trim() || !service.trim()) return
        onAdd({name, service})
        setName('')
        setService('')
    }
  return (
    <div>
        <form onSubmit={handleSubmit}>
            <h2>Add To Queue</h2>
            <div>
                <input type="text" placeholder="Customer Name" value={name} onChange={(e)=>setName(e.target.value)}/>
            </div>
            <div>
                <select value={service} onChange={(e)=>setService(e.target.value)}>
                    <option value="">Select Service</option>
                    <option value="consultation">Consultation</option>
                    <option value="payment">Payment</option>
                    <option value="support">Support</option>
                </select>
            </div>
            <button type="submit">
                <FaUserPlus/> Add Customer</button>
        </form>

    </div>
  )
}

export default QueueForm