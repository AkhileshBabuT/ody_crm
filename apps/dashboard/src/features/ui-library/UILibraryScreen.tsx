import React, { type ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Inbox } from "lucide-react-native";
import { ORDER_STATUS } from "@odyssey/shared";
import {
  colors,
  spacing,
  radius,
  typography,
  statusColorMap,
  type OrderStatusKey,
} from "@/theme/tokens";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description != null && (
        <Text style={styles.sectionDescription}>{description}</Text>
      )}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: value }]} />
      <Text style={styles.swatchName}>{name}</Text>
      <Text style={styles.swatchValue}>{value}</Text>
    </View>
  );
}

// Flatten a token group into { name, value } pairs for display.
const colorGroups: { group: string; entries: [string, string][] }[] = [
  { group: "background", entries: Object.entries(colors.background) },
  { group: "text", entries: Object.entries(colors.text) },
  { group: "status", entries: Object.entries(colors.status) },
  { group: "accent", entries: Object.entries(colors.accent) },
];

const typographyEntries = Object.entries(typography) as [
  keyof typeof typography,
  (typeof typography)[keyof typeof typography],
][];

const spacingEntries = Object.entries(spacing) as [string, number][];
const radiusEntries = Object.entries(radius) as [string, number][];
const statusKeys = Object.values(ORDER_STATUS) as OrderStatusKey[];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function UILibraryScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>UI Library</Text>
        <Text style={styles.pageSubtitle}>
          Design system reference — tokens, typography, surfaces, and reusable
          components.
        </Text>
      </View>

      {/* Color tokens */}
      <Section
        title="Color Tokens"
        description="Semantic color palette. Swatches show the token name and hex value."
      >
        {colorGroups.map((g) => (
          <View key={g.group} style={styles.tokenBlock}>
            <Text style={styles.tokenGroupLabel}>{g.group}</Text>
            <View style={styles.swatchGrid}>
              {g.entries.map(([key, value]) => (
                <Swatch key={key} name={`${g.group}.${key}`} value={value} />
              ))}
            </View>
          </View>
        ))}
      </Section>

      {/* Typography */}
      <Section
        title="Typography"
        description="Text styles applied with the Inter family."
      >
        {typographyEntries.map(([name, style]) => (
          <View key={name} style={styles.typeRow}>
            <Text style={styles.typeName}>{name}</Text>
            <Text style={[styles.typeSample, style]}>
              The quick brown fox
            </Text>
          </View>
        ))}
      </Section>

      {/* Spacing */}
      <Section
        title="Spacing Scale"
        description="Consistent spacing increments used for padding, margin, and gaps."
      >
        {spacingEntries.map(([name, value]) => (
          <View key={name} style={styles.scaleRow}>
            <Text style={styles.scaleLabel}>{name}</Text>
            <Text style={styles.scaleValue}>{value}px</Text>
            <View style={[styles.spacingBar, { width: value * 4 }]} />
          </View>
        ))}
      </Section>

      {/* Radius */}
      <Section
        title="Radius Scale"
        description="Corner radius tokens. The pill below uses each value."
      >
        <View style={styles.radiusGrid}>
          {radiusEntries.map(([name, value]) => (
            <View key={name} style={styles.radiusItem}>
              <View
                style={[
                  styles.radiusBox,
                  { borderRadius: value === radius.full ? 24 : value },
                ]}
              />
              <Text style={styles.scaleLabel}>{name}</Text>
              <Text style={styles.scaleValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Surfaces / elevation */}
      <Section
        title="Surfaces & Elevation"
        description="Layered backgrounds built from background.surface, elevated, and border."
      >
        <View style={styles.surfaceRow}>
          <View style={styles.surfaceBase}>
            <Text style={styles.surfaceLabel}>background.base</Text>
            <Text style={styles.surfaceHint}>#0f172a</Text>
          </View>
          <View style={styles.surfaceCard}>
            <Text style={styles.surfaceLabel}>background.surface</Text>
            <Text style={styles.surfaceHint}>1px border</Text>
          </View>
          <View style={styles.surfaceElevated}>
            <Text style={styles.surfaceLabel}>background.elevated</Text>
            <Text style={styles.surfaceHint}>raised</Text>
          </View>
        </View>
      </Section>

      {/* Status badges */}
      <Section
        title="Status Badges"
        description="StatusBadge for all six order statuses (colors from statusColorMap)."
      >
        <View style={styles.badgeRow}>
          {statusKeys.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </View>
      </Section>

      {/* Stat cards */}
      <Section
        title="Stat Cards"
        description="StatCard with positive, negative, and neutral trends."
      >
        <View style={styles.statGrid}>
          <StatCard
            label="Revenue"
            value="$12,480"
            trend="+12.4%"
            trendPositive
            subtitle="vs last week"
          />
          <StatCard
            label="Refunds"
            value="$320"
            trend="-3.1%"
            trendPositive={false}
            subtitle="vs last week"
          />
          <StatCard label="Avg. Prep Time" value="14m" subtitle="last 24h" />
        </View>
      </Section>

      {/* Buttons / interactive states */}
      <Section
        title="Buttons"
        description="Pressable primitives with default, hover, and pressed states."
      >
        <View style={styles.buttonRow}>
          <Pressable
            style={(state) => [
              styles.btnPrimary,
              (state as { hovered?: boolean }).hovered && styles.btnPrimaryHovered,
              state.pressed && styles.btnPrimaryPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.btnPrimaryText}>Primary</Text>
          </Pressable>

          <Pressable
            style={(state) => [
              styles.btnSecondary,
              (state as { hovered?: boolean }).hovered &&
                styles.btnSecondaryHovered,
              state.pressed && styles.btnSecondaryPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.btnSecondaryText}>Secondary</Text>
          </Pressable>

          <Pressable
            style={(state) => [
              styles.btnDanger,
              state.pressed && styles.btnDangerPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.btnDangerText}>Destructive</Text>
          </Pressable>

          <Pressable style={styles.btnDisabled} disabled accessibilityRole="button">
            <Text style={styles.btnDisabledText}>Disabled</Text>
          </Pressable>
        </View>
      </Section>

      {/* Inputs */}
      <Section
        title="Inputs"
        description="Static input and select shells styled with surface tokens."
      >
        <View style={styles.inputCol}>
          <View style={styles.inputField}>
            <Text style={styles.inputPlaceholder}>Search orders…</Text>
          </View>
          <View style={styles.selectField}>
            <Text style={styles.inputValue}>All statuses</Text>
            <View style={styles.selectCaret} />
          </View>
        </View>
      </Section>

      {/* Component states */}
      <Section
        title="Component States"
        description="Loading, empty, and error visual treatments."
      >
        <View style={styles.stateGrid}>
          {/* Loading */}
          <View style={styles.stateCard}>
            <Text style={styles.stateLabel}>Loading</Text>
            <View style={styles.stateBody}>
              <ActivityIndicator color={colors.accent.primary} />
              <View style={styles.skeletonGroup}>
                <View style={[styles.skeleton, { width: "80%" }]} />
                <View style={[styles.skeleton, { width: "60%" }]} />
                <View style={[styles.skeleton, { width: "70%" }]} />
              </View>
            </View>
          </View>

          {/* Empty */}
          <View style={styles.stateCard}>
            <Text style={styles.stateLabel}>Empty</Text>
            <EmptyState
              icon={<Inbox size={32} color={colors.text.muted} />}
              title="No orders yet"
              message="New orders will appear here as they arrive."
            />
          </View>

          {/* Error */}
          <View style={styles.stateCard}>
            <Text style={styles.stateLabel}>Error</Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Failed to load</Text>
              <Text style={styles.errorMessage}>
                Something went wrong while fetching data. Please retry.
              </Text>
            </View>
          </View>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },

  header: {
    gap: spacing.xs,
  },
  pageTitle: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingLg,
  },
  pageSubtitle: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.body,
  },

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  sectionDescription: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  sectionBody: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    marginTop: spacing.xs,
  },

  // Color tokens
  tokenBlock: {
    gap: spacing.sm,
  },
  tokenGroupLabel: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  swatch: {
    gap: spacing.xs,
    width: 120,
  },
  swatchColor: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  swatchName: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.caption,
  },
  swatchValue: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.caption,
  },

  // Typography
  typeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.lg,
  },
  typeName: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.caption,
    width: 96,
  },
  typeSample: {
    color: colors.text.primary,
    fontFamily: "Inter",
  },

  // Scale rows (spacing)
  scaleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  scaleLabel: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.bodySm,
    width: 40,
  },
  scaleValue: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.caption,
    width: 40,
  },
  spacingBar: {
    height: 16,
    backgroundColor: colors.accent.primary,
    borderRadius: radius.sm,
  },

  // Radius
  radiusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  radiusItem: {
    alignItems: "center",
    gap: spacing.xs,
    width: 80,
  },
  radiusBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },

  // Surfaces
  surfaceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  surfaceBase: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  surfaceCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  surfaceElevated: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  surfaceLabel: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.bodySm,
    fontWeight: "600",
  },
  surfaceHint: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.caption,
  },

  // Badges
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  // Stat cards
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },

  // Buttons
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnPrimaryHovered: {
    opacity: 0.9,
  },
  btnPrimaryPressed: {
    opacity: 0.75,
  },
  btnPrimaryText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnSecondaryHovered: {
    borderColor: colors.text.subtle,
  },
  btnSecondaryPressed: {
    opacity: 0.75,
  },
  btnSecondaryText: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
  btnDanger: {
    backgroundColor: colors.accent.negative,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnDangerPressed: {
    opacity: 0.75,
  },
  btnDangerText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
  btnDisabled: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    opacity: 0.5,
  },
  btnDisabledText: {
    color: colors.text.dim,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },

  // Inputs
  inputCol: {
    gap: spacing.md,
    maxWidth: 360,
  },
  inputField: {
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputPlaceholder: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.body,
  },
  inputValue: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectCaret: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.text.muted,
    transform: [{ rotate: "45deg" }],
  },

  // Component states
  stateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  stateCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stateLabel: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
  },
  stateBody: {
    gap: spacing.md,
  },
  skeletonGroup: {
    gap: spacing.sm,
  },
  skeleton: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.background.elevated,
  },
  errorBox: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.negative,
    backgroundColor: colors.background.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorTitle: {
    color: colors.accent.negative,
    fontFamily: "Inter",
    ...typography.headingSm,
  },
  errorMessage: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
});
