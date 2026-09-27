"use client";
import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if(!title || !content){
      alert("Title and content are required");
      return;
    }
    try {
      setLoading(true)
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        alert("Note created successfully");
      } else {
        throw new Error("Failed to create note");
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false)
    }
  };
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">My Notes</h1>
          <p className="text-gray-400">
            Create, view, and manage your notes efficiently.
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-8 border border-gray-800">
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-yellow-400 mb-2 font-semibold"
              >
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Note Title..."
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg
            focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:gray-500"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-yellow-400 mb-2 font-semibold"
              >
                Content
              </label>
              <textarea
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter Note Content"
                rows={"5"}
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg
            focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:gray-500"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className=" flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                Add Note
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
