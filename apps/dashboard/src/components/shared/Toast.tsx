import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface ToastProps {
  visible: boolean;
  message: string;
  color?: string;
  onDismiss: () => void;
}

export default function Toast({
  visible,
  message,
  color = colors.accent.primary,
  onDismiss,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, onDismiss, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.card, { borderLeftColor: color }]}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.xl,
    zIndex: 1000,
  },
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
    minWidth: 240,
    maxWidth: 360,
  },
  message: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
});
