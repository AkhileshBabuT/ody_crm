import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.confirmButton,
                destructive && styles.confirmButtonDestructive,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    maxWidth: 400,
    width: "90%",
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingSm,
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.body,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  cancelButton: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: colors.text.muted,
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 13,
  },
  confirmButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDestructive: {
    backgroundColor: colors.accent.negative,
  },
  confirmText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
});
