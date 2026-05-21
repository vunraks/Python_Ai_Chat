"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex p-4 gap-3 max-w-4xl mx-auto w-full">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        disabled={disabled}
        className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-4 py-3 outline-none text-sm placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 transition-all"
        placeholder={
          disabled ? "Подожди, AI отвечает..." : "Напиши сообщение..."
        }
      />

      <button
        onClick={send}
        disabled={disabled || !text.trim()}
        className="btn-gradient text-white px-5 py-3 rounded-xl text-sm font-medium shrink-0"
      >
        Отправить
      </button>
    </div>
  );
}
