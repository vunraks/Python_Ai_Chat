"use client";

import { useEffect, useState } from "react";
import AuthForm from "./components/Auth/AuthForm";
import ChatWindow from "./components/Chat/ChatWindow";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("access_token");
    if (saved) setToken(saved);
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("active_chat_id");
    setToken(null);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-2">
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </div>
    );
  }

  if (!token) {
    return <AuthForm onAuth={setToken} />;
  }

  return <ChatWindow token={token} onLogout={logout} />;
}
