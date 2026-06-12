import { getSession } from "@/lib/session";

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}
