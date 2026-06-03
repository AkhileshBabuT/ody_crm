import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface PopularItem {
  menuItemId: number;
  name: string;
  totalQuantity: number;
}

interface PopularItemsListProps {
  items: PopularItem[];
}

export default function PopularItemsList({ items }: PopularItemsListProps) {
  const maxQty = Math.max(...items.map((i) => i.totalQuantity), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Items</Text>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={item.menuItemId} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.count}>{item.totalQuantity} sold</Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(item.totalQuantity / maxQty) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))}
        {items.length === 0 && (
          <Text style={styles.empty}>No data yet</Text>
        )}
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
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rank: {
    color: colors.text.dim,
    fontFamily: "Inter",
    ...typography.caption,
    width: 20,
  },
  name: {
    flex: 1,
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
  count: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.caption,
  },
  barBg: {
    height: 6,
    backgroundColor: colors.background.base,
    borderRadius: radius.full,
    marginLeft: 28,
  },
  barFill: {
    height: 6,
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
  },
  empty: {
    color: colors.text.dim,
    fontFamily: "Inter",
    ...typography.body,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
