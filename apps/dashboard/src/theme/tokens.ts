// ─── Design Tokens ──────────────────────────────────────────────────────────
// All values from the Phase 4 spec. DO NOT use magic numbers — import from here.

export const colors = {
  background: {
    base: "#0f172a",
    surface: "#1e293b",
    elevated: "#334155",
    border: "#334155",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#e2e8f0",
    muted: "#94a3b8",
    subtle: "#64748b",
    dim: "#475569",
  },
  status: {
    pending: "#f59e0b",
    accepted: "#10b981",
    preparing: "#818cf8",
    ready: "#38bdf8",
    completed: "#059669",
    cancelled: "#ef4444",
  },
  accent: {
    primary: "#f59e0b",
    positive: "#10b981",
    negative: "#ef4444",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const typography = {
  headingLg: { fontSize: 24, fontWeight: "700" as const },
  headingMd: { fontSize: 18, fontWeight: "700" as const },
  headingSm: { fontSize: 15, fontWeight: "600" as const },
  body: { fontSize: 13, fontWeight: "400" as const },
  bodySm: { fontSize: 12, fontWeight: "400" as const },
  caption: { fontSize: 11, fontWeight: "400" as const },
  label: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
} as const;

export const transition = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

export const sidebar = {
  collapsed: 56,
  expanded: 200,
} as const;

export type OrderStatusKey =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export const statusColorMap: Record<OrderStatusKey, string> = {
  PENDING: colors.status.pending,
  ACCEPTED: colors.status.accepted,
  PREPARING: colors.status.preparing,
  READY: colors.status.ready,
  COMPLETED: colors.status.completed,
  CANCELLED: colors.status.cancelled,
};
