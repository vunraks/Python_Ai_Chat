"use client";

import { useEffect, useState } from "react";
import { login, register } from "@/app/lib/api";

type Props = {
  onAuth: (token: string) => void;
};

export default function AuthForm({ onAuth }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = isLogin
        ? await login(username, password)
        : await register(username, password);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      if (!isLogin) {
        setToast("Аккаунт успешно создан! Добро пожаловать 🎉");
        setTimeout(() => onAuth(data.access), 2200);
      } else {
        onAuth(data.access);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4 relative">
      {toast && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 toast-enter flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-xl shadow-lg shadow-emerald-900/20"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/30 text-lg">
            ✓
          </span>
          <p className="text-sm font-medium text-emerald-100">{toast}</p>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-violet-500/30">
            AI
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
            Neural Chat
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            {isLogin
              ? "Войди и продолжи диалог с AI"
              : "Создай аккаунт — история сохранится навсегда"}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="glass-card rounded-2xl p-8 space-y-5"
        >
          <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Регистрация
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block uppercase tracking-wider">
                Логин
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-xl px-4 py-3 outline-none text-sm focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block uppercase tracking-wider">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-xl px-4 py-3 outline-none text-sm focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-zinc-600 mt-1.5">
                  Минимум 6 символов
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient text-white py-3 rounded-xl font-medium text-sm"
          >
            {loading
              ? "Загрузка..."
              : isLogin
                ? "Войти в аккаунт"
                : "Создать аккаунт"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Powered by OpenRouter · Django · Next.js
        </p>
      </div>
    </div>
  );
}
