// ─── Error Codes ────────────────────────────────────────────────────────────

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INVALID_STATE_TRANSITION"
  | "UNAVAILABLE_ITEMS"
  | "CONFLICT";

const STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  INVALID_STATE_TRANSITION: 422,
  UNAVAILABLE_ITEMS: 422,
  CONFLICT: 409,
};

// ─── AppError ───────────────────────────────────────────────────────────────

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_MAP[code];
    this.details = details ?? null;
  }
}

// ─── Error Response Helper ──────────────────────────────────────────────────

export function errorResponse(err: AppError) {
  return {
    error: {
      code: err.code,
      message: err.message,
      details: err.details,
    },
  };
}
