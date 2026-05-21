import { Platform } from "react-native";

/**
 * На реальном телефоне ОБЯЗАТЕЛЬНО задай в mobile/.env:
 * EXPO_PUBLIC_API_URL=http://ТВОЙ_IP:8000/api
 *
 * После изменения .env: npx expo start -c
 */
function defaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }
  return "http://127.0.0.1:8000/api";
}

export const API_URL = defaultApiUrl();

/** Базовый URL сервера без /api */
export const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

export const MODELS = [
  { id: "arcee-ai/trinity-large-thinking:free", label: "Arcee Trinity" },
  { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B" },
  { id: "huggingfaceh4/zephyr-7b-beta:free", label: "Zephyr 7B" },
  { id: "baidu/cobuddy-20260430:free", label: "Cobuddy" },
] as const;

export function isLocalhostApi(): boolean {
  return /127\.0\.0\.1|localhost/.test(API_URL);
}
