import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";

import { useCommunitree } from "@/context/communitree-context";

export default function CommunityStatsScreen() {
  const { community, completionRate, user } = useCommunitree();

  const totalCoins = community.weeklyHistory.reduce((sum, week) => sum + week.coinsEarned, 0) + user.coins;
  const averageCompletion =
    community.weeklyHistory.reduce((sum, week) => sum + week.completionRate, 0) / community.weeklyHistory.length;
  const perfectDays = community.weeklyHistory.reduce((sum, week) => sum + week.perfectDays, 0);

  return (
    <ScrollView className="flex-1 bg-[#F1F5EF]" contentContainerStyle={{ paddingBottom: 36 }}>
      <View className="px-6 pb-8 pt-16">
        <Pressable className="mb-6 w-12 rounded-full bg-white p-3" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1C2B23" />
        </Pressable>

        <View className="rounded-[34px] border border-[#D0DBCD] bg-[#173D31] px-6 py-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#A6D0BE]">Community stats</Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-white">
            Track how shared consistency shapes the plant over time.
          </Text>
          <Text className="mt-4 text-base leading-6 text-[#D4EBDD]">
            This view mirrors the design document: week-by-week completion trends, all-time performance, and collective reward signals.
          </Text>
        </View>

        <View className="mt-6 flex-row gap-4">
          <View className="flex-1 rounded-[28px] bg-white px-5 py-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#5A7B60]">Average rate</Text>
            <Text className="mt-2 text-3xl font-bold text-[#1C2B23]">{Math.round(averageCompletion * 100)}%</Text>
          </View>
          <View className="flex-1 rounded-[28px] bg-[#E5EFE8] px-5 py-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#5A7B60]">Perfect days</Text>
            <Text className="mt-2 text-3xl font-bold text-[#1C2B23]">{perfectDays}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-4">
          <View className="flex-1 rounded-[28px] bg-[#F8EEDB] px-5 py-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8C6A3D]">Plant level</Text>
            <Text className="mt-2 text-3xl font-bold text-[#2A2018]">L{community.plantLevel}</Text>
          </View>
          <View className="flex-1 rounded-[28px] bg-white px-5 py-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#5A7B60]">Coins earned</Text>
            <Text className="mt-2 text-3xl font-bold text-[#1C2B23]">{totalCoins}</Text>
          </View>
        </View>

        <View className="mt-8 rounded-[32px] border border-[#D0DBCD] bg-white px-5 py-5">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#5A7B60]">This week</Text>
          <Text className="mt-2 text-2xl font-bold text-[#1C2B23]">Live completion snapshot</Text>
          <View className="mt-4 h-4 overflow-hidden rounded-full bg-[#D3DDD1]">
            <View className="h-full w-1/2 bg-[#D97D74]" />
            <View className="absolute right-0 top-0 h-full w-1/2 bg-[#8BC38F]" />
            <View
              className="absolute left-0 top-0 h-full bg-[#6A726C]/55"
              style={{ width: `${Math.max(8, completionRate * 100)}%` }}
            />
          </View>
          <Text className="mt-3 text-sm leading-6 text-[#66786B]">
            {Math.round(completionRate * 100)}% of members have completed today&apos;s community task so far.
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#5A7B60]">Week-by-week</Text>
          <Text className="mt-2 text-2xl font-bold text-[#1C2B23]">Community contribution history</Text>

          <View className="mt-4 gap-4">
            {community.weeklyHistory.map((week) => (
              <View key={week.week} className="rounded-[28px] border border-[#D0DBCD] bg-white px-5 py-5">
                <View className="flex-row items-center justify-between gap-4">
                  <Text className="text-xl font-semibold text-[#1C2B23]">{week.week}</Text>
                  <Text className="text-sm font-semibold uppercase tracking-[1px] text-[#5A7B60]">
                    {Math.round(week.completionRate * 100)}%
                  </Text>
                </View>

                <View className="mt-4 h-3 overflow-hidden rounded-full bg-[#E0E7DD]">
                  <View
                    className="h-full rounded-full bg-[#5A944E]"
                    style={{ width: `${week.completionRate * 100}%` }}
                  />
                </View>

                <View className="mt-4 flex-row justify-between gap-4">
                  <View>
                    <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8A7A63]">Perfect days</Text>
                    <Text className="mt-1 text-lg font-semibold text-[#2A2018]">{week.perfectDays}</Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8A7A63]">Coins</Text>
                    <Text className="mt-1 text-lg font-semibold text-[#2A2018]">{week.coinsEarned}</Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8A7A63]">Plant change</Text>
                    <Text className="mt-1 text-lg font-semibold text-[#2A2018]">
                      {week.plantDelta > 0 ? `+${week.plantDelta}` : week.plantDelta}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
