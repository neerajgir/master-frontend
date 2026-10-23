"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

async function addPost(newPost) {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts",{
        method: "POST",
        body: JSON.stringify(newPost),
        headers: {
            "Content-Type": "application/json"
        }
    });

    return res.json()
}

export default function AddPost() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: addPost,
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey: ["posts"]})
            alert("Post Added")
        },
        onError: (error)=>{
            alert("Something went wrong", error)
        }
    })
    return(
        <button onClick={()=>mutation.mutate({title: "New post by Neeraj", body:"Demo", userId: 1})} className="px-4 py-2 bg-amber-700 text-white rounded-md mt-10">
            Add Post
        </button>
    )
}