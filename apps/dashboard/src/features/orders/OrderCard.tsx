import { View, Text, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { colors, spacing, radius, typography, statusColorMap } from "@/theme/tokens";
import type { OrderStatusKey } from "@/theme/tokens";
import { formatCents } from "@odyssey/shared";

// RN Web extends Pressable's style callback state with `hovered`/`focused`.
type PressableState = { pressed: boolean; hovered?: boolean; focused?: boolean };

export interface DropPoint {
  absoluteX: number;
  absoluteY: number;
}

interface OrderCardProps {
  id: number;
  status: string;
  customerName: string | null;
  itemCount: number;
  totalCents: number;
  createdAt: string;
  actionLabel: string;
  onAction: () => void;
  onPress: () => void;
  /**
   * Called when the card is released after a drag, with the absolute drop
   * coordinates. Return true if the drop triggered a move (the parent will
   * remove this card), false to snap it back to its origin. Optional — when
   * omitted the card is not draggable.
   */
  onDragEnd?: (id: number, point: DropPoint) => boolean;
  /** Notifies parent that a drag has started/ended (for visual state). */
  onDragStateChange?: (id: number, dragging: boolean) => void;
  /** Reports the pointer's absolute x during drag, for drop-target highlight. */
  onDragMove?: (absoluteX: number) => void;
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

export default function OrderCard({
  id,
  status,
  customerName,
  itemCount,
  totalCents,
  createdAt,
  actionLabel,
  onAction,
  onPress,
  onDragEnd,
  onDragStateChange,
  onDragMove,
}: OrderCardProps) {
  const statusColor =
    statusColorMap[status as OrderStatusKey] ?? colors.text.muted;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const setDragState = (dragging: boolean) => {
    onDragStateChange?.(id, dragging);
  };

  const reportMove = (absoluteX: number) => {
    onDragMove?.(absoluteX);
  };

  // Resolve the drop on the JS thread; snap back if the parent didn't take it.
  const handleRelease = (point: DropPoint) => {
    const moved = onDragEnd ? onDragEnd(id, point) : false;
    if (!moved) {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
    }
    // If moved, the card unmounts on the next data refresh; leave it offset.
  };

  // Small activation offset so taps and the action button still work; only a
  // deliberate drag (>8px) engages the pan.
  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .activeOffsetY([-8, 8])
    .onStart(() => {
      isDragging.value = true;
      runOnJS(setDragState)(true);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      runOnJS(reportMove)(e.absoluteX);
    })
    .onEnd((e) => {
      runOnJS(handleRelease)({ absoluteX: e.absoluteX, absoluteY: e.absoluteY });
    })
    .onFinalize(() => {
      isDragging.value = false;
      runOnJS(setDragState)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? 1.03 : 1 },
    ],
    zIndex: isDragging.value ? 100 : 0,
    shadowOpacity: isDragging.value ? 0.5 : 0.25,
    shadowRadius: isDragging.value ? 12 : 3,
    opacity: isDragging.value ? 0.95 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.dragWrap, animatedStyle]}>
        <Pressable
          style={({ pressed, hovered }: PressableState) => [
            styles.card,
            hovered && styles.cardHovered,
            pressed && styles.cardPressed,
          ]}
          onPress={onPress}
          // Note: deliberately NOT accessibilityRole="button". On web RN renders a
          // button role as a real <button>, and this card contains an action
          // <button> below — nested buttons are invalid HTML and break hydration.
          accessibilityRole="link"
          accessibilityLabel={`Order ${id}, ${status}, ${formatCents(totalCents)}`}
        >
          {/* Status accent strip down the leading edge of the card */}
          <View style={[styles.accent, { backgroundColor: statusColor }]} />

          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.orderNum}>#{id}</Text>
              <Text style={styles.time}>{timeAgo(createdAt)}</Text>
            </View>

            {customerName && (
              <Text style={styles.customer} numberOfLines={1}>
                {customerName}
              </Text>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.items}>{itemCount} item{itemCount !== 1 ? "s" : ""}</Text>
              <Text style={[styles.total, { color: statusColor }]}>
                {formatCents(totalCents)}
              </Text>
            </View>

            <Pressable
              style={({ hovered }: PressableState) => [
                styles.actionBtn,
                { backgroundColor: statusColor },
                hovered && styles.actionBtnHovered,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onAction();
              }}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
            >
              <Text style={styles.actionText}>{actionLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  dragWrap: {
    borderRadius: radius.lg,
    // Shadow lives on the animated wrapper so it can deepen during drag.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
    overflow: "hidden",
  },
  cardHovered: {
    borderColor: colors.text.dim,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    transform: [{ translateY: -1 }],
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.997 }],
  },
  accent: {
    width: 3,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNum: {
    color: colors.text.primary,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
  time: {
    color: colors.text.dim,
    fontFamily: "Inter",
    ...typography.caption,
  },
  customer: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  items: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.caption,
  },
  total: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 15,
  },
  actionBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  actionBtnHovered: {
    opacity: 0.88,
  },
  actionText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 11,
  },
});
