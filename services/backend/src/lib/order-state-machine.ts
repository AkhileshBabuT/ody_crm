import {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  ORDER_STATUS,
  type OrderStatus,
} from "@odyssey/shared";
import { AppError } from "./errors";

export { ALLOWED_TRANSITIONS, isValidTransition, ORDER_STATUS, type OrderStatus };

/**
 * Validates a status transition or throws an AppError.
 */
export function assertValidTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): void {
  if (!isValidTransition(currentStatus, nextStatus)) {
    throw new AppError(
      "INVALID_STATE_TRANSITION",
      `Cannot transition from ${currentStatus} to ${nextStatus}`,
      {
        currentStatus,
        nextStatus,
        allowedTransitions: ALLOWED_TRANSITIONS[currentStatus],
      },
    );
  }
}
