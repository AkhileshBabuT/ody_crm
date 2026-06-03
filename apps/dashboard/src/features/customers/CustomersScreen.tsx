import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetApiCustomers,
  useGetApiCustomersId,
  usePostApiCustomers,
  usePutApiCustomersId,
  getGetApiCustomersQueryKey,
} from "@odyssey/api-client";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/theme/tokens";
import CustomerRow from "./CustomerRow";
import CustomerForm from "./CustomerForm";

const PAGE_SIZE = 20;

export default function CustomersScreen() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formVisible, setFormVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Fetch customer list
  const { data: customersResponse, isLoading } = useGetApiCustomers(
    { page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined },
    {},
  );

  const customers = customersResponse?.data ?? [];
  const meta = customersResponse?.meta ?? {
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
  };

  // Fetch selected customer detail
  const { data: customerDetail } = useGetApiCustomersId(
    selectedCustomerId ?? "",
    { query: { enabled: !!selectedCustomerId } },
  );

  // Mutations
  const createCustomer = usePostApiCustomers({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiCustomersQueryKey() });
        setFormVisible(false);
      },
    },
  });

  const updateCustomer = usePutApiCustomersId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiCustomersQueryKey() });
        setFormVisible(false);
        setSelectedCustomerId(null);
      },
    },
  });

  // Handlers
  const handleRowPress = useCallback((customerId: number) => {
    setSelectedCustomerId(String(customerId));
    setFormVisible(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedCustomerId(null);
    setFormVisible(true);
  }, []);

  const handleSave = useCallback(
    (data: { name: string; email: string; phone?: string }) => {
      if (selectedCustomerId) {
        updateCustomer.mutate({ id: selectedCustomerId, data });
      } else {
        createCustomer.mutate({ data });
      }
    },
    [selectedCustomerId, updateCustomer, createCustomer],
  );

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setSelectedCustomerId(null);
  }, []);

  // Pagination
  const rangeStart = (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.totalCount);
  const hasPrev = meta.page > 1;
  const hasNext = meta.page < meta.totalPages;

  // Resolve the customer data for the form
  const editingCustomer = selectedCustomerId && customerDetail?.data
    ? {
        id: customerDetail.data.id,
        name: customerDetail.data.name,
        email: customerDetail.data.email,
        phone: customerDetail.data.phone,
      }
    : null;

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Search size={16} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customers..."
            placeholderTextColor={colors.text.dim}
            autoCapitalize="none"
          />
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={handleAddNew}
          accessibilityRole="button"
          accessibilityLabel="Add customer"
        >
          <Plus size={16} color={colors.background.base} />
          <Text style={styles.addBtnText}>Add Customer</Text>
        </Pressable>
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.nameCol]}>Name</Text>
          <Text style={[styles.headerCell, styles.emailCol]}>Email</Text>
          <Text style={[styles.headerCell, styles.ordersCol]}>Orders</Text>
          <Text style={[styles.headerCell, styles.spentCol]}>Total Spent</Text>
          <Text style={[styles.headerCell, styles.lastOrderCol]}>Last Order</Text>
        </View>

        {/* Data Rows */}
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <CustomerRow
              customer={item}
              index={index}
              onPress={() => handleRowPress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? "Loading customers..." : "No customers found"}
              </Text>
            </View>
          }
        />
      </View>

      {/* Pagination */}
      {meta.totalCount > 0 && (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Showing {rangeStart}-{rangeEnd} of {meta.totalCount}
          </Text>
          <View style={styles.paginationButtons}>
            <Pressable
              style={[styles.pageBtn, !hasPrev && styles.pageBtnDisabled]}
              onPress={() => hasPrev && setPage((p) => p - 1)}
              disabled={!hasPrev}
              accessibilityRole="button"
              accessibilityLabel="Previous page"
            >
              <ChevronLeft size={16} color={hasPrev ? colors.text.primary : colors.text.dim} />
              <Text style={[styles.pageBtnText, !hasPrev && styles.pageBtnTextDisabled]}>
                Prev
              </Text>
            </Pressable>
            <Pressable
              style={[styles.pageBtn, !hasNext && styles.pageBtnDisabled]}
              onPress={() => hasNext && setPage((p) => p + 1)}
              disabled={!hasNext}
              accessibilityRole="button"
              accessibilityLabel="Next page"
            >
              <Text style={[styles.pageBtnText, !hasNext && styles.pageBtnTextDisabled]}>
                Next
              </Text>
              <ChevronRight size={16} color={hasNext ? colors.text.primary : colors.text.dim} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Form Modal */}
      <CustomerForm
        visible={formVisible}
        customer={editingCustomer}
        onSave={handleSave}
        onClose={handleCloseForm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.body,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  addBtnText: {
    color: colors.background.base,
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 13,
  },
  tableContainer: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.background.border,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerCell: {
    color: colors.text.subtle,
    fontFamily: "Inter",
    ...typography.label,
  },
  nameCol: {
    flex: 2,
  },
  emailCol: {
    flex: 3,
  },
  ordersCol: {
    flex: 1,
    textAlign: "right",
  },
  spentCol: {
    flex: 1.5,
    textAlign: "right",
  },
  lastOrderCol: {
    flex: 1.5,
    textAlign: "right",
  },
  emptyContainer: {
    paddingVertical: spacing["3xl"],
    alignItems: "center",
  },
  emptyText: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.body,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationText: {
    color: colors.text.muted,
    fontFamily: "Inter",
    ...typography.bodySm,
  },
  paginationButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    color: colors.text.primary,
    fontFamily: "Inter",
    ...typography.bodySm,
    fontWeight: "600",
  },
  pageBtnTextDisabled: {
    color: colors.text.dim,
  },
});
