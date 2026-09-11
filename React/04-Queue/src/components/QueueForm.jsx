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
    <div className="queue-form">
        <h2><FaUserPlus/> Add To Queue</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="field">
                    <label htmlFor="customer-name">Customer Name</label>
                    <input id="customer-name" type="text" placeholder="e.g. John Doe" value={name} onChange={(e)=>setName(e.target.value)}/>
                </div>
                <div className="field">
                    <label htmlFor="service-select">Service</label>
                    <select id="service-select" value={service} onChange={(e)=>setService(e.target.value)}>
                        <option value="">Select Service</option>
                        <option value="consultation">Consultation</option>
                        <option value="payment">Payment</option>
                        <option value="support">Support</option>
                    </select>
                </div>
                <button type="submit" className="submit-btn">
                    <FaUserPlus/> Add Customer
                </button>
            </div>
        </form>
    </div>
  )
}

export default QueueForm