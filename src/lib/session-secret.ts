export function getSessionSecretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET no está definido en las variables de entorno.");
  }

  return new TextEncoder().encode(secret);
}
