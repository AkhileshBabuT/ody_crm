import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Search, Bell } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

type TopBarProps = {
  title: string;
  showLiveBadge?: boolean;
  unreadCount?: number;
};

export default function TopBar({
  title,
  showLiveBadge = false,
  unreadCount = 0,
}: TopBarProps) {
  return (
    <View style={styles.container}>
      {/* Left section */}
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
        {showLiveBadge && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDotOuter}>
              <View style={styles.liveDotInner} />
            </View>
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>

      {/* Right section */}
      <View style={styles.rightSection}>
        <Pressable
          style={(state) => [
            styles.iconButton,
            (state as any).hovered && styles.iconButtonHovered,
          ]}
          accessibilityLabel="Search"
          accessibilityRole="button"
        >
          <Search size={18} color={colors.text.muted} />
        </Pressable>

        <Pressable
          style={(state) => [
            styles.iconButton,
            (state as any).hovered && styles.iconButtonHovered,
          ]}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Bell size={18} color={colors.text.muted} />
          {unreadCount > 0 && (
            <View style={styles.notificationDot} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
    paddingHorizontal: spacing.xl,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  liveDotOuter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.positive,
  },
  liveText: {
    color: colors.accent.positive,
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonHovered: {
    backgroundColor: colors.background.elevated,
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.negative,
    borderWidth: 1.5,
    borderColor: colors.background.surface,
  },
});
