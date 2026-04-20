import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addMenuItem,
  deleteMenuItem,
  MenuItem,
  MenuCategory,
  NewMenuItem,
  subscribeCafeteriaMenu,
  updateMenuItem,
} from "../../../services/firebase/cafeteria";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";
import { AdminCard } from "../components/AdminCard";
import { FormModal } from "../components/FormModal";
import { RoleGuard } from "../components/RoleGuard";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

const CATEGORIES: MenuCategory[] = ["breakfast", "lunch", "snack", "dinner", "drinks"];
const CATEGORY_EMOJI: Record<MenuCategory, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  snack: "🍿",
  dinner: "🌙",
  drinks: "🧃",
};

const EMPTY_FORM: Omit<NewMenuItem, "available"> & { available: boolean } = {
  name: "",
  price: 0,
  category: "lunch",
  description: "",
  available: true,
};

export function CafeteriaMenuScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [filterCat, setFilterCat] = useState<MenuCategory | "all">("all");

  // Realtime Firestore subscription
  useEffect(() => {
    const unsub = subscribeCafeteriaMenu(
      (data) => { setItems(data); setLoading(false); },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalVisible(true);
  }

  function openEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description ?? "",
      available: item.available,
    });
    setModalVisible(true);
  }

  async function handleDelete(item: MenuItem) {
    Alert.alert("Delete Item", `Remove "${item.name}" from the menu?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuItem(item.id);
          } catch {
            Alert.alert("Error", "Could not delete the item.");
          }
        },
      },
    ]);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Please enter a name.");
      return;
    }
    const price = Number(form.price);
    if (isNaN(price) || price < 0) {
      Alert.alert("Validation", "Enter a valid price.");
      return;
    }
    try {
      setSaving(true);
      const payload: NewMenuItem = {
        name: form.name.trim(),
        price,
        category: form.category,
        available: form.available,
        description: form.description?.trim() || undefined,
      };
      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await addMenuItem(payload);
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = filterCat === "all" ? items : items.filter((i) => i.category === filterCat);

  return (
    <RoleGuard requiredRole={["cafeteria_admin", "super_admin"]}>
      <Screen style={{ paddingHorizontal: 0 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: 32 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="title">Cafeteria Menu</AppText>
              <AppText variant="muted" style={{ marginTop: 3 }}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </AppText>
            </View>
            <PressableScale onPress={openAdd}>
              <View
                style={{
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 18, lineHeight: 20 }}>+</AppText>
                <AppText style={{ color: "#fff", fontWeight: "600" }}>Add Item</AppText>
              </View>
            </PressableScale>
          </View>

          {/* Category filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: theme.spacing.lg }}
          >
            {(["all", ...CATEGORIES] as const).map((cat) => (
              <PressableScale key={cat} onPress={() => setFilterCat(cat)} style={{ marginRight: 8 }}>
                <View
                  style={{
                    backgroundColor:
                      filterCat === cat ? theme.colors.accent : theme.colors.card,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor:
                      filterCat === cat ? theme.colors.accent : theme.colors.border,
                  }}
                >
                  <AppText
                    style={{
                      color: filterCat === cat ? "#fff" : theme.colors.text,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {cat === "all" ? "All" : `${CATEGORY_EMOJI[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                  </AppText>
                </View>
              </PressableScale>
            ))}
          </ScrollView>

          {/* Items */}
          {loading ? (
            <AppText variant="muted" style={{ textAlign: "center", marginTop: 40 }}>
              Loading…
            </AppText>
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <AppText style={{ fontSize: 40 }}>🍽️</AppText>
              <AppText variant="muted" style={{ marginTop: 12 }}>No items yet. Tap + to add.</AppText>
            </View>
          ) : (
            filtered.map((item) => (
              <AdminCard
                key={item.id}
                title={item.name}
                subtitle={`₹${item.price} · ${CATEGORY_EMOJI[item.category]} ${item.category}`}
                badge={item.available ? "Available" : "Unavailable"}
                badgeColor={item.available ? theme.colors.success : theme.colors.muted}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
              >
                {item.description ? (
                  <AppText variant="muted" style={{ marginTop: 6 }}>
                    {item.description}
                  </AppText>
                ) : null}
              </AdminCard>
            ))
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <FormModal
          visible={modalVisible}
          title={editingId ? "Edit Menu Item" : "New Menu Item"}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSave}
          submitLabel={editingId ? "Update" : "Add Item"}
          loading={saving}
        >
          <Field label="Name">
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Paneer Butter Masala"
              placeholderTextColor={theme.colors.muted}
              style={inputStyle(theme)}
            />
          </Field>

          <Field label="Price (₹)">
            <TextInput
              value={String(form.price === 0 ? "" : form.price)}
              onChangeText={(v) => setForm((f) => ({ ...f, price: Number(v) || 0 }))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.muted}
              style={inputStyle(theme)}
            />
          </Field>

          <Field label="Category">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <PressableScale key={cat} onPress={() => setForm((f) => ({ ...f, category: cat }))}>
                    <View
                      style={{
                        backgroundColor:
                          form.category === cat ? theme.colors.accent : theme.colors.card,
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderWidth: 1,
                        borderColor:
                          form.category === cat ? theme.colors.accent : theme.colors.border,
                      }}
                    >
                      <AppText
                        style={{
                          color: form.category === cat ? "#fff" : theme.colors.text,
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        {CATEGORY_EMOJI[cat]} {cat}
                      </AppText>
                    </View>
                  </PressableScale>
                ))}
              </View>
            </ScrollView>
          </Field>

          <Field label="Description (optional)">
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Short description"
              placeholderTextColor={theme.colors.muted}
              multiline
              style={[inputStyle(theme), { minHeight: 72, textAlignVertical: "top" }]}
            />
          </Field>

          <Field label="Available">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Switch
                value={form.available}
                onValueChange={(v) => setForm((f) => ({ ...f, available: v }))}
                trackColor={{ true: theme.colors.success, false: theme.colors.muted }}
                thumbColor="#fff"
              />
              <AppText variant="muted">{form.available ? "Yes" : "No"}</AppText>
            </View>
          </Field>
        </FormModal>
      </Screen>
    </RoleGuard>
  );
}

/* ---- helpers ---- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <AppText variant="muted" style={{ marginBottom: 6, fontWeight: "600" }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function inputStyle(theme: any) {
  return {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 15,
  };
}
