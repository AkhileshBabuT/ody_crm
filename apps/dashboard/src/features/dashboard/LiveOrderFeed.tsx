import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { colors, spacing, radius, typography, statusColorMap } from "@/theme/tokens";
import type { OrderStatusKey } from "@/theme/tokens";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatCents } from "@odyssey/shared";

interface OrderSummary {
  id: number;
  status: string;
  totalCents: number;
  createdAt: string;
  itemCount?: number;
}

interface LiveOrderFeedProps {
  orders: OrderSummary[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LiveOrderFeed({ orders }: LiveOrderFeedProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Orders</Text>
        <Text style={styles.count}>{orders.length} recent</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {orders.map((order) => {
          const statusColor =
            statusColorMap[order.status as OrderStatusKey] ?? colors.text.muted;
          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardTop}>
                <Text style={styles.orderNumber}>#{order.id}</Text>
                <StatusBadge status={order.status} />
              </View>
              <Text style={[styles.total, { color: statusColor }]}>
                {formatCents(order.totalCents)}
              </Text>
              <View style={styles.cardBottom}>
                <Clock size={10} color={colors.text.dim} />
                <Text style={styles.time}>{timeAgo(order.createdAt)}</Text>
              </View>
            </View>
          );
        })}
        {orders.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent orders</Text>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
  },
  count: {
    color: colors.text.dim,
    fontFamily: "Inter",
    ...typography.caption,
  },
  scrollContent: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.background.base,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: 140,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    color: colors.text.primary,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
  total: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 18,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  time: {
    color: colors.text.dim,
    fontFamily: "Inter",
    ...typography.caption,
  },
  emptyCard: {
    backgroundColor: colors.background.base,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  emptyText: {
    color: colors.text.dim,
    fontFamily: "Inter",
    ...typography.body,
  },
});
