import { useCounterStore } from '../store/counterStore.js'

const CounterButton = () => {
    const increment = useCounterStore((state)=> state.increment);
    const decrement = useCounterStore((state)=> state.decrement);
  return (
    <div>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
    </div>
  )
}

export default CounterButton