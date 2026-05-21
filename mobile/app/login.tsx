import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { API_URL, isLocalhostApi, SERVER_URL } from "@/constants/config";
import { checkHealth } from "@/lib/api";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(setServerOk);
    const t = setInterval(() => checkHealth().then(setServerOk), 8000);
    return () => clearInterval(t);
  }, []);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(username.trim(), password);
        router.replace("/chat");
      } else {
        await signUp(username.trim(), password);
        setToast("Аккаунт успешно создан! 🎉");
        setTimeout(() => router.replace("/chat"), 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#1e1b4b", "#030712", "#042f2e"]}
        style={StyleSheet.absoluteFill}
      />

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastIcon}>✓</Text>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <View style={styles.header}>
        <LinearGradient
          colors={["#7c3aed", "#06b6d4"]}
          style={styles.logo}
        >
          <Text style={styles.logoText}>AI</Text>
        </LinearGradient>
        <Text style={styles.title}>Neural Chat</Text>
        <Text style={styles.subtitle}>
          {isLogin ? "Войди в аккаунт" : "Создай аккаунт — история сохранится"}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.tabActive]}
            onPress={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
              Вход
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.tabActive]}
            onPress={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
              Регистрация
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Логин</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          placeholderTextColor="#52525b"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#52525b"
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={submit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#7c3aed", "#0891b2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {isLogin ? "Войти" : "Создать аккаунт"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBox}>
        <View
          style={[
            styles.statusDot,
            serverOk === null
              ? styles.statusPending
              : serverOk
                ? styles.statusOk
                : styles.statusFail,
          ]}
        />
        <Text style={styles.statusText}>
          {serverOk === null
            ? "Проверка сервера..."
            : serverOk
              ? "Сервер доступен"
              : "Сервер недоступен — см. инструкцию ниже"}
        </Text>
      </View>

      {isLocalhostApi() && (
        <Text style={styles.warn}>
          ⚠ На телефоне localhost не работает. Укажи IP ПК в mobile/.env
        </Text>
      )}

      {!serverOk && serverOk !== null && (
        <Text style={styles.help}>
          1. Запусти: python manage.py runserver 0.0.0.0:8000{"\n"}
          2. ipconfig → IPv4 (например 192.168.3.5){"\n"}
          3. mobile/.env: EXPO_PUBLIC_API_URL=http://IP:8000/api{"\n"}
          4. npx expo start -c{"\n"}
          5. Открой в браузере телефона: {SERVER_URL}/api/health/
        </Text>
      )}

      <Text style={styles.apiHint}>API: {API_URL}</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  title: { color: "#fff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "#71717a", fontSize: 14, marginTop: 6, textAlign: "center" },
  card: {
    backgroundColor: "rgba(24,24,27,0.9)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#7c3aed" },
  tabText: { color: "#71717a", fontWeight: "600", fontSize: 14 },
  tabTextActive: { color: "#fff" },
  label: {
    color: "#71717a",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    marginBottom: 14,
  },
  error: {
    color: "#f87171",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  toast: {
    position: "absolute",
    top: 56,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(16,185,129,0.2)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.5)",
    borderRadius: 14,
    padding: 14,
    zIndex: 10,
  },
  toastIcon: { fontSize: 18, color: "#34d399" },
  toastText: { color: "#a7f3d0", fontWeight: "600", flex: 1 },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusPending: { backgroundColor: "#71717a" },
  statusOk: { backgroundColor: "#22c55e" },
  statusFail: { backgroundColor: "#ef4444" },
  statusText: { color: "#a1a1aa", fontSize: 13 },
  warn: {
    color: "#fbbf24",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 8,
  },
  help: {
    color: "#71717a",
    fontSize: 11,
    marginTop: 10,
    lineHeight: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 12,
    borderRadius: 10,
  },
  apiHint: {
    color: "#3f3f46",
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
  },
});
