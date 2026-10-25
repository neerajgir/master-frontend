"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  createPost,
  getAllPost,
  updatePost,
  deletePostById,
} from "@/actions/post-action";

type Post = {
  id: string;
  title: string;
  content: string | null;
  updatedAt?: string | Date;
};

export default function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPost();
      setPosts(data as Post[]);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("content", content.trim());

    startTransition(async () => {
      try {
        if (editingId) {
          await updatePost(editingId, formData);
          setMessage("Post updated successfully!");
        } else {
          await createPost(formData);
          setMessage("Post created successfully!");
        }

        resetForm();
        await loadPosts();
      } catch (error) {
        console.error(error);
        setMessage("Operation failed. Check the console.");
      }
    });
  }

  function handleEdit(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content ?? "");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      try {
        await deletePostById(id);

        if (editingId === id) resetForm();

        setMessage("Post deleted successfully!");
        await loadPosts();
      } catch (error) {
        console.error(error);
        setMessage("Failed to delete post.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
            Next.js + Prisma
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Posts CRUD
          </h1>
          <p className="mt-3 text-slate-400">
            Create, read, update, and delete posts from your database.
          </p>
        </header>

        {/* Create / Update Form */}
        <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Post" : "Create New Post"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-slate-400 hover:text-white"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Title *
              </label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something about your post..."
                rows={5}
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Processing..."
                : editingId
                  ? "Save Changes"
                  : "Create Post"}
            </button>
          </form>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className="mt-5 rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-200"
            >
              {message}
            </p>
          )}
        </section>

        {/* Read Posts */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">All Posts</h2>
              <p className="mt-1 text-sm text-slate-400">
                {posts.length} {posts.length === 1 ? "post" : "posts"} found
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadPosts()}
              disabled={loading || isPending}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-400">
              Loading posts...
            </p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-12 text-center">
              <p className="text-lg font-semibold">No posts yet</p>
              <p className="mt-2 text-slate-400">
                Create your first post using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="wrap-break-words text-xl font-semibold">
                      {post.title}
                    </h3>
                    <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                      #{post.id}
                    </span>
                  </div>

                  <p className="mb-6 min-h-12 whitespace-pre-wrap-break-words text-sm leading-6 text-slate-400">
                    {post.content || "No content provided."}
                  </p>

                  {post.updatedAt && (
                    <p className="mb-5 text-xs text-slate-500">
                      Updated:{" "}
                      {new Date(post.updatedAt).toLocaleString()}
                    </p>
                  )}

                  <div className="flex gap-3 border-t border-slate-800 pt-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(post)}
                      disabled={isPending}
                      className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      disabled={isPending}
                      className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
