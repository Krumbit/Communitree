import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { palette } from "@/constants/palette";
import { useCommunitree } from "@/context/communitree-context";

export default function CommunityScreen() {
  const {
    community,
    completedCount,
    completionRate,
    createCommunityTask,
    equipped,
    isOwner,
    joinCommunity,
    toggleCommunityCompletion,
    unlockables,
    user,
  } = useCommunitree();
  const [joinCode, setJoinCode] = useState(community.code);
  const [taskTitle, setTaskTitle] = useState(community.currentTaskTitle);
  const [joinMessage, setJoinMessage] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [showTaskMaker, setShowTaskMaker] = useState(false);

  const currentMember = community.members.find(
    (member) => member.id === user.id,
  );
  const hasCompletedToday = currentMember?.completedToday ?? false;
  const growthChange =
    completedCount -
    Math.ceil(community.members.length * community.dailyThreshold);

  const equippedItems = useMemo(() => {
    return {
      pot: unlockables.find((unlockable) => unlockable.id === equipped.pot),
      ribbon: unlockables.find(
        (unlockable) => unlockable.id === equipped.ribbon,
      ),
      ornament: unlockables.find(
        (unlockable) => unlockable.id === equipped.ornament,
      ),
    };
  }, [equipped, unlockables]);

  return (
    <ScrollView
      className="flex-1 bg-ivory"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        <View className="rounded-[32px] border border-teal/20 bg-ivory-soft px-6 py-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
                Community view
              </Text>
              <Text className="mt-3 text-4xl font-bold leading-tight text-slate">
                {community.name}
              </Text>
              <Text className="mt-3 text-sm leading-6 text-slate/70">
                Shared habit, shared plant, shared accountability. Today&apos;s
                completion rate decides whether the plant grows or slips back.
              </Text>
            </View>

            <Pressable
              className="rounded-full bg-slate px-4 py-3"
              onPress={() => router.push("../community-stats")}
            >
              <Ionicons
                name="stats-chart-outline"
                size={18}
                color={palette.ivory}
              />
            </Pressable>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="rounded-full bg-teal-mist px-4 py-2">
              <Text className="text-sm font-semibold text-slate">
                Code {community.code}
              </Text>
            </View>
            {isOwner ? (
              <View className="rounded-full bg-slate/10 px-4 py-2">
                <Text className="text-sm font-semibold text-slate">Owner</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-6 rounded-[32px] border border-teal/30 bg-slate px-5 py-6">
          <View className="flex-row items-center justify-between gap-4">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-teal-soft">
                Plant level
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">
                L{community.plantLevel} {community.plantName}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-ivory/80">
              {community.levelProgress}% to next plant
            </Text>
          </View>

          <View className="mt-4 h-3 overflow-hidden rounded-full bg-ivory/10">
            <View
              className="h-full rounded-full bg-teal"
              style={{ width: `${community.levelProgress}%` }}
            />
          </View>

          <View className="relative mt-8 items-center justify-center pb-24 pt-8">
            <View className="absolute top-10 h-20 w-20 rounded-full bg-teal/25" />
            <View className="h-24 w-4 rounded-full bg-teal" />
            <View className="absolute left-[24%] top-10 h-20 w-12 -rotate-12 rounded-full bg-teal-soft" />
            <View className="absolute right-[24%] top-10 h-20 w-12 rotate-12 rounded-full bg-teal-soft" />
            <View className="absolute left-[18%] top-24 h-16 w-10 -rotate-[28deg] rounded-full bg-teal-deep" />
            <View className="absolute right-[18%] top-24 h-16 w-10 rotate-[28deg] rounded-full bg-teal-deep" />

            {equippedItems.ribbon ? (
              <View
                className="absolute bottom-20 h-4 w-24 rounded-full"
                style={{ backgroundColor: equippedItems.ribbon.accent }}
              />
            ) : null}

            {equippedItems.ornament ? (
              <View
                className="absolute right-[29%] top-20 h-6 w-6 rounded-full border-2 border-white"
                style={{ backgroundColor: equippedItems.ornament.accent }}
              />
            ) : null}

            <View
              className="absolute bottom-0 h-20 w-40 rounded-b-[40px] rounded-t-[24px] border border-teal-soft"
              style={{
                backgroundColor: equippedItems.pot?.accent ?? "#C5794A",
              }}
            />
          </View>

          <View className="rounded-[24px] bg-ivory-soft px-4 py-4">
            <View className="flex-row items-center justify-between gap-4">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-slate/60">
                Daily growth bar
              </Text>
              <Text className="text-sm font-semibold text-slate">
                {Math.round(completionRate * 100)}% complete
              </Text>
            </View>

            <View className="mt-4 h-4 overflow-hidden rounded-full bg-slate/10">
              <View className="h-full w-1/2 bg-slate/20" />
              <View className="absolute right-0 top-0 h-full w-1/2 bg-teal/60" />
              <View
                className="absolute left-0 top-0 h-full bg-slate/65"
                style={{ width: `${Math.max(8, completionRate * 100)}%` }}
              />
            </View>

            <View className="mt-3 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-sm leading-6 text-slate/70">
                The left side marks the setback range, the right side marks
                growth territory, and the dark overlay shows current check-ins.
              </Text>
              <View className="rounded-full bg-teal-mist px-3 py-2">
                <Text className="text-sm font-semibold text-slate">
                  {growthChange >= 0 ? `+${growthChange}` : growthChange} growth
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-[30px] border border-teal/20 bg-ivory-soft px-5 py-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
                Current community task
              </Text>
              <Text className="mt-2 text-2xl font-bold leading-tight text-slate">
                {community.currentTaskTitle}
              </Text>
              <Text className="mt-2 text-sm text-slate/70">
                {community.currentTaskEnds}
              </Text>
            </View>
            <Pressable
              className={`rounded-full px-4 py-3 ${hasCompletedToday ? "bg-slate" : "bg-teal"}`}
              onPress={toggleCommunityCompletion}
            >
              <Text className="text-sm font-semibold text-white">
                {hasCompletedToday ? "Completed" : "Check in"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            className="flex-1 rounded-[24px] bg-slate px-4 py-4"
            onPress={() => {
              setShowJoin((current) => !current);
              setJoinMessage("");
            }}
          >
            <Text className="text-center text-sm font-semibold text-ivory">
              Join community
            </Text>
          </Pressable>

          {isOwner ? (
            <Pressable
              className="flex-1 rounded-[24px] bg-teal px-4 py-4"
              onPress={() => {
                setShowTaskMaker((current) => !current);
                setTaskMessage("");
              }}
            >
              <Text className="text-center text-sm font-semibold text-white">
                Create task
              </Text>
            </Pressable>
          ) : null}
        </View>

        {showJoin ? (
          <View className="mt-4 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
            <Text className="text-lg font-semibold text-slate">
              Join with a code
            </Text>
            <TextInput
              className="mt-4 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
              placeholder="Enter community code"
              placeholderTextColor={palette.slateMuted}
              autoCapitalize="characters"
              value={joinCode}
              onChangeText={setJoinCode}
            />
            <Pressable
              className="mt-4 rounded-[20px] bg-slate px-4 py-4"
              onPress={() => {
                const result = joinCommunity(joinCode);
                setJoinMessage(result.message);
              }}
            >
              <Text className="text-center text-sm font-semibold text-white">
                Confirm join
              </Text>
            </Pressable>
            {joinMessage ? (
              <Text className="mt-3 text-sm leading-6 text-slate/70">
                {joinMessage}
              </Text>
            ) : null}
          </View>
        ) : null}

        {showTaskMaker ? (
          <View className="mt-4 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
            <Text className="text-lg font-semibold text-slate">
              Set this week&apos;s shared task
            </Text>
            <TextInput
              className="mt-4 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
              placeholder="e.g. 20 minutes of revision"
              placeholderTextColor={palette.slateMuted}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            <Pressable
              className="mt-4 rounded-[20px] bg-teal px-4 py-4"
              onPress={() => {
                createCommunityTask(taskTitle);
                setTaskMessage(
                  "Task updated. Daily check-ins reset for the new weekly habit.",
                );
              }}
            >
              <Text className="text-center text-sm font-semibold text-white">
                Publish task
              </Text>
            </Pressable>
            {taskMessage ? (
              <Text className="mt-3 text-sm leading-6 text-slate/70">
                {taskMessage}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View className="mt-8">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
            Members
          </Text>
          <Text className="mt-2 text-2xl font-bold text-slate">
            Who has checked in today
          </Text>
          <View className="mt-4 gap-4">
            {community.members.map((member) => (
              <View
                key={member.id}
                className={`rounded-[26px] border px-5 py-5 ${
                  member.completedToday
                    ? "border-teal/30 bg-teal/10"
                    : "border-slate/10 bg-slate/5"
                }`}
              >
                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-row items-center gap-4">
                    <View
                      className={`h-14 w-14 items-center justify-center rounded-full ${
                        member.completedToday ? "bg-teal" : "bg-slate/40"
                      }`}
                    >
                      <Text className="text-base font-bold text-white">
                        {member.initials}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-lg font-semibold text-slate">
                        {member.name}
                      </Text>
                      <Text className="mt-1 text-sm text-slate/70">
                        {member.role === "owner" ? "Community lead" : "Member"}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`rounded-full px-3 py-2 ${
                      member.completedToday ? "bg-teal-mist" : "bg-slate/10"
                    }`}
                  >
                    <Text className="text-sm font-semibold text-slate">
                      {member.completedToday ? "Done" : "Waiting"}
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
