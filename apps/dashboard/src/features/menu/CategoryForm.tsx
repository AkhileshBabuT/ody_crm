import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { X } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";
import { sharedStyles } from "@/theme/styles";

interface CategoryFormProps {
  visible: boolean;
  category?: { id: number; name: string } | null;
  onSave: (data: { name: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function CategoryForm({
  visible,
  category,
  onSave,
  onDelete,
  onClose,
}: CategoryFormProps) {
  const [name, setName] = useState("");

  const isEditing = category != null;

  useEffect(() => {
    if (visible) {
      setName(category?.name ?? "");
    }
  }, [visible, category]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim() });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={sharedStyles.headingMd}>
              {isEditing ? "Edit Category" : "New Category"}
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color={colors.text.muted} />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={sharedStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Appetizers"
              placeholderTextColor={colors.text.dim}
            />
          </View>

          <View style={styles.actions}>
            {isEditing && onDelete && (
              <Pressable style={styles.deleteButton} onPress={onDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            )}
            <View style={styles.spacer} />
            <Pressable style={sharedStyles.buttonPrimary} onPress={handleSave}>
              <Text style={sharedStyles.buttonPrimaryText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: 400,
    maxWidth: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.label,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.accent.negative,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: colors.text.primary,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
});
