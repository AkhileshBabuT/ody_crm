import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing, radius, statusColorMap, type OrderStatusKey } from "@/theme/tokens";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColorMap[status as OrderStatusKey] ?? "#94a3b8";

  return (
    <View style={[styles.pill, { backgroundColor: color + "33" }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
