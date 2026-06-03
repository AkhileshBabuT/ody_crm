import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

type Period = "today" | "week" | "month";

interface OrderVolumeChartProps {
  ordersToday: number;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

// Simulated hourly data for chart bars
function generateBars(period: Period, ordersToday: number): number[] {
  if (period === "today") {
    const hours = new Date().getHours() + 1;
    const bars: number[] = [];
    for (let i = 0; i < Math.min(hours, 24); i++) {
      // Distribution curve peaking at lunch (12) and dinner (19)
      const lunchFactor = Math.exp(-Math.pow(i - 12, 2) / 8);
      const dinnerFactor = Math.exp(-Math.pow(i - 19, 2) / 6);
      bars.push(Math.max(1, Math.round(ordersToday * (lunchFactor + dinnerFactor) / 6)));
    }
    return bars;
  }
  if (period === "week") {
    return [12, 18, 22, 15, 28, 35, 20];
  }
  // month
  return Array.from({ length: 30 }, (_, i) => 8 + Math.round(Math.random() * 25));
}

export default function OrderVolumeChart({ ordersToday }: OrderVolumeChartProps) {
  const [period, setPeriod] = useState<Period>("today");
  const bars = generateBars(period, ordersToday);
  const maxVal = Math.max(...bars, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Volume</Text>
        <View style={styles.toggleRow}>
          {PERIODS.map((p) => (
            <Pressable
              key={p.key}
              style={[styles.toggleBtn, period === p.key && styles.toggleBtnActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                style={[
                  styles.toggleText,
                  period === p.key && styles.toggleTextActive,
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.chartArea}>
        {bars.map((val, i) => (
          <View key={i} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: `${(val / maxVal) * 100}%`,
                  backgroundColor:
                    val === maxVal ? colors.accent.primary : colors.status.preparing,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.background.base,
    borderRadius: radius.md,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.background.elevated,
  },
  toggleText: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  toggleTextActive: {
    color: colors.text.primary,
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    minHeight: 160,
  },
  barContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    borderRadius: 2,
    minHeight: 4,
  },
});
