"use server";

import { redirect } from "next/navigation";
import { authenticateUser } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    redirect("/auth?error=campos");
  }

  try {
    const user = await authenticateUser(username, password);

    if (!user) {
      redirect("/auth?error=credenciales");
    }

    await createSession({
      userId: user.id,
      username: user.username,
    });
  } catch {
    redirect("/auth?error=servidor");
  }

  redirect("/dashboard");
}
