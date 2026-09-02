
const QueueDisplay = ({queue, onUpdateStatus, onRemove}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500'
            case 'in-progress':
                return 'bg-blue-500'
            case 'completed':
                return 'bg-green-500'
            default:
                return 'bg-gray-500'
        }
    }
  return (
    <div>
        <h2>Current Queue</h2>
        {queue.length === 0 ? <p>No customers data</p> : <div>
            {queue.map((customer) => {
                <div key={customer.id}>
                    <div>
                        <h3>{customer?.name}</h3>
                        <p>{customer.service}</p>
                        <span>
                            {customer.status}
                        </span>
                    </div>
                    <div>
                        {customer.status === "waiting" && (
                            <button onClick={()=>onUpdateStatus(customer.id, 'serving')}>Start Service</button>
                        )}
                        {customer.status === "serving" && (
                            <button onClick={()=>onUpdateStatus(customer.id, 'completed')}>Complete</button>
                        )}
                        <button onClick={()=> onRemove(customer.id)}>Remove</button>
                    </div>
                </div>
            })}    
        </div>}
    </div>
  )
}

export default QueueDisplay