import { useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";
import OrderCard, { type DropPoint } from "./OrderCard";

interface Order {
  id: number;
  customerId: number | null;
  customerName?: string | null;
  totalCents: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface KanbanColumnProps {
  title: string;
  color: string;
  orders: Order[];
  actionLabel: string;
  onAction: (orderId: number) => void;
  onCardPress: (orderId: number) => void;
  /** Reports the column's absolute x-bounds so the board can hit-test drops. */
  onMeasure?: (left: number, right: number) => void;
  /** Forwarded to each card to enable cross-column dragging. */
  onCardDragEnd?: (id: number, point: DropPoint) => boolean;
  onCardDragStateChange?: (id: number, dragging: boolean) => void;
  onCardDragMove?: (absoluteX: number) => void;
  /** Highlight this column as the active drop target. */
  isDropTarget?: boolean;
}

export default function KanbanColumn({
  title,
  color,
  orders,
  actionLabel,
  onAction,
  onCardPress,
  onMeasure,
  onCardDragEnd,
  onCardDragStateChange,
  onCardDragMove,
  isDropTarget = false,
}: KanbanColumnProps) {
  const columnRef = useRef<View>(null);

  const handleLayout = () => {
    // measureInWindow gives absolute on-screen x, so drop coordinates (which
    // are absolute) compare correctly. Re-runs on any layout change (e.g.
    // sidebar collapse), keeping bounds fresh.
    if (onMeasure) {
      columnRef.current?.measureInWindow((x, _y, w) => onMeasure(x, x + w));
    }
  };

  return (
    <View
      ref={columnRef}
      style={[styles.column, isDropTarget && { borderColor: color }]}
      onLayout={handleLayout}
    >
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: color + "33" }]}>
          <Text style={[styles.countText, { color }]}>{orders.length}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            status={order.status}
            customerName={order.customerName ?? null}
            itemCount={order.itemCount}
            totalCents={order.totalCents}
            createdAt={order.createdAt}
            actionLabel={actionLabel}
            onAction={() => onAction(order.id)}
            onPress={() => onCardPress(order.id)}
            onDragEnd={onCardDragEnd}
            onDragStateChange={onCardDragStateChange}
            onDragMove={onCardDragMove}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    minWidth: 240,
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.background.border,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
    flex: 1,
  },
  countBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 11,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
