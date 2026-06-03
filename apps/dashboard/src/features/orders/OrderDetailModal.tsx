import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { useGetApiOrdersId } from "@odyssey/api-client";
import { formatCents, ORDER_STATUS_LABELS } from "@odyssey/shared";
import type { OrderStatus } from "@odyssey/shared";
import { colors, spacing, radius, typography, statusColorMap } from "@/theme/tokens";
import type { OrderStatusKey } from "@/theme/tokens";
import StatusBadge from "@/components/shared/StatusBadge";

interface OrderDetailModalProps {
  orderId: number | null;
  visible: boolean;
  onClose: () => void;
  onCancel: (orderId: number) => void;
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

export default function OrderDetailModal({
  orderId,
  visible,
  onClose,
  onCancel,
}: OrderDetailModalProps) {
  const { data: order } = useGetApiOrdersId(String(orderId ?? ""), {
    query: { enabled: !!orderId },
  });

  if (!order) return null;

  const status = order.status as OrderStatusKey;
  const statusColor = statusColorMap[status] ?? colors.text.muted;
  const canCancel = ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(
    order.status,
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Order #{order.id}</Text>
              <StatusBadge status={order.status} />
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Close">
              <X size={20} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Customer */}
          {order.customer && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CUSTOMER</Text>
              <Text style={styles.customerName}>{order.customer.name}</Text>
              {order.customer.email && (
                <Text style={styles.customerDetail}>{order.customer.email}</Text>
              )}
            </View>
          )}

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ITEMS</Text>
            <ScrollView style={styles.itemsList}>
              {order.items?.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemQty}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>Item #{item.menuItemId}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalValue, { color: statusColor }]}>
              {formatCents(order.totalCents)}
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TIMELINE</Text>
            <Text style={styles.timeline}>
              Created {timeAgo(order.createdAt)}
            </Text>
            {order.updatedAt !== order.createdAt && (
              <Text style={styles.timeline}>
                Updated {timeAgo(order.updatedAt)}
              </Text>
            )}
          </View>

          {/* Cancel button */}
          {canCancel && (
            <Pressable
              style={styles.cancelBtn}
              onPress={() => onCancel(order.id)}
              accessibilityRole="button"
              accessibilityLabel="Cancel order"
            >
              <Text style={styles.cancelText}>Cancel Order</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "90%",
    maxWidth: 480,
    maxHeight: "80%",
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
  },
  customerName: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.body,
  },
  customerDetail: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  itemsList: {
    maxHeight: 200,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  itemQty: {
    color: colors.text.muted,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12,
    width: 30,
  },
  itemName: {
    flex: 1,
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
  itemPrice: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.body,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.border,
  },
  totalLabel: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
  },
  totalValue: {
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  timeline: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  cancelBtn: {
    backgroundColor: colors.accent.negative + "20",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  cancelText: {
    color: colors.accent.negative,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
});
