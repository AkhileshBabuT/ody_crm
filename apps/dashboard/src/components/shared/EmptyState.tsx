import React, { type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon != null && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {message != null && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["3xl"],
  },
  icon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.body,
    textAlign: "center",
  },
});
