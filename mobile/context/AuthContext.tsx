import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearAuth, getToken, saveTokens } from "@/lib/storage";
import { login as apiLogin, register as apiRegister } from "@/lib/api";

type AuthContextType = {
  token: string | null;
  ready: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getToken().then((t) => {
      setToken(t);
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    await saveTokens(data.access, data.refresh);
    setToken(data.access);
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    const data = await apiRegister(username, password);
    await saveTokens(data.access, data.refresh);
    setToken(data.access);
  }, []);

  const signOut = useCallback(async () => {
    await clearAuth();
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, ready, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
