"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Book = {
  _id: string;
  title: string;
  author?: string;
  tags: string[];
  status: "want-to-read" | "reading" | "completed";
};

const STATUS_LABELS: Record<Book["status"], string> = {
  "want-to-read": "Want to Read",
  reading: "Reading",
  completed: "Completed",
};

const STATUS_STYLES: Record<Book["status"], string> = {
  "want-to-read": "border-amber-300 bg-amber-50 text-amber-800",
  reading: "border-blue-300 bg-blue-50 text-blue-800",
  completed: "border-green-300 bg-green-50 text-green-800",
};

export default function DashboardPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    async function loadBooks() {
      const response = await fetch("/api/books");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setBooks(data);
      setLoading(false);
    }
    loadBooks();
  }, [router]);

  const visibleBooks = books.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (tagFilter && !b.tags.includes(tagFilter)) return false;
    return true;
  });

  const allTags = [...new Set(books.flatMap((b) => b.tags))];

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author: author || undefined,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      }),
    });

    if (response.ok) {
      const newBook = await response.json();
      setBooks([newBook, ...books]);
      setTitle("");
      setAuthor("");
      setTagsInput("");
    }
  }

  async function handleStatusChange(id: string, status: Book["status"]) {
    const previous = books;
    setBooks(books.map((b) => (b._id === id ? { ...b, status } : b)));

    const response = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setBooks(previous);
    }
  }

  async function handleDelete(id: string) {
    const previous = books;
    setBooks(books.filter((b) => b._id !== id));

    const response = await fetch(`/api/books/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setBooks(previous);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Library</h1>
            <p className="text-xs text-gray-500">Your personal reading list</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{books.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total books</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">
              {books.filter((b) => b.status === "reading").length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Reading now</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-3xl font-bold text-green-600">
              {books.filter((b) => b.status === "completed").length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Add a book
          </h2>
          <form onSubmit={handleAddBook} className="flex flex-wrap gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="flex-1 min-w-40 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="flex-1 min-w-40 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags, comma separated"
              className="flex-1 min-w-40 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm"
            >
              Add book
            </button>
          </form>
        </section>

        <section className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm"
          >
            <option value="">All statuses</option>
            <option value="want-to-read">Want to Read</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm"
          >
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {(statusFilter || tagFilter) && (
            <button
              onClick={() => {
                setStatusFilter("");
                setTagFilter("");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear
            </button>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          {loading ? (
            <p className="p-10 text-center text-sm text-gray-500">Loading…</p>
          ) : visibleBooks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-900 font-medium">
                {books.length === 0 ? "Your library is empty" : "No books match"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {books.length === 0
                  ? "Add your first book above to get started."
                  : "Try changing or clearing the filters."}
              </p>
            </div>
          ) : (
            visibleBooks.map((book) => (
              <div
                key={book._id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {book.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {book.author}
                    {book.tags.length > 0 && (
                      <span className="ml-2 text-gray-400">
                        {book.tags.map((t) => `#${t}`).join(" ")}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={book.status}
                    onChange={(e) =>
                      handleStatusChange(
                        book._id,
                        e.target.value as Book["status"]
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium cursor-pointer ${STATUS_STYLES[book.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}