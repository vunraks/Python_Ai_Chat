import { useEffect, useRef, useState } from "react";
import { Text, StyleSheet } from "react-native";

type Props = {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: object;
};

export default function TypewriterText({
  text,
  speed = 16,
  onComplete,
  style,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    if (!text) {
      setDone(true);
      onCompleteRef.current?.();
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <Text style={[styles.text, style]}>
      {displayed}
      {!done && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { color: "#f4f4f5", fontSize: 15, lineHeight: 22 },
  cursor: { color: "#a78bfa" },
});
