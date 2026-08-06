import jwt from "jsonwebtoken"
import { cookies } from "next/headers";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, secret!, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret!) as { userId: string };
}

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const { userId } = verifyToken(token);
    return userId;
  } catch {
    return null;
  }
}