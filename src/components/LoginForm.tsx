import { loginAction } from "@/app/auth/actions";

const ERROR_MESSAGES: Record<string, string> = {
  campos: "Usuario y contraseña son obligatorios.",
  credenciales: "Credenciales incorrectas.",
  servidor: "No se pudo iniciar sesión. Revisá la base de datos.",
};

interface LoginFormProps {
  errorCode?: string;
}

export default function LoginForm({ errorCode }: LoginFormProps) {
  const error = errorCode ? ERROR_MESSAGES[errorCode] : undefined;

  return (
    <form action={loginAction} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          suppressHydrationWarning
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          placeholder="admin"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          suppressHydrationWarning
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
