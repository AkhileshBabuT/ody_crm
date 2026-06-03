import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useGetApiDashboardStats } from "@odyssey/api-client";
import { useGetApiOrders } from "@odyssey/api-client";
import { formatCents } from "@odyssey/shared";
import { colors, spacing, typography } from "@/theme/tokens";
import StatCard from "@/components/shared/StatCard";
import OrderVolumeChart from "./OrderVolumeChart";
import PopularItemsList from "./PopularItemsList";
import LiveOrderFeed from "./LiveOrderFeed";

export default function DashboardScreen() {
  const { data: stats } = useGetApiDashboardStats({
    query: { refetchInterval: 15_000, staleTime: 0 },
  });

  const { data: recentOrders } = useGetApiOrders(
    { page: 1, pageSize: 10 },
    { query: { refetchInterval: 5_000, staleTime: 0 } },
  );

  const revenue = stats?.totalRevenueCents ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const pending = stats?.pendingOrders ?? 0;
  const ordersToday = stats?.ordersToday ?? 0;
  const popularItems = stats?.popularItems ?? [];
  const topSeller = popularItems[0];
  const avgTicket = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;

  const orders = recentOrders?.data ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* KPI Row */}
      <View style={styles.kpiRow}>
        <StatCard
          label="Revenue Today"
          value={formatCents(revenue)}
          subtitle={`${ordersToday} orders today`}
        />
        <StatCard
          label="Total Orders"
          value={String(totalOrders)}
          trend={pending > 0 ? `${pending} pending` : undefined}
          trendPositive={false}
        />
        <StatCard
          label="Avg. Ticket"
          value={formatCents(avgTicket)}
          subtitle="Per order average"
        />
        <StatCard
          label="Top Seller"
          value={topSeller?.name ?? "—"}
          subtitle={topSeller ? `${topSeller.totalQuantity} sold` : "No data"}
        />
      </View>

      {/* Middle Row: Chart + Popular Items */}
      <View style={styles.middleRow}>
        <View style={styles.chartCol}>
          <OrderVolumeChart ordersToday={ordersToday} />
        </View>
        <View style={styles.popularCol}>
          <PopularItemsList items={popularItems.slice(0, 5)} />
        </View>
      </View>

      {/* Bottom Row: Live Order Feed */}
      <LiveOrderFeed
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalCents: o.totalCents,
          createdAt: o.createdAt,
        }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.lg,
    flexWrap: "wrap",
  },
  middleRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  chartCol: {
    flex: 2,
  },
  popularCol: {
    flex: 1,
  },
});
