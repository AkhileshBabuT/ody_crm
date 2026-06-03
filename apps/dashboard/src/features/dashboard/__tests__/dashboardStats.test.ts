import { describe, it, expect } from "vitest";
import { formatCents } from "@odyssey/shared";

/**
 * The dashboard KPI row formats every monetary value with formatCents and derives
 * the "Avg. Ticket" KPI as Math.round(revenueCents / totalOrders). We test the
 * shared formatter directly, and replicate the (inline) avgTicket formula here so
 * the rounding / divide-by-zero behaviour is pinned down without rendering the
 * RN DashboardScreen or refactoring its internals.
 */

// Mirror of DashboardScreen's inline avgTicket computation.
function avgTicketCents(revenueCents: number, totalOrders: number): number {
  return totalOrders > 0 ? Math.round(revenueCents / totalOrders) : 0;
}

describe("formatCents", () => {
  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats a typical ticket (1250 -> $12.50)", () => {
    expect(formatCents(1250)).toBe("$12.50");
  });

  it("inserts thousands separators for large values", () => {
    expect(formatCents(123456789)).toBe("$1,234,567.89");
  });

  it("rounds sub-cent fractions to two decimals", () => {
    // 199.5 cents -> $1.995 -> rounded to $2.00 by Intl
    expect(formatCents(199.5)).toBe("$2.00");
  });
});

describe("avgTicket computation", () => {
  it("returns 0 when there are no orders (avoids divide-by-zero)", () => {
    expect(avgTicketCents(0, 0)).toBe(0);
    expect(avgTicketCents(5000, 0)).toBe(0);
  });

  it("rounds the average to the nearest cent", () => {
    // 1000 / 3 = 333.33 -> rounds to 333
    expect(avgTicketCents(1000, 3)).toBe(333);
  });

  it("computes an exact average when evenly divisible", () => {
    expect(avgTicketCents(5000, 4)).toBe(1250);
    expect(formatCents(avgTicketCents(5000, 4))).toBe("$12.50");
  });
});
