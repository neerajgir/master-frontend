import {create} from 'zustand';

export const usePostStore = create((set) => ({
 posts: [],
 loading: false,
 error: null,
 fetchPosts: async () => {
    set({loading: true, error: null});
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        set({posts: data, loading: false});
    } catch (error) {
        set({error: error.message, loading: false});
    }
 }
}));