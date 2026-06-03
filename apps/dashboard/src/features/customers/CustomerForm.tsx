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

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface CustomerFormProps {
  visible: boolean;
  customer?: CustomerData | null;
  onSave: (data: { name: string; email: string; phone?: string }) => void;
  onClose: () => void;
}

export default function CustomerForm({
  visible,
  customer,
  onSave,
  onClose,
}: CustomerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const isEditing = !!customer;

  useEffect(() => {
    if (visible) {
      setName(customer?.name ?? "");
      setEmail(customer?.email ?? "");
      setPhone(customer?.phone ?? "");
      setErrors({});
    }
  }, [visible, customer]);

  function validate(): boolean {
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Invalid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const payload: { name: string; email: string; phone?: string } = {
      name: name.trim(),
      email: email.trim(),
    };
    if (phone.trim()) payload.phone = phone.trim();
    onSave(payload);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Edit Customer" : "New Customer"}
            </Text>
            <Pressable onPress={onClose} accessibilityLabel="Close">
              <X size={20} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={colors.text.dim}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.text.dim}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>PHONE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.text.dim}
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <Pressable
            style={styles.saveBtn}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? "Save changes" : "Create customer"}
          >
            <Text style={styles.saveBtnText}>
              {isEditing ? "Save Changes" : "Create Customer"}
            </Text>
          </Pressable>
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
    width: "90%",
    maxWidth: 480,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.text.subtle,
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
  inputError: {
    borderColor: colors.accent.negative,
  },
  errorText: {
    color: colors.accent.negative,
    fontFamily: "Inter",
    ...typography.caption,
  },
  saveBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  saveBtnText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 14,
  },
});
