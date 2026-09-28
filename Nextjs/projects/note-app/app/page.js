"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]); 
  const [editNote, setEditNote] = useState(null); 

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      } else {
        throw new Error("Failed to fetch notes");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content are required");
      return;
    }
    
    setLoading(true);
    try {
      if (editNote) {
        // Edit flow
        const res = await fetch(`/api/notes/${editNote}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        if (res.ok) {
          await fetchNotes();
          setTitle("");
          setContent("");
          setEditNote(null);
        } else {
          throw new Error("Failed to update note");
        }
      } else {
        // Create flow
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        if (res.ok) {
          await fetchNotes();
          setTitle("");
          setContent("");
        } else {
          throw new Error("Failed to create note");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditNote(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleCancel = () => {
    setEditNote(null);
    setTitle("");
    setContent("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchNotes();
        if (editNote === id) {
          handleCancel();
        }
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">My Notes</h1>
          <p className="text-gray-400">
            Create, view, and manage your notes efficiently.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-gray-900 rounded-xl shadow-md p-6 mb-8 border border-gray-800">
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-yellow-400 mb-2 font-semibold">
                {editNote ? "Edit Title" : "Title"}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Note Title..."
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-gray-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-yellow-400 mb-2 font-semibold">
                {editNote ? "Edit Content" : "Content"}
              </label>
              <textarea
                id="content"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-gray-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-yellow-500 text-gray-950 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving..." : editNote ? "Update Note" : "Add Note"}
              </button>
              {editNote && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notes Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">No notes yet. Add your first note above!</p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-gray-100 mb-2 wrap-break-words">{note.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap wrap-break-words">{note.content}</p>
                </div>
                
                {/* Footer Meta Details & Badge Row */}
                <div className="flex items-center justify-between border-t border-gray-800/60 pt-4 mt-auto">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium transition-all duration-300 bg-gray-800/40 text-gray-400 border border-gray-800/80 hover:bg-orange-950/40 hover:text-orange-400 hover:border-orange-900/50">
                    <span>
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-xs px-3 py-1.5 rounded bg-gray-800 text-yellow-400 hover:bg-yellow-500/10 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="text-xs px-3 py-1.5 rounded bg-gray-800 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
