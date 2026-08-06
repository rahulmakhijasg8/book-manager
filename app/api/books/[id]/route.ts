import { connectDB } from "@/lib/db";
import Book from "@/models/Book";
import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const updates = await request.json();

  await connectDB();

  const book = await Book.findOne({ _id: id, user: userId });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const allowed = ["title", "author", "tags", "status"];
  for (const key of allowed) {
    if (key in updates) {
      book[key] = updates[key];
    }
  }
  await book.save();

  return NextResponse.json(book);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const book = await Book.findOneAndDelete({ _id: id, user: userId });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}