import { useState, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetApiOrders,
  usePatchApiOrdersIdStatus,
  getGetApiOrdersQueryKey,
} from "@odyssey/api-client";
import { ORDER_STATUS } from "@odyssey/shared";
import type { OrderStatus } from "@odyssey/shared";
import { colors, spacing } from "@/theme/tokens";
import KanbanColumn from "./KanbanColumn";
import type { DropPoint } from "./OrderCard";
import OrderDetailModal from "./OrderDetailModal";

const COLUMNS = [
  {
    status: ORDER_STATUS.PENDING as OrderStatus,
    title: "Pending",
    color: colors.status.pending,
    actionLabel: "Accept",
    nextStatus: ORDER_STATUS.ACCEPTED as OrderStatus,
  },
  {
    status: ORDER_STATUS.ACCEPTED as OrderStatus,
    title: "Accepted",
    color: colors.status.accepted,
    actionLabel: "Start Prep",
    nextStatus: ORDER_STATUS.PREPARING as OrderStatus,
  },
  {
    status: ORDER_STATUS.PREPARING as OrderStatus,
    title: "Preparing",
    color: colors.status.preparing,
    actionLabel: "Mark Ready",
    nextStatus: ORDER_STATUS.READY as OrderStatus,
  },
  {
    status: ORDER_STATUS.READY as OrderStatus,
    title: "Ready",
    color: colors.status.ready,
    actionLabel: "Complete",
    nextStatus: ORDER_STATUS.COMPLETED as OrderStatus,
  },
] as const;

export default function OrdersScreen() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Absolute x-bounds of each column, keyed by column index — used to hit-test
  // where a dragged card was dropped.
  const columnBoundsRef = useRef<Record<number, { left: number; right: number }>>({});
  // Orders that just got dragged to a new column; hidden optimistically until
  // the query refetch reconciles them.
  const [movingIds, setMovingIds] = useState<Set<number>>(new Set());
  // Index of the column currently under the dragged card, for highlight.
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // One query per column, each polling every 3s
  const pendingQuery = useGetApiOrders(
    { status: ORDER_STATUS.PENDING },
    { query: { refetchInterval: 3_000, staleTime: 0 } },
  );
  const acceptedQuery = useGetApiOrders(
    { status: ORDER_STATUS.ACCEPTED },
    { query: { refetchInterval: 3_000, staleTime: 0 } },
  );
  const preparingQuery = useGetApiOrders(
    { status: ORDER_STATUS.PREPARING },
    { query: { refetchInterval: 3_000, staleTime: 0 } },
  );
  const readyQuery = useGetApiOrders(
    { status: ORDER_STATUS.READY },
    { query: { refetchInterval: 3_000, staleTime: 0 } },
  );

  const queries = [pendingQuery, acceptedQuery, preparingQuery, readyQuery];

  const statusMutation = usePatchApiOrdersIdStatus({
    mutation: {
      onSuccess: () => {
        // Invalidate all order queries to refresh columns
        COLUMNS.forEach((col) => {
          queryClient.invalidateQueries({
            queryKey: getGetApiOrdersQueryKey({ status: col.status }),
          });
        });
      },
    },
  });

  const handleAction = useCallback(
    (orderId: number, nextStatus: OrderStatus) => {
      statusMutation.mutate({
        id: String(orderId),
        data: { status: nextStatus },
      });
    },
    [statusMutation],
  );

  const handleCancel = useCallback(
    (orderId: number) => {
      statusMutation.mutate({
        id: String(orderId),
        data: { status: ORDER_STATUS.CANCELLED },
      });
      setSelectedOrderId(null);
    },
    [statusMutation],
  );

  // Find which column index an x-coordinate falls into.
  const columnIndexAtX = useCallback((x: number): number | null => {
    const bounds = columnBoundsRef.current;
    for (let i = 0; i < COLUMNS.length; i++) {
      const b = bounds[i];
      if (b && x >= b.left && x <= b.right) return i;
    }
    return null;
  }, []);

  // Called by a card when it's released after dragging. Returns true if the
  // drop produced a status change (so the card stays offset until refetch).
  const handleCardDragEnd = useCallback(
    (orderId: number, point: DropPoint): boolean => {
      const targetIndex = columnIndexAtX(point.absoluteX);
      setDropTargetIndex(null);
      if (targetIndex === null) return false;

      // Determine the source column by where the order currently lives.
      const sourceIndex = queries.findIndex((q) =>
        (q.data?.data ?? []).some((o) => o.id === orderId),
      );
      if (targetIndex === sourceIndex) return false;

      const targetStatus = COLUMNS[targetIndex].status;

      // Optimistically hide the card; the backend validates the transition and
      // the subsequent refetch reconciles (card reappears in source if rejected).
      setMovingIds((prev) => new Set(prev).add(orderId));
      statusMutation.mutate(
        { id: String(orderId), data: { status: targetStatus } },
        {
          onSettled: () => {
            setMovingIds((prev) => {
              const next = new Set(prev);
              next.delete(orderId);
              return next;
            });
          },
        },
      );
      return true;
    },
    [columnIndexAtX, queries, statusMutation],
  );

  const handleCardDragStateChange = useCallback(
    (_orderId: number, dragging: boolean) => {
      if (!dragging) setDropTargetIndex(null);
    },
    [],
  );

  const handleCardDragMove = useCallback(
    (absoluteX: number) => {
      const idx = columnIndexAtX(absoluteX);
      setDropTargetIndex((prev) => (prev === idx ? prev : idx));
    },
    [columnIndexAtX],
  );

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {COLUMNS.map((col, i) => {
          const orders = (queries[i].data?.data ?? []).filter(
            (o) => !movingIds.has(o.id),
          );
          return (
            <KanbanColumn
              key={col.status}
              title={col.title}
              color={col.color}
              actionLabel={col.actionLabel}
              orders={orders.map((o) => ({
                ...o,
                customerName: null,
                itemCount: 0,
              }))}
              onAction={(id) => handleAction(id, col.nextStatus)}
              onCardPress={(id) => setSelectedOrderId(id)}
              onMeasure={(left, right) => {
                columnBoundsRef.current[i] = { left, right };
              }}
              onCardDragEnd={handleCardDragEnd}
              onCardDragStateChange={handleCardDragStateChange}
              onCardDragMove={handleCardDragMove}
              isDropTarget={dropTargetIndex === i}
            />
          );
        })}
      </View>

      <OrderDetailModal
        orderId={selectedOrderId}
        visible={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  board: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg,
  },
});
