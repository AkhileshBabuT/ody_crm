import { useEffect, useRef } from 'react';

interface Order {
  id: number;
  status: string;
  totalCents: number;
  items?: unknown[];
}

export function useOrderNotifications(
  orders: Order[] | undefined,
  onNewOrder: (order: Order) => void,
) {
  const seenIds = useRef(new Set<number>());

  useEffect(() => {
    if (!orders) return;

    const pendingOrders = orders.filter((o) => o.status === 'PENDING');

    for (const order of pendingOrders) {
      if (!seenIds.current.has(order.id)) {
        seenIds.current.add(order.id);
        onNewOrder(order);
      }
    }

    // Keep the set in sync — remove IDs no longer present
    const currentIds = new Set(orders.map((o) => o.id));
    for (const id of seenIds.current) {
      if (!currentIds.has(id)) {
        seenIds.current.delete(id);
      }
    }
  }, [orders, onNewOrder]);
}
