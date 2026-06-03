import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { formatCents } from "@odyssey/shared";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    priceCents: number;
    available: boolean;
  };
  onPress: () => void;
  onToggleAvailable: (available: boolean) => void;
}

export default function MenuItemCard({
  item,
  onPress,
  onToggleAvailable,
}: MenuItemCardProps) {
  return (
    <Pressable
      style={[styles.card, !item.available && styles.cardUnavailable]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Switch
          value={item.available}
          onValueChange={onToggleAvailable}
          trackColor={{
            false: colors.background.elevated,
            true: colors.accent.positive,
          }}
          thumbColor={colors.text.primary}
        />
      </View>

      <Text style={styles.price}>{formatCents(item.priceCents)}</Text>

      {!item.available && (
        <Text style={styles.unavailableLabel}>Unavailable</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  cardUnavailable: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    color: colors.accent.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
    marginBottom: spacing.xs,
  },
  unavailableLabel: {
    color: colors.accent.negative,
    fontFamily: "Inter",
    ...typography.label,
    marginTop: spacing.xs,
  },
});
