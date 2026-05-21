import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  access: "access_token",
  refresh: "refresh_token",
  activeChat: "active_chat_id",
} as const;

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.access);
}

export async function saveTokens(access: string, refresh: string) {
  await AsyncStorage.multiSet([
    [KEYS.access, access],
    [KEYS.refresh, refresh],
  ]);
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([
    KEYS.access,
    KEYS.refresh,
    KEYS.activeChat,
  ]);
}

export async function getActiveChatId(): Promise<number | null> {
  const v = await AsyncStorage.getItem(KEYS.activeChat);
  return v ? Number(v) : null;
}

export async function setActiveChatId(id: number) {
  await AsyncStorage.setItem(KEYS.activeChat, String(id));
}
