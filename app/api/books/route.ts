import { connectDB } from "@/lib/db";
import Book from "@/models/Book";
import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");

  const query: any = { user: userId };
  if (status) query.status = status;
  if (tag) query.tags = tag;

  const books = await Book.find(query).sort({ createdAt: -1 });
  return NextResponse.json(books);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, author, tags, status } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await connectDB();

  const book = await Book.create({
    title,
    author,
    tags,
    status,
    user: userId,
  });

  return NextResponse.json(book, { status: 201 });
}