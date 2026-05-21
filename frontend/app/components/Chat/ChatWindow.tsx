"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";
import {
  ChatSummary,
  createChat,
  fetchChat,
  fetchChats,
  sendMessage,
} from "@/app/lib/api";

const ACTIVE_CHAT_KEY = "active_chat_id";

type Props = {
  token: string;
  onLogout: () => void;
};

export default function ChatWindow({ token, onLogout }: Props) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [chatId, setChatId] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [model, setModel] = useState("arcee-ai/trinity-large-thinking:free");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputBlocked = thinking || typingIndex !== null;

  const loadChats = useCallback(async () => {
    const list = await fetchChats(token);
    setChats(list);
    return list;
  }, [token]);

  const openChat = useCallback(
    async (id: number) => {
      const data = await fetchChat(token, id);
      setChatId(data.id);
      setMessages(data.messages);
      setTypingIndex(null);
      localStorage.setItem(ACTIVE_CHAT_KEY, String(id));
    },
    [token]
  );

  useEffect(() => {
    const init = async () => {
      setLoadingChats(true);
      try {
        const list = await loadChats();
        const savedId = localStorage.getItem(ACTIVE_CHAT_KEY);

        if (savedId && list.some((c) => c.id === Number(savedId))) {
          await openChat(Number(savedId));
        }
      } catch {
        onLogout();
      } finally {
        setLoadingChats(false);
      }
    };

    init();
  }, [loadChats, openChat, onLogout]);

  const handleNewChat = async () => {
    const chat = await createChat(token);
    setChatId(chat.id);
    setMessages([]);
    setTypingIndex(null);
    localStorage.setItem(ACTIVE_CHAT_KEY, String(chat.id));
    await loadChats();
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || inputBlocked) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    try {
      const res = await sendMessage(token, text, model, chatId);

      if (!chatId) {
        setChatId(res.chat_id);
        localStorage.setItem(ACTIVE_CHAT_KEY, String(res.chat_id));
        await loadChats();
      }

      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "assistant", content: res.response },
        ];
        setTypingIndex(next.length - 1);
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            role: "assistant",
            content: "Ошибка подключения к AI. Попробуй ещё раз.",
          },
        ];
        setTypingIndex(next.length - 1);
        return next;
      });
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, typingIndex]);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-900/50 backdrop-blur flex flex-col">
        <div className="p-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <span className="font-semibold">Neural Chat</span>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full btn-gradient text-white py-2.5 rounded-xl text-sm font-medium"
          >
            + Новый чат
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loadingChats && (
            <p className="text-zinc-500 text-xs p-3 animate-pulse">
              Загрузка чатов...
            </p>
          )}

          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => openChat(chat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm truncate transition-all ${
                chatId === chat.id
                  ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800/80">
          <button
            onClick={onLogout}
            className="w-full py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/30 backdrop-blur flex items-center justify-between">
          <h1 className="font-semibold text-zinc-200">Диалог</h1>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={inputBlocked}
            className="bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 rounded-lg text-sm text-zinc-300 outline-none focus:border-violet-500/50 disabled:opacity-50"
          >
            <option value="arcee-ai/trinity-large-thinking:free">
              Arcee Trinity
            </option>
            <option value="mistralai/mistral-7b-instruct:free">
              Mistral 7B
            </option>
            <option value="huggingfaceh4/zephyr-7b-beta:free">
              Zephyr 7B
            </option>
            <option value="baidu/cobuddy-20260430:free">Cobuddy</option>
          </select>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {messages.length === 0 && !thinking && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-2xl">
                ✨
              </div>
              <p className="text-zinc-400 text-sm max-w-xs">
                Задай любой вопрос — отвечу с анимацией печати, как в ChatGPT
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <Message
              key={`${i}-${m.content.slice(0, 20)}`}
              role={m.role}
              content={m.content}
              animate={m.role === "assistant" && i === typingIndex}
              onTypingComplete={() => setTypingIndex(null)}
            />
          ))}

          {thinking && <ThinkingIndicator />}

          <div ref={scrollRef} />
        </div>

        <div className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
          <ChatInput onSend={handleSend} disabled={inputBlocked} />
        </div>
      </div>
    </div>
  );
}
