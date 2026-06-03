import { describe, it, expect } from "vitest";
import {
  assertValidTransition,
  ORDER_STATUS,
  type OrderStatus,
} from "../order-state-machine";
import { AppError } from "../errors";

describe("assertValidTransition", () => {
  describe("valid transitions", () => {
    const validTransitions: [OrderStatus, OrderStatus][] = [
      [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED],
      [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING],
      [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PREPARING, ORDER_STATUS.READY],
      [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.READY, ORDER_STATUS.COMPLETED],
      [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
    ];

    it.each(validTransitions)(
      "should allow transition from %s to %s",
      (from, to) => {
        expect(() => assertValidTransition(from, to)).not.toThrow();
      },
    );
  });

  describe("invalid transitions", () => {
    const invalidTransitions: [OrderStatus, OrderStatus][] = [
      [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING],
      [ORDER_STATUS.PENDING, ORDER_STATUS.READY],
      [ORDER_STATUS.PENDING, ORDER_STATUS.COMPLETED],
      [ORDER_STATUS.ACCEPTED, ORDER_STATUS.COMPLETED],
      [ORDER_STATUS.ACCEPTED, ORDER_STATUS.READY],
      [ORDER_STATUS.PREPARING, ORDER_STATUS.ACCEPTED],
      [ORDER_STATUS.READY, ORDER_STATUS.PENDING],
    ];

    it.each(invalidTransitions)(
      "should reject transition from %s to %s",
      (from, to) => {
        expect(() => assertValidTransition(from, to)).toThrow(AppError);
        try {
          assertValidTransition(from, to);
        } catch (err) {
          expect(err).toBeInstanceOf(AppError);
          expect((err as AppError).code).toBe("INVALID_STATE_TRANSITION");
        }
      },
    );
  });

  describe("terminal states", () => {
    const terminalStates = [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED];
    const allStatuses = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.CANCELLED,
    ];

    it.each(terminalStates)(
      "should reject ALL transitions from terminal state %s",
      (terminalState) => {
        for (const target of allStatuses) {
          if (target === terminalState) continue;
          expect(() => assertValidTransition(terminalState, target)).toThrow(
            AppError,
          );
          try {
            assertValidTransition(terminalState, target);
          } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            expect((err as AppError).code).toBe("INVALID_STATE_TRANSITION");
          }
        }
      },
    );

    it("should reject COMPLETED → PENDING", () => {
      expect(() =>
        assertValidTransition(ORDER_STATUS.COMPLETED, ORDER_STATUS.PENDING),
      ).toThrow(AppError);
    });

    it("should reject COMPLETED → CANCELLED", () => {
      expect(() =>
        assertValidTransition(ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED),
      ).toThrow(AppError);
    });

    it("should reject CANCELLED → PENDING", () => {
      expect(() =>
        assertValidTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING),
      ).toThrow(AppError);
    });

    it("should reject CANCELLED → ACCEPTED", () => {
      expect(() =>
        assertValidTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.ACCEPTED),
      ).toThrow(AppError);
    });
  });
});
