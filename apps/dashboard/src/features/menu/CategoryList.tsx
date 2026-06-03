import { View, Text, Pressable, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface Category {
  id: number;
  name: string;
  itemCount?: number;
}

interface CategoryListProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddCategory: () => void;
}

export default function CategoryList({
  categories,
  selectedId,
  onSelect,
  onAddCategory,
}: CategoryListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Pressable style={styles.addButton} onPress={onAddCategory}>
          <Plus size={16} color={colors.text.primary} />
        </Pressable>
      </View>

      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        return (
          <Pressable
            key={cat.id}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect(cat.id)}
          >
            <Text
              style={[styles.itemText, isSelected && styles.itemTextSelected]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
            {cat.itemCount != null && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cat.itemCount}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: colors.background.surface,
    borderRightWidth: 1,
    borderRightColor: colors.background.border,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  itemSelected: {
    backgroundColor: colors.background.elevated,
  },
  itemText: {
    color: colors.text.secondary,
    fontFamily: "Inter",
    ...typography.body,
    flex: 1,
  },
  itemTextSelected: {
    color: colors.text.primary,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.background.base,
    borderRadius: radius.full,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.sm,
  },
  badgeText: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.caption,
  },
});
