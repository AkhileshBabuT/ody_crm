import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, router } from "expo-router";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Settings,
  Palette,
} from "lucide-react-native";
import { colors, spacing, radius, sidebar, typography } from "@/theme/tokens";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/" },
  { label: "Orders", icon: ShoppingCart, route: "/orders" },
  { label: "Menu", icon: UtensilsCrossed, route: "/menu" },
  { label: "Customers", icon: Users, route: "/customers" },
  { label: "Settings", icon: Settings, route: "/settings" },
  { label: "UI Library", icon: Palette, route: "/ui-library" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  };

  return (
    <View
      style={[
        styles.container,
        { width: expanded ? sidebar.expanded : sidebar.collapsed },
      ]}
    >
      {/* Toggle button */}
      <Pressable
        style={styles.toggleButton}
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityLabel={expanded ? "Collapse sidebar" : "Expand sidebar"}
        accessibilityRole="button"
      >
        <View style={styles.toggleBar} />
        <View style={[styles.toggleBar, { width: 12 }]} />
      </Pressable>

      {/* Nav items */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;

          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              accessibilityRole="link"
              accessibilityLabel={item.label}
              style={(state) => [
                styles.navItem,
                active && styles.navItemActive,
                !active &&
                  (state as any).hovered &&
                  styles.navItemHovered,
              ]}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  size={20}
                  color={active ? colors.text.primary : colors.text.muted}
                />
              </View>
              {expanded && (
                <Text
                  style={[
                    styles.navLabel,
                    active && styles.navLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Bottom avatar */}
      <View style={styles.bottomSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>O</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.surface,
    borderRightWidth: 1,
    borderRightColor: colors.background.border,
    height: "100%",
    paddingVertical: spacing.md,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: spacing.lg,
  },
  toggleBar: {
    width: 18,
    height: 2,
    backgroundColor: colors.text.muted,
    borderRadius: 1,
  },
  navList: {
    flex: 1,
    width: "100%",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  navItemActive: {
    backgroundColor: colors.background.surface,
  },
  navItemHovered: {
    backgroundColor: colors.background.elevated,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.body,
  },
  navLabelActive: {
    color: colors.text.primary,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text.primary,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
  },
});
