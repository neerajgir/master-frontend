import {create} from 'zustand';

export const useAppStore = create((set) => ({
    // auth slice
    user: null,
    login: (user) => set({ user }),
    logout: () => set({ user: null }),
    // theme slice
    theme: 'light',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));