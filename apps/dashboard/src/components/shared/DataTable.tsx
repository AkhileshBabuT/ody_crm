import React, { type ReactNode, useCallback } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface Column {
  key: string;
  label: string;
  width?: number;
  render?: (item: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowPress?: (item: any) => void;
  keyExtractor: (item: any) => string;
}

export default function DataTable({
  columns,
  data,
  onRowPress,
  keyExtractor,
}: DataTableProps) {
  const renderRow = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const bg =
        index % 2 === 0
          ? colors.background.base
          : colors.background.surface;

      return (
        <Pressable
          style={[styles.row, { backgroundColor: bg }]}
          onPress={onRowPress ? () => onRowPress(item) : undefined}
          disabled={!onRowPress}
        >
          {columns.map((col) => (
            <View key={col.key} style={[styles.cell, col.width != null && { width: col.width }]}>
              {col.render ? (
                col.render(item)
              ) : (
                <Text style={styles.cellText} numberOfLines={1}>
                  {String(item[col.key] ?? "")}
                </Text>
              )}
            </View>
          ))}
        </Pressable>
      );
    },
    [columns, onRowPress],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {columns.map((col) => (
          <View key={col.key} style={[styles.cell, col.width != null && { width: col.width }]}>
            <Text style={styles.headerText}>{col.label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerText: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cell: {
    flex: 1,
    justifyContent: "center",
  },
  cellText: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
  },
});
