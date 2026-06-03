import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, usePathname } from "expo-router";
import AppShell from "@/components/layout/AppShell";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/menu": "Menu",
  "/customers": "Customers",
  "/settings": "Settings",
  "/ui-library": "UI Library",
};

export default function RootLayout() {
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname] ?? "Dashboard";
  const showLive = pathname === "/" || pathname === "/orders";

  useEffect(() => {
    // Load Inter font via link tag on web
    if (Platform.OS === "web") {
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <AppShell title={title} showLiveBadge={showLive}>
          <Slot />
        </AppShell>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
