import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
}

export default function StatCard({
  label,
  value,
  trend,
  trendPositive,
  subtitle,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {trend != null && (
          <Text
            style={[
              styles.trend,
              { color: trendPositive ? colors.accent.positive : colors.accent.negative },
            ]}
          >
            {trend}
          </Text>
        )}
      </View>
      {subtitle != null && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  label: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  value: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingLg,
  },
  trend: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
