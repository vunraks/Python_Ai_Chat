import { API_URL } from "@/constants/config";

export type ChatSummary = {
  id: number;
  title: string;
  created_at: string;
};

export type ChatMessage = {
  role: string;
  content: string;
};

function networkError(url: string, cause?: unknown): Error {
  const hint =
    "Не удалось подключиться к серверу.\n\n" +
    "1. Backend: python manage.py runserver 0.0.0.0:8000\n" +
    "2. В mobile/.env укажи IP ПК: EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api\n" +
    "3. Телефон и ПК в одной Wi‑Fi\n" +
    "4. Разреши порт 8000 в брандмауэре Windows\n" +
    "5. Перезапусти Expo: npx expo start -c\n\n" +
    `URL: ${url}`;

  if (cause instanceof Error && cause.message.includes("Network request failed")) {
    return new Error(hint);
  }
  return new Error(hint);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (e) {
    throw networkError(url, e);
  }

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

export async function checkHealth(): Promise<boolean> {
  const url = `${API_URL}/health/`;
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.ok === true;
  } catch {
    return false;
  }
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
      body: JSON.stringify({ message, model, chat_id: chatId }),
    }
  );
}
