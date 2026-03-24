import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { palette } from "@/constants/palette";
import { useCommunitree } from "@/context/communitree-context";

export default function ProfileScreen() {
  const { community, inCommunity, isOwner, signOut, user } = useCommunitree();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <ScrollView
      className="flex-1 bg-ivory"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        <Pressable
          className="mb-6 w-12 rounded-full border border-teal/20 bg-ivory-soft p-3"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={palette.slate} />
        </Pressable>

        {/* Header */}
        <View className="rounded-[32px] border border-teal/30 bg-slate px-6 py-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-teal-soft">
            Account
          </Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-white">
            {user.name}
          </Text>
          <Text className="mt-2 text-sm text-ivory/60">{user.email}</Text>
        </View>

        {/* Stat tiles */}
        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-[24px] bg-ivory-soft px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
              Coins
            </Text>
            <Text className="mt-2 text-3xl font-bold text-slate">
              {user.coins}
            </Text>
          </View>
          <View className="flex-1 rounded-[24px] bg-teal-mist px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/65">
              Streak
            </Text>
            <Text className="mt-2 text-3xl font-bold text-slate">
              {user.streakDays}d
            </Text>
          </View>
        </View>

        {/* Community slot */}
        <View className="mt-4 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
            Community
          </Text>
          {inCommunity ? (
            <View className="mt-3 flex-row items-center justify-between gap-4">
              <Text className="text-xl font-semibold text-slate">
                {community.name}
              </Text>
              <View className="rounded-full bg-teal-mist px-3 py-2">
                <Text className="text-sm font-semibold text-slate">
                  {isOwner ? "Owner" : "Member"}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="mt-3 text-base text-slate/60">
              Not in a community
            </Text>
          )}
        </View>

        {/* Sign out */}
        <Pressable
          className="mt-6 rounded-[24px] bg-slate/10 px-4 py-4"
          onPress={handleSignOut}
        >
          <Text className="text-center text-sm font-semibold text-slate">
            Sign out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
