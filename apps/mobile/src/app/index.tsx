import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApi, useLogoutMutation } from "@globber/query";
import type { MemberTravelCity } from "@globber/shared/types/member";
import { useQuery } from "@tanstack/react-query";

import { theme } from "@/theme";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const api = useApi();
  const logout = useLogoutMutation();

  // 웹과 동일한 공용 서비스(@globber/api)로 여행 데이터를 조회합니다.
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["member-travels"],
    queryFn: () => api.member.getMemberTravels(),
  });

  const cities: MemberTravelCity[] = data?.data.travels.flatMap(travel => travel.cities) ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>내 여행</Text>
        <Pressable accessibilityRole="button" disabled={logout.isPending} onPress={() => logout.mutate()}>
          <Text style={styles.logout}>로그아웃</Text>
        </Pressable>
      </View>

      {isPending ? (
        <ActivityIndicator color={theme.textPrimary} style={styles.center} />
      ) : isError || !data ? (
        <View style={styles.center}>
          <Text style={styles.message}>여행 기록을 불러오지 못했어요.</Text>
          <Pressable accessibilityRole="button" onPress={() => refetch()}>
            <Text style={styles.retry}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={cities}
          keyExtractor={city => String(city.cityId)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.message}>아직 기록한 도시가 없어요.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.city}>{item.cityName}</Text>
              <Text style={styles.country}>{item.countryName}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  title: { color: theme.textPrimary, fontSize: 24, fontWeight: "700" },
  logout: { color: theme.textSecondary, fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  list: { padding: 20, gap: 12 },
  card: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 16 },
  city: { color: theme.textPrimary, fontSize: 16, fontWeight: "600" },
  country: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  message: { color: theme.textSecondary, textAlign: "center" },
  retry: { color: theme.textPrimary, textDecorationLine: "underline" },
});

export default HomeScreen;
