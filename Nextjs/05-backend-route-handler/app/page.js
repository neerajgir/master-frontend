"use client"
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const handleSubmit = async(e)=>{
    e.preventDefault();
    const res = await fetch("/api/todo",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({title,completed:false})
    })
    const data = await res.json()
    if(data.success){
      setMessage(`Todo created successfully: ${data.todo.title}`)
      setTitle("")
    }else{
      setMessage(`Failed to create todo: ${data.message}`);
    }
  }
  return (
  <div className="flex flex-col items-center justify-center min-h-screen p-24">
    <h1 className="text-4xl font-bold">Create Todo</h1>
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" className="p-2 border border-gray-300 rounded" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <button type="submit" className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Create</button>
    </form>
    {message && <p className="mt-4 text-sm font-semibold">{message}</p>}
  </div>
  );
}
