import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react-native";
import {
  useGetApiMenuCategories,
  useGetApiMenuItems,
  usePostApiMenuItems,
  usePutApiMenuItemsId,
  useDeleteApiMenuItemsId,
  usePostApiMenuCategories,
  usePutApiMenuCategoriesId,
  useDeleteApiMenuCategoriesId,
  getGetApiMenuCategoriesQueryKey,
  getGetApiMenuItemsQueryKey,
} from "@odyssey/api-client";
import { colors, spacing, radius, typography } from "@/theme/tokens";
import { sharedStyles } from "@/theme/styles";
import CategoryList from "./CategoryList";
import MenuItemCard from "./MenuItemCard";
import MenuItemForm from "./MenuItemForm";
import CategoryForm from "./CategoryForm";

export default function MenuScreen() {
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: number;
    name: string;
    priceCents: number;
    categoryId: number;
  } | null>(null);
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // ─── Queries ────────────────────────────────────────────────────────────────
  const categoriesQuery = useGetApiMenuCategories();
  const categories = categoriesQuery.data?.data ?? [];

  const itemsQuery = useGetApiMenuItems(
    { categoryId: String(selectedCategoryId!) },
    { query: { enabled: selectedCategoryId != null } },
  );
  const items = itemsQuery.data?.data ?? [];

  // ─── Invalidation helpers ───────────────────────────────────────────────────
  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: getGetApiMenuCategoriesQueryKey(),
    });
  }, [queryClient]);

  const invalidateItems = useCallback(() => {
    if (selectedCategoryId != null) {
      queryClient.invalidateQueries({
        queryKey: getGetApiMenuItemsQueryKey({
          categoryId: String(selectedCategoryId),
        }),
      });
    }
  }, [queryClient, selectedCategoryId]);

  // ─── Item mutations ─────────────────────────────────────────────────────────
  const createItem = usePostApiMenuItems({
    mutation: {
      onSuccess: () => {
        invalidateItems();
        invalidateCategories();
        setItemFormVisible(false);
      },
    },
  });

  const updateItem = usePutApiMenuItemsId({
    mutation: {
      onSuccess: () => {
        invalidateItems();
        setItemFormVisible(false);
        setEditingItem(null);
      },
    },
  });

  const deleteItem = useDeleteApiMenuItemsId({
    mutation: {
      onSuccess: () => {
        invalidateItems();
        invalidateCategories();
        setItemFormVisible(false);
        setEditingItem(null);
      },
    },
  });

  // ─── Category mutations ─────────────────────────────────────────────────────
  const createCategory = usePostApiMenuCategories({
    mutation: {
      onSuccess: () => {
        invalidateCategories();
        setCategoryFormVisible(false);
      },
    },
  });

  const updateCategory = usePutApiMenuCategoriesId({
    mutation: {
      onSuccess: () => {
        invalidateCategories();
        setCategoryFormVisible(false);
        setEditingCategory(null);
      },
    },
  });

  const deleteCategory = useDeleteApiMenuCategoriesId({
    mutation: {
      onSuccess: () => {
        invalidateCategories();
        setCategoryFormVisible(false);
        setEditingCategory(null);
        setSelectedCategoryId(null);
      },
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveItem = useCallback(
    (data: { name: string; priceCents: number; categoryId?: number }) => {
      if (editingItem) {
        updateItem.mutate({
          id: String(editingItem.id),
          data: { name: data.name, priceCents: data.priceCents },
        });
      } else {
        createItem.mutate({
          data: {
            name: data.name,
            priceCents: data.priceCents,
            categoryId: data.categoryId!,
          },
        });
      }
    },
    [editingItem, updateItem, createItem],
  );

  const handleDeleteItem = useCallback(() => {
    if (editingItem) {
      deleteItem.mutate({ id: String(editingItem.id) });
    }
  }, [editingItem, deleteItem]);

  const handleToggleAvailable = useCallback(
    (itemId: number, available: boolean) => {
      updateItem.mutate({
        id: String(itemId),
        data: { available },
      });
    },
    [updateItem],
  );

  const handleSaveCategory = useCallback(
    (data: { name: string }) => {
      if (editingCategory) {
        updateCategory.mutate({
          id: String(editingCategory.id),
          data: { name: data.name },
        });
      } else {
        createCategory.mutate({ data: { name: data.name } });
      }
    },
    [editingCategory, updateCategory, createCategory],
  );

  const handleDeleteCategory = useCallback(() => {
    if (editingCategory) {
      deleteCategory.mutate({ id: String(editingCategory.id) });
    }
  }, [editingCategory, deleteCategory]);

  const openAddItem = useCallback(() => {
    setEditingItem(null);
    setItemFormVisible(true);
  }, []);

  const openEditItem = useCallback(
    (item: { id: number; name: string; priceCents: number }) => {
      setEditingItem({
        ...item,
        categoryId: selectedCategoryId!,
      });
      setItemFormVisible(true);
    },
    [selectedCategoryId],
  );

  const openAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryFormVisible(true);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CategoryList
        categories={categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          itemCount: c.itemCount,
        }))}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
        onAddCategory={openAddCategory}
      />

      <View style={styles.content}>
        <View style={styles.toolbar}>
          <Text style={sharedStyles.headingLg}>Menu</Text>
          {selectedCategoryId != null && (
            <Pressable style={styles.addItemButton} onPress={openAddItem}>
              <Plus size={16} color={colors.background.base} />
              <Text style={styles.addItemText}>Add Item</Text>
            </Pressable>
          )}
        </View>

        {selectedCategoryId == null ? (
          <View style={styles.emptyState}>
            <Text style={sharedStyles.body}>
              Select a category to view items
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((item: any) => (
              <View key={item.id} style={styles.gridItem}>
                <MenuItemCard
                  item={item}
                  onPress={() => openEditItem(item)}
                  onToggleAvailable={(available) =>
                    handleToggleAvailable(item.id, available)
                  }
                />
              </View>
            ))}
          </View>
        )}
      </View>

      <MenuItemForm
        visible={itemFormVisible}
        item={editingItem}
        categoryId={selectedCategoryId}
        onSave={handleSaveItem}
        onDelete={editingItem ? handleDeleteItem : undefined}
        onClose={() => {
          setItemFormVisible(false);
          setEditingItem(null);
        }}
      />

      <CategoryForm
        visible={categoryFormVisible}
        category={editingCategory}
        onSave={handleSaveCategory}
        onDelete={editingCategory ? handleDeleteCategory : undefined}
        onClose={() => {
          setCategoryFormVisible(false);
          setEditingCategory(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  addItemText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  gridItem: {
    width: "31%",
    minWidth: 240,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
