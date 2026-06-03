import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "./tokens";

export const sharedStyles = StyleSheet.create({
  // ─── Cards ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  cardElevated: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  // ─── Rows ───────────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  // ─── Text ───────────────────────────────────────────────────────────────────
  headingLg: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingLg,
  },
  headingMd: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  headingSm: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
  },
  body: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
  bodySm: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  caption: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.caption,
  },
  label: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
  },

  // ─── Inputs ─────────────────────────────────────────────────────────────────
  input: {
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.body,
  },

  // ─── Buttons ────────────────────────────────────────────────────────────────
  buttonPrimary: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonPrimaryText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600" as const,
    fontSize: 13,
  },
  buttonGhost: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonGhostText: {
    color: colors.text.muted,
    fontFamily: "Inter",
    fontWeight: "500" as const,
    fontSize: 13,
  },

  // ─── Layout ─────────────────────────────────────────────────────────────────
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  contentArea: {
    flex: 1,
    padding: spacing.xl,
  },

  // ─── Focus Ring (Accessibility) ─────────────────────────────────────────────
  focusRing: {
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
});
