import { describe, it, expect } from "vitest";
import {
  ORDER_STATUS,
  ALLOWED_TRANSITIONS,
  isValidTransition,
  type OrderStatus,
} from "@odyssey/shared";

/**
 * The Orders kanban board (OrdersScreen.tsx) drives every "action" button off a
 * status -> nextStatus mapping (its private COLUMNS constant). The board is only
 * correct if each of those forward transitions is one the backend state machine
 * actually allows. We mirror the board's column transitions here and assert they
 * agree with the shared ALLOWED_TRANSITIONS that both UI and API rely on.
 *
 * This intentionally tests the underlying shared logic rather than rendering the
 * RN component, keeping the test fast and free of react-native-web setup.
 */
const COLUMN_TRANSITIONS: { from: OrderStatus; to: OrderStatus; action: string }[] = [
  { from: ORDER_STATUS.PENDING, to: ORDER_STATUS.ACCEPTED, action: "Accept" },
  { from: ORDER_STATUS.ACCEPTED, to: ORDER_STATUS.PREPARING, action: "Start Prep" },
  { from: ORDER_STATUS.PREPARING, to: ORDER_STATUS.READY, action: "Mark Ready" },
  { from: ORDER_STATUS.READY, to: ORDER_STATUS.COMPLETED, action: "Complete" },
];

describe("orders kanban transitions", () => {
  it.each(COLUMN_TRANSITIONS)(
    "the '$action' action ($from -> $to) is a valid transition",
    ({ from, to }) => {
      expect(isValidTransition(from, to)).toBe(true);
    },
  );

  it("every column also permits cancelling its order", () => {
    for (const { from } of COLUMN_TRANSITIONS) {
      expect(isValidTransition(from, ORDER_STATUS.CANCELLED)).toBe(true);
    }
  });
});

describe("isValidTransition", () => {
  it("rejects skipping a step (PENDING -> READY)", () => {
    expect(isValidTransition(ORDER_STATUS.PENDING, ORDER_STATUS.READY)).toBe(false);
  });

  it("rejects moving backwards (PREPARING -> PENDING)", () => {
    expect(isValidTransition(ORDER_STATUS.PREPARING, ORDER_STATUS.PENDING)).toBe(false);
  });

  it("treats terminal states as having no outgoing transitions", () => {
    expect(ALLOWED_TRANSITIONS[ORDER_STATUS.COMPLETED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[ORDER_STATUS.CANCELLED]).toHaveLength(0);
    expect(
      isValidTransition(ORDER_STATUS.COMPLETED, ORDER_STATUS.PENDING),
    ).toBe(false);
  });

  it("defines an entry in ALLOWED_TRANSITIONS for every order status", () => {
    for (const status of Object.values(ORDER_STATUS)) {
      expect(ALLOWED_TRANSITIONS[status]).toBeDefined();
    }
  });
});
