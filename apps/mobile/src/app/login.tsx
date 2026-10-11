import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { loginWithKakao } from "@/auth/kakaoLogin";
import { theme } from "@/theme";

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginWithKakao();

      if (!result.ok && result.reason === "invalid-response") {
        setError("로그인 응답을 확인할 수 없어요. 잠시 후 다시 시도해주세요.");
      }
      // 성공 시 세션이 저장되면 루트 레이아웃의 Stack.Protected 가
      // 자동으로 홈 화면으로 전환합니다.
    } catch {
      setError("로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.hero}>
        <Text style={styles.logo}>Globber</Text>
        <Text style={styles.subtitle}>지구본 위에서, 나의 여행을 한눈에</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="카카오로 로그인"
        disabled={loading}
        onPress={handleLogin}
        style={({ pressed }) => [styles.kakaoButton, pressed && styles.pressed]}
      >
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.kakaoLabel}>카카오로 시작하기</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, paddingHorizontal: 32, justifyContent: "flex-end" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  logo: { color: theme.textPrimary, fontSize: 40, fontWeight: "700" },
  subtitle: { color: theme.textSecondary, fontSize: 15 },
  error: { color: "#ff8a8a", textAlign: "center", marginBottom: 16 },
  kakaoButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.kakao,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoLabel: { color: "#000", fontSize: 14, fontWeight: "500" },
  pressed: { opacity: 0.85 },
});

export default LoginScreen;
