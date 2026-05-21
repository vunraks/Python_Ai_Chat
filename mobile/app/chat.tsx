import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  ChatSummary,
  createChat,
  fetchChat,
  fetchChats,
  sendMessage,
} from "@/lib/api";
import { getActiveChatId, setActiveChatId } from "@/lib/storage";
import MessageBubble from "@/components/MessageBubble";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import { MODELS } from "@/constants/config";

type Msg = { role: string; content: string };

export default function ChatScreen() {
  const { token, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatId, setChatId] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const listRef = useRef<FlatList>(null);
  const inputBlocked = thinking || typingIndex !== null;

  const loadChats = useCallback(async () => {
    if (!token) return [];
    const list = await fetchChats(token);
    setChats(list);
    return list;
  }, [token]);

  const openChat = useCallback(
    async (id: number) => {
      if (!token) return;
      const data = await fetchChat(token, id);
      setChatId(data.id);
      setMessages(data.messages);
      setTypingIndex(null);
      await setActiveChatId(id);
      setSidebarOpen(false);
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      setLoadingChats(true);
      try {
        const list = await loadChats();
        const saved = await getActiveChatId();
        if (saved && list.some((c) => c.id === saved)) {
          await openChat(saved);
        }
      } catch {
        await signOut();
        router.replace("/login");
      } finally {
        setLoadingChats(false);
      }
    })();
  }, [token, loadChats, openChat, signOut]);

  const handleNewChat = async () => {
    if (!token) return;
    const chat = await createChat(token);
    setChatId(chat.id);
    setMessages([]);
    setTypingIndex(null);
    await setActiveChatId(chat.id);
    await loadChats();
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || !token || inputBlocked) return;

    setText("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setThinking(true);

    try {
      const res = await sendMessage(token, msg, model, chatId);

      if (!chatId) {
        setChatId(res.chat_id);
        await setActiveChatId(res.chat_id);
        await loadChats();
      }

      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: res.response }];
        setTypingIndex(next.length - 1);
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "assistant", content: "Ошибка подключения к AI" },
        ];
        setTypingIndex(next.length - 1);
        return next;
      });
    } finally {
      setThinking(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages, thinking, typingIndex]);

  const logout = async () => {
    await signOut();
    router.replace("/login");
  };

  const currentModel = MODELS.find((m) => m.id === model)?.label ?? "Model";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Neural Chat</Text>
        <TouchableOpacity onPress={() => setModelPickerOpen(true)}>
          <Text style={styles.modelBtn} numberOfLines={1}>
            {currentModel} ▾
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !thinking ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>
                Задай вопрос — отвечу с анимацией печати
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <MessageBubble
            role={item.role}
            content={item.content}
            animate={item.role === "assistant" && index === typingIndex}
            onTypingComplete={() => setTypingIndex(null)}
          />
        )}
        ListFooterComponent={thinking ? <ThinkingIndicator /> : null}
      />

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={inputBlocked ? "AI отвечает..." : "Сообщение..."}
          placeholderTextColor="#52525b"
          editable={!inputBlocked}
          multiline
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={inputBlocked || !text.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={inputBlocked ? ["#3f3f46", "#3f3f46"] : ["#7c3aed", "#0891b2"]}
            style={styles.sendBtn}
          >
            <Text style={styles.sendText}>↑</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Modal visible={sidebarOpen} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setSidebarOpen(false)} />
        <View style={[styles.sidebar, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.sidebarTitle}>Чаты</Text>
          <TouchableOpacity onPress={handleNewChat}>
            <LinearGradient
              colors={["#7c3aed", "#0891b2"]}
              style={styles.newChatBtn}
            >
              <Text style={styles.newChatText}>+ Новый чат</Text>
            </LinearGradient>
          </TouchableOpacity>

          {loadingChats ? (
            <ActivityIndicator color="#8b5cf6" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item) => String(item.id)}
              style={styles.chatList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chatItem,
                    chatId === item.id && styles.chatItemActive,
                  ]}
                  onPress={() => openChat(item.id)}
                >
                  <Text
                    style={[
                      styles.chatItemText,
                      chatId === item.id && styles.chatItemTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Model picker */}
      <Modal visible={modelPickerOpen} animationType="fade" transparent>
        <Pressable
          style={styles.overlay}
          onPress={() => setModelPickerOpen(false)}
        />
        <View style={styles.picker}>
          <Text style={styles.pickerTitle}>Модель AI</Text>
          {MODELS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.pickerItem, model === m.id && styles.pickerItemActive]}
              onPress={() => {
                setModel(m.id);
                setModelPickerOpen(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  model === m.id && styles.pickerItemTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#030712" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  menuBtn: { padding: 8 },
  menuIcon: { color: "#fff", fontSize: 22 },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 4,
  },
  modelBtn: { color: "#a78bfa", fontSize: 12, maxWidth: 110 },
  listContent: { padding: 12, paddingBottom: 8, flexGrow: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#71717a", textAlign: "center", fontSize: 14, paddingHorizontal: 40 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    backgroundColor: "#030712",
  },
  input: {
    flex: 1,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "82%",
    maxWidth: 300,
    backgroundColor: "#18181b",
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: "#27272a",
  },
  sidebarTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 14 },
  newChatBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  newChatText: { color: "#fff", fontWeight: "700" },
  chatList: { flex: 1, marginTop: 12 },
  chatItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  chatItemActive: { backgroundColor: "rgba(124,58,237,0.25)" },
  chatItemText: { color: "#a1a1aa", fontSize: 14 },
  chatItemTextActive: { color: "#e9d5ff" },
  logoutBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    marginBottom: 20,
  },
  logoutText: { color: "#71717a", fontSize: 15 },
  picker: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  pickerTitle: { color: "#fff", fontWeight: "700", marginBottom: 12, fontSize: 16 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  pickerItemActive: { backgroundColor: "rgba(124,58,237,0.3)" },
  pickerItemText: { color: "#a1a1aa", fontSize: 15 },
  pickerItemTextActive: { color: "#fff", fontWeight: "600" },
});
