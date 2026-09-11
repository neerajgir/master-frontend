import {FaListUl, FaPlay, FaCheck, FaTrash} from "react-icons/fa"

const initials = (name = '') =>
    name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

const QueueDisplay = ({queue, onUpdateStatus, onRemove}) => {
    const statusClass = (status) => {
        switch (status) {
            case 'waiting':
                return 'status-waiting'
            case 'serving':
                return 'status-serving'
            case 'completed':
                return 'status-completed'
            default:
                return 'status-waiting'
        }
    }
  return (
    <div className="queue-display">
        <h2><FaListUl/> Current Queue <span>{`(${queue.length})`}</span></h2>
        {queue.length === 0 ? (
            <div className="empty-state">
                <p>No customers yet. Add someone to the queue above.</p>
            </div>
        ) : (
            <div className="queue-list">
                {queue.map((customer) => (
                    <div className="customer-card" key={customer.id}>
                        <div className="customer-info">
                            <div className="customer-avatar">{initials(customer.name)}</div>
                            <div className="customer-text">
                                <h3>{customer.name}</h3>
                                <p>{customer.service}</p>
                            </div>
                        </div>
                        <div className="customer-actions">
                            <span className={`status-badge ${statusClass(customer.status)}`}>
                                {customer.status}
                            </span>
                            {customer.status === "waiting" && (
                                <button className="action-btn start" onClick={()=>onUpdateStatus(customer.id, 'serving')}>
                                    <FaPlay/> Start
                                </button>
                            )}
                            {customer.status === "serving" && (
                                <button className="action-btn complete" onClick={()=>onUpdateStatus(customer.id, 'completed')}>
                                    <FaCheck/> Complete
                                </button>
                            )}
                            <button className="action-btn remove" onClick={()=> onRemove(customer.id)}>
                                <FaTrash/> Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export default QueueDisplay