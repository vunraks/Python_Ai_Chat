import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { token, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (token) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [ready, token]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#8b5cf6" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#030712",
    alignItems: "center",
    justifyContent: "center",
  },
});
