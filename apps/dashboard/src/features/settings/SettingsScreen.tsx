import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Save } from "lucide-react-native";
import { useGetApiSettings, usePutApiSettingsKey } from "@odyssey/api-client";
import { colors, spacing, radius, typography } from "@/theme/tokens";
import SettingField from "./SettingField";

const FIELDS = [
  { key: "restaurant_name", label: "Restaurant Name", placeholder: "e.g. The Golden Fork" },
  { key: "operating_hours", label: "Operating Hours", placeholder: "e.g. Mon–Sat 11am–10pm" },
  { key: "contact_email", label: "Contact Email", placeholder: "e.g. hello@restaurant.com" },
  { key: "phone", label: "Phone", placeholder: "e.g. (555) 123-4567" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

type FormValues = Record<FieldKey, string>;

const EMPTY_FORM: FormValues = {
  restaurant_name: "",
  operating_hours: "",
  contact_email: "",
  phone: "",
};

export default function SettingsScreen() {
  const { data: settings } = useGetApiSettings();
  const mutation = usePutApiSettingsKey();

  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [initial, setInitial] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Populate form from API data
  useEffect(() => {
    if (!settings) return;
    const values = { ...EMPTY_FORM };
    for (const setting of settings) {
      if (setting.key in values) {
        values[setting.key as FieldKey] = setting.value;
      }
    }
    setForm(values);
    setInitial(values);
  }, [settings]);

  const isDirty = FIELDS.some((f) => form[f.key] !== initial[f.key]);

  const handleChange = useCallback((key: FieldKey, text: string) => {
    setForm((prev) => ({ ...prev, [key]: text }));
    setSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSuccess(false);

    const changed = FIELDS.filter((f) => form[f.key] !== initial[f.key]);

    try {
      await Promise.all(
        changed.map((f) =>
          mutation.mutateAsync({
            key: f.key,
            data: { value: form[f.key] },
          }),
        ),
      );
      setInitial({ ...form });
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }, [form, initial, mutation]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.heading}>Restaurant Details</Text>

          <View style={styles.fields}>
            {FIELDS.map((f) => (
              <SettingField
                key={f.key}
                label={f.label}
                value={form[f.key]}
                onChangeText={(text) => handleChange(f.key, text)}
                placeholder={f.placeholder}
              />
            ))}
          </View>

          <View style={styles.footer}>
            {success && (
              <Text style={styles.successText}>Settings saved successfully.</Text>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                (!isDirty || saving) && styles.saveBtnDisabled,
                pressed && isDirty && !saving && styles.saveBtnPressed,
              ]}
              onPress={handleSave}
              disabled={!isDirty || saving}
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
            >
              <Save size={16} color={colors.background.base} />
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["3xl"],
  },
  wrapper: {
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  heading: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.headingMd,
  },
  fields: {
    gap: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.md,
  },
  successText: {
    color: colors.accent.positive,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
});
