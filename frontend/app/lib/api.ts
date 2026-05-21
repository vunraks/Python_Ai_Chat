const API = "http://127.0.0.1:8000/api";

export type ChatSummary = {
  id: number;
  title: string;
  created_at: string;
};

export type ChatMessage = {
  role: string;
  content: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail[0]
          : null;
    throw new Error(data.error || detail || "Ошибка запроса");
  }

  return data as T;
}

export async function register(username: string, password: string) {
  return request<{ access: string; refresh: string }>("/chat/register/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string) {
  return request<{ access: string; refresh: string }>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchChats(token: string) {
  return request<ChatSummary[]>("/chats/", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createChat(token: string, title = "New Chat") {
  return request<{ id: number; title: string }>("/chat/create/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  });
}

export async function fetchChat(token: string, chatId: number) {
  return request<{
    id: number;
    title: string;
    messages: ChatMessage[];
  }>(`/chat/${chatId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendMessage(
  token: string,
  message: string,
  model: string,
  chatId: number | null
) {
  return request<{ response: string; chat_id: number; title: string }>(
    "/chat/message/",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        message,
        model,
        chat_id: chatId,
      }),
    }
  );
}
