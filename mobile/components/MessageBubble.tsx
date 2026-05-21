import { View, Text, StyleSheet } from "react-native";
import TypewriterText from "./TypewriterText";

type Props = {
  role: string;
  content: string;
  animate?: boolean;
  onTypingComplete?: () => void;
};

export default function MessageBubble({
  role,
  content,
  animate,
  onTypingComplete,
}: Props) {
  const isUser = role === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        {isUser ? (
          <Text style={styles.userText}>{content}</Text>
        ) : animate ? (
          <TypewriterText text={content} onComplete={onTypingComplete} />
        ) : (
          <Text style={styles.aiText}>{content}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowUser: { justifyContent: "flex-end" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#6d28d9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: "#7c3aed",
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: "#27272a",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  userText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  aiText: { color: "#f4f4f5", fontSize: 15, lineHeight: 22 },
});
