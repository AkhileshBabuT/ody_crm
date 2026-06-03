import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { colors, spacing } from "@/theme/tokens";

type AppShellProps = {
  title: string;
  showLiveBadge?: boolean;
  unreadCount?: number;
  children: React.ReactNode;
};

export default function AppShell({
  title,
  showLiveBadge,
  unreadCount,
  children,
}: AppShellProps) {
  return (
    <View style={styles.root}>
      <Sidebar />
      <View style={styles.main}>
        <TopBar
          title={title}
          showLiveBadge={showLiveBadge}
          unreadCount={unreadCount}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background.base,
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  content: {
    padding: spacing.xl,
  },
});
