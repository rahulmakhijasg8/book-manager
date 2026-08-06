import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;
const user = process.env.MONGODB_USER;
const pass = process.env.MONGODB_PASS;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable in .env.local");
}

// Let TypeScript know `global` can hold our cached connection.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

// Reuse the cache across hot-reloads in dev; initialize it once.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // Already connected — reuse it.
  if (cached!.conn) {
    return cached!.conn;
  }

  // No connection in flight yet — start one and cache the PROMISE.
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, {
      user,
      pass,
      // bufferCommands: false, // optional: fail fast instead of queueing
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    // If the attempt fails, clear the promise so the next call can retry
    // instead of awaiting a permanently-rejected promise.
    cached!.promise = null;
    throw err;
  }

  return cached!.conn;
}