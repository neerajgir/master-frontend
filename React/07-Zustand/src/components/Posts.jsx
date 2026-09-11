import {useEffect} from 'react'
import {usePostStore} from '../store/postStore.js'

const Posts = () => {
    const {posts, loading, error, fetchPosts} = usePostStore();
    useEffect(()=>{
        fetchPosts();
    },[fetchPosts])

    if(loading) return <div>Loading...</div>
    if(error) return <div>Error: {error}</div>
  return (
    <ul>
        {posts.map((post)=>(
            <li key={post.id}>{post.title}</li>
        ))}
    </ul>
  )
}

export default Posts