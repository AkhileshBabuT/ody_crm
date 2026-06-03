import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";
import { formatCents } from "@odyssey/shared";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrder?: string;
}

interface CustomerRowProps {
  customer: Customer;
  index: number;
  onPress: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CustomerRow({ customer, index, onPress }: CustomerRowProps) {
  const isEven = index % 2 === 0;

  return (
    <Pressable
      style={[styles.row, { backgroundColor: isEven ? colors.background.base : colors.background.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View customer ${customer.name}`}
    >
      <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>
        {customer.name}
      </Text>
      <Text style={[styles.cell, styles.emailCell]} numberOfLines={1}>
        {customer.email}
      </Text>
      <Text style={[styles.cell, styles.ordersCell]}>
        {customer.orderCount ?? 0}
      </Text>
      <Text style={[styles.cell, styles.spentCell]}>
        {formatCents(customer.totalSpent ?? 0)}
      </Text>
      <Text style={[styles.cell, styles.lastOrderCell]}>
        {customer.lastOrder ? timeAgo(customer.lastOrder) : "Never"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cell: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
  nameCell: {
    flex: 2,
    color: colors.text.primary,
    fontWeight: "600",
  },
  emailCell: {
    flex: 3,
    color: colors.text.muted,
  },
  ordersCell: {
    flex: 1,
    textAlign: "right",
  },
  spentCell: {
    flex: 1.5,
    textAlign: "right",
  },
  lastOrderCell: {
    flex: 1.5,
    textAlign: "right",
    color: colors.text.muted,
  },
});
