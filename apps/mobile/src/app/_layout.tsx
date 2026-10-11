import { useEffect, useState } from "react";

import { ApiProvider } from "@globber/query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { restoreSession, useSession } from "@/auth/session";
import { api } from "@/lib/api";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const RootNavigator = () => {
  const { ready, token } = useSession();
  const isSignedIn = token !== null;

  useEffect(() => {
    restoreSession().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  // 저장된 세션 복원이 끝나기 전에는 화면을 그리지 않습니다 (스플래시 유지)
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
};

const RootLayout = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <StatusBar style="light" />
        <RootNavigator />
      </ApiProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
