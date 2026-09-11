import {useAppStore} from '../store/AppStore.js'

const Nav = () => {
    const user = useAppStore((state) => state.user);
    const theme = useAppStore((state) => state.theme);
    const logout = useAppStore((state) => state.logout);
    const toggleTheme = useAppStore((state) => state.toggleTheme);
  return (
    <nav>
        <span>Theme: {theme}</span>
        <button onClick={toggleTheme}>Toggle Theme</button>
        {user ? (
            <button onClick={logout}>Logout</button>
        ) : (
            <button onClick={() => login('John Doe')}>Login</button>
        )}
        <button onClick={logout}>Logout</button>
       <span>User: {user}</span>
    </nav>
  )
}

export default Nav