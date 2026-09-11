import { useCounterStore } from '../store/counterStore.js'

const Counter = () => {
    const {count, increment, decrement, reset} = useCounterStore();
  return (
    <div>
        <h2>Counter: {count}</h2>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
    </div>
  )
}

export default Counter