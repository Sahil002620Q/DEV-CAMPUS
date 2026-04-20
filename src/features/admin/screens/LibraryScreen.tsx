import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import {
  addLibraryResource,
  deleteLibraryResource,
  LibraryResource,
  NewLibraryResource,
  ResourceType,
  subscribeLibrary,
  updateLibraryResource,
} from "../../../services/firebase/library";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";
import { AdminCard } from "../components/AdminCard";
import { FormModal } from "../components/FormModal";
import { RoleGuard } from "../components/RoleGuard";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

const TYPES: ResourceType[] = ["book", "pdf", "journal", "announcement"];
const TYPE_EMOJI: Record<ResourceType, string> = {
  book: "📖",
  pdf: "📄",
  journal: "📰",
  announcement: "📣",
};
const TYPE_COLOR: Record<ResourceType, string> = {
  book: "#8B5CF6",
  pdf: "#3B82F6",
  journal: "#10B981",
  announcement: "#F59E0B",
};

const EMPTY_FORM: NewLibraryResource = {
  title: "",
  type: "book",
  author: "",
  available: true,
  description: "",
};

export function LibraryScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewLibraryResource>({ ...EMPTY_FORM });
  const [filterType, setFilterType] = useState<ResourceType | "all">("all");

  useEffect(() => {
    const unsub = subscribeLibrary(
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

  function openEdit(item: LibraryResource) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      type: item.type,
      author: item.author ?? "",
      available: item.available,
      description: item.description ?? "",
    });
    setModalVisible(true);
  }

  async function handleDelete(item: LibraryResource) {
    Alert.alert("Delete Resource", `Remove "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLibraryResource(item.id);
          } catch {
            Alert.alert("Error", "Could not delete.");
          }
        },
      },
    ]);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      Alert.alert("Validation", "Please enter a title.");
      return;
    }
    try {
      setSaving(true);
      const payload: NewLibraryResource = {
        title: form.title.trim(),
        type: form.type,
        author: form.author?.trim() || undefined,
        available: form.available,
        description: form.description?.trim() || undefined,
      };
      if (editingId) {
        await updateLibraryResource(editingId, payload);
      } else {
        await addLibraryResource(payload);
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = filterType === "all" ? items : items.filter((i) => i.type === filterType);

  return (
    <RoleGuard requiredRole={["library_admin", "super_admin"]}>
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
              <AppText variant="title">Library</AppText>
              <AppText variant="muted" style={{ marginTop: 3 }}>
                {items.length} resource{items.length !== 1 ? "s" : ""}
              </AppText>
            </View>
            <PressableScale onPress={openAdd}>
              <View
                style={{
                  backgroundColor: "#8B5CF6",
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 18, lineHeight: 20 }}>+</AppText>
                <AppText style={{ color: "#fff", fontWeight: "600" }}>Add</AppText>
              </View>
            </PressableScale>
          </View>

          {/* Type filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: theme.spacing.lg }}
          >
            {(["all", ...TYPES] as const).map((t) => (
              <PressableScale key={t} onPress={() => setFilterType(t)} style={{ marginRight: 8 }}>
                <View
                  style={{
                    backgroundColor:
                      filterType === t
                        ? t === "all"
                          ? theme.colors.accent
                          : TYPE_COLOR[t as ResourceType]
                        : theme.colors.card,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor:
                      filterType === t
                        ? t === "all"
                          ? theme.colors.accent
                          : TYPE_COLOR[t as ResourceType]
                        : theme.colors.border,
                  }}
                >
                  <AppText
                    style={{
                      color: filterType === t ? "#fff" : theme.colors.text,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {t === "all" ? "All" : `${TYPE_EMOJI[t as ResourceType]} ${t}`}
                  </AppText>
                </View>
              </PressableScale>
            ))}
          </ScrollView>

          {/* Items */}
          {loading ? (
            <AppText variant="muted" style={{ textAlign: "center", marginTop: 40 }}>Loading…</AppText>
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <AppText style={{ fontSize: 40 }}>📚</AppText>
              <AppText variant="muted" style={{ marginTop: 12 }}>No resources yet. Tap + to add.</AppText>
            </View>
          ) : (
            filtered.map((item) => (
              <AdminCard
                key={item.id}
                title={item.title}
                subtitle={[item.author, item.type].filter(Boolean).join(" · ")}
                badge={`${TYPE_EMOJI[item.type]} ${item.type}`}
                badgeColor={TYPE_COLOR[item.type]}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
              >
                {item.description ? (
                  <AppText variant="muted" style={{ marginTop: 6 }}>{item.description}</AppText>
                ) : null}
                {!item.available && (
                  <AppText style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    Currently unavailable
                  </AppText>
                )}
              </AdminCard>
            ))
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <FormModal
          visible={modalVisible}
          title={editingId ? "Edit Resource" : "New Resource"}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSave}
          submitLabel={editingId ? "Update" : "Add Resource"}
          loading={saving}
        >
          <Field label="Title">
            <TextInput
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder="e.g. Introduction to Algorithms"
              placeholderTextColor={theme.colors.muted}
              style={inputStyle(theme)}
            />
          </Field>

          <Field label="Type">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TYPES.map((t) => (
                <PressableScale key={t} onPress={() => setForm((f) => ({ ...f, type: t }))}>
                  <View
                    style={{
                      backgroundColor: form.type === t ? TYPE_COLOR[t] : theme.colors.card,
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderWidth: 1,
                      borderColor: form.type === t ? TYPE_COLOR[t] : theme.colors.border,
                    }}
                  >
                    <AppText
                      style={{
                        color: form.type === t ? "#fff" : theme.colors.text,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {TYPE_EMOJI[t]} {t}
                    </AppText>
                  </View>
                </PressableScale>
              ))}
            </View>
          </Field>

          <Field label="Author (optional)">
            <TextInput
              value={form.author}
              onChangeText={(v) => setForm((f) => ({ ...f, author: v }))}
              placeholder="Author name"
              placeholderTextColor={theme.colors.muted}
              style={inputStyle(theme)}
            />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <AppText variant="muted" style={{ marginBottom: 6, fontWeight: "600" }}>{label}</AppText>
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
