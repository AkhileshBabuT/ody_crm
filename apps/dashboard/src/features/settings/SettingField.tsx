import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface SettingFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SettingField({
  label,
  value,
  onChangeText,
  placeholder,
}: SettingFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.dim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.label,
  },
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
});
