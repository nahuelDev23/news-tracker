import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Acceso",
  description: "Inicia sesión en Notipip",
};

interface AuthPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-black text-slate-950">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Notipip</h1>
          <p className="mt-2 text-sm text-slate-400">
            Ingresa tu usuario y contraseña para continuar
          </p>
        </div>
        <LoginForm errorCode={error} />
      </div>
    </div>
  );
}
