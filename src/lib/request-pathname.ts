import { headers } from "next/headers";

export async function getRequestPathname(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-pathname") ?? "/";
}
