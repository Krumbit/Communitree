import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";

import { PlantPreview } from "@/components/PlantPreview";
import { palette } from "@/constants/palette";
import { getNextPlantTier, getPlantTier } from "@/constants/plant-tiers";
import { useCommunitree } from "@/context/communitree-context";

export default function CommunityScreen() {
  const {
    community,
    completedCount,
    completionRate,
    createCommunity,
    createCommunityTask,
    equipped,
    inCommunity,
    isOwner,
    joinCommunity,
    leaveCommunity,
    toggleCommunityCompletion,
    unlockables,
    user,
  } = useCommunitree();

  const [joinCode, setJoinCode] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [createMessage, setCreateMessage] = useState("");

  const [showManage, setShowManage] = useState(false);
  const [taskTitle, setTaskTitle] = useState(community.currentTaskTitle);
  const [manageMessage, setManageMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const scrollRef = useRef<ScrollViewType>(null);

  const openManage = () => {
    setShowManage(true);
    setManageMessage("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const currentMember = community.members.find((m) => m.id === user.id);
  const hasCompletedToday = currentMember?.completedToday ?? false;

  const growthChange =
    completedCount -
    Math.ceil(community.members.length * community.dailyThreshold);

  const currentTier = getPlantTier(community.plantLevel);
  const nextTier = getNextPlantTier(community.plantLevel);

  const equippedItems = useMemo(() => {
    return {
      pot: unlockables.find((u) => u.id === equipped.pot),
      ribbon: unlockables.find((u) => u.id === equipped.ribbon),
      ornament: unlockables.find((u) => u.id === equipped.ornament),
    };
  }, [equipped, unlockables]);

  if (!inCommunity) {
    return (
      <ScrollView
        className="flex-1 bg-ivory"
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View className="px-6 pb-8 pt-16">
          <View className="rounded-[32px] border border-teal/20 bg-ivory-soft px-6 py-6">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
              Community view
            </Text>
            <Text className="mt-3 text-4xl font-bold leading-tight text-slate">
              No community yet
            </Text>
            <Text className="mt-3 text-sm leading-6 text-slate/70">
              Join an existing community with a code, or start one with your
              friends.
            </Text>
          </View>

          <View className="mt-6 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
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
              className={`mt-4 rounded-[20px] px-4 py-4 ${isBusy ? "bg-slate/50" : "bg-slate"}`}
              disabled={isBusy}
              onPress={async () => {
                setIsBusy(true);
                const result = await joinCommunity(joinCode);
                setJoinMessage(result.message);
                setIsBusy(false);
              }}
            >
              {isBusy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center text-sm font-semibold text-white">
                  Join community
                </Text>
              )}
            </Pressable>
            {joinMessage ? (
              <Text className="mt-3 text-sm leading-6 text-slate/70">
                {joinMessage}
              </Text>
            ) : null}
          </View>

          <View className="mt-4 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
            <Text className="text-lg font-semibold text-slate">
              Start a community
            </Text>
            <TextInput
              className="mt-4 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
              placeholder="Community name"
              placeholderTextColor={palette.slateMuted}
              value={communityName}
              onChangeText={setCommunityName}
            />
            <Pressable
              className={`mt-4 rounded-[20px] px-4 py-4 ${isBusy ? "bg-teal/50" : "bg-teal"}`}
              disabled={isBusy}
              onPress={async () => {
                setIsBusy(true);
                const result = await createCommunity(communityName);
                setCreateMessage(result.message);
                setIsBusy(false);
              }}
            >
              {isBusy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center text-sm font-semibold text-white">
                  Create community
                </Text>
              )}
            </Pressable>
            {createMessage ? (
              <Text className="mt-3 text-sm leading-6 text-slate/70">
                {createMessage}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-ivory"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        {/* Header */}
        <View className="rounded-[32px] border border-teal/20 bg-ivory-soft px-6 py-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
                Community view
              </Text>
              <Text className="mt-3 text-4xl font-bold leading-tight text-slate">
                {community.name}
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

        {/* Current community task */}
        {community.currentTaskTitle ? (
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
                onPress={() => toggleCommunityCompletion()}
              >
                <Text className="text-sm font-semibold text-white">
                  {hasCompletedToday ? "Completed" : "Check in"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="mt-6 rounded-[30px] border border-dashed border-teal/30 bg-ivory-soft px-5 py-6">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
              Current community task
            </Text>
            {isOwner ? (
              <>
                <Text className="mt-2 text-xl font-semibold text-slate/40">
                  No task set yet
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate/50">
                  Set a shared habit for your community to complete today.
                </Text>
                <Pressable
                  className="mt-4 self-start rounded-full bg-slate px-4 py-2"
                  onPress={openManage}
                >
                  <Text className="text-sm font-semibold text-ivory">
                    Set a task →
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="mt-2 text-xl font-semibold text-slate/40">
                  No task set yet
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate/50">
                  Waiting for the community owner to set today&apos;s habit.
                </Text>
              </>
            )}
          </View>
        )}

        {/* Plant card */}
        <View className="mt-6 rounded-[32px] border border-teal/30 bg-slate px-5 py-6">
          {/* Level header */}
          <View className="flex-row items-start justify-between gap-4">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-teal-soft">
                Plant level
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">
                L{community.plantLevel} {currentTier.name}
              </Text>
              <Text className="mt-1 text-sm text-ivory/60">
                {currentTier.health}
              </Text>
            </View>
            {nextTier ? (
              <View className="items-end">
                <Text className="text-xs font-semibold uppercase tracking-[1px] text-ivory/40">
                  Next tier
                </Text>
                <Text className="mt-1 text-sm font-semibold text-ivory/80">
                  {nextTier.name}
                </Text>
                <Text className="mt-1 text-sm text-ivory/50">
                  {community.levelProgress}% there
                </Text>
              </View>
            ) : (
              <View className="rounded-full bg-teal/20 px-3 py-2">
                <Text className="text-sm font-semibold text-teal-soft">
                  Max tier
                </Text>
              </View>
            )}
          </View>

          {/* Level progress bar */}
          <View className="mt-4 h-3 overflow-hidden rounded-full bg-ivory/10">
            <View
              className="h-full rounded-full bg-teal"
              style={{ width: `${community.levelProgress}%` }}
            />
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs text-ivory/40">{currentTier.name}</Text>
            {nextTier ? (
              <Text className="text-xs text-ivory/40">{nextTier.name}</Text>
            ) : null}
          </View>

          {/* Plant preview */}
          <PlantPreview
            potAccent={equippedItems.pot?.accent ?? palette.teal}
            ribbonAccent={equippedItems.ribbon?.accent}
            ornamentAccent={equippedItems.ornament?.accent}
          />

          {/* Daily growth bar — only shown when a task exists */}
          {community.currentTaskTitle ? (
            <View className="rounded-[24px] bg-ivory-soft px-4 py-4">
              <View className="flex-row items-center justify-between gap-4">
                <Text className="text-sm font-semibold uppercase tracking-[2px] text-slate/60">
                  Today&apos;s check-ins
                </Text>
                <Text className="text-sm font-semibold text-slate">
                  {completedCount}/{community.members.length} done
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
                  50% needed to grow the plant. Full completion earns everyone a bonus coin.
                </Text>
                <View className="rounded-full bg-teal-mist px-3 py-2">
                  <Text className="text-sm font-semibold text-slate">
                    {growthChange >= 0 ? `+${growthChange}` : growthChange} growth
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* Manage community */}
        <Pressable
          className="mt-6 rounded-[24px] bg-slate px-4 py-4"
          onPress={() => {
            if (showManage) {
              setShowManage(false);
              setManageMessage("");
            } else {
              openManage();
            }
          }}
        >
          <Text className="text-center text-sm font-semibold text-ivory">
            {showManage ? "Close" : "Manage community"}
          </Text>
        </Pressable>

        {showManage ? (
          <View className="mt-4 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
            {isOwner ? (
              <>
                <Text className="text-lg font-semibold text-slate">
                  Set community task
                </Text>
                <TextInput
                  className="mt-4 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
                  placeholder="e.g. 20 minutes of revision"
                  placeholderTextColor={palette.slateMuted}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />
                <Pressable
                  className={`mt-4 rounded-[20px] px-4 py-4 ${isBusy ? "bg-teal/50" : "bg-teal"}`}
                  disabled={isBusy}
                  onPress={async () => {
                    setIsBusy(true);
                    await createCommunityTask(taskTitle);
                    setIsBusy(false);
                    setShowManage(false);
                    setManageMessage("");
                  }}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-center text-sm font-semibold text-white">
                      Publish task
                    </Text>
                  )}
                </Pressable>

                <View className="my-5 h-px bg-slate/10" />

                <Text className="text-lg font-semibold text-slate">
                  Leave community
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate/70">
                  Ownership will transfer to another member when you leave.
                </Text>
                <Pressable
                  className={`mt-4 rounded-[20px] px-4 py-4 ${isBusy ? "bg-slate/5" : "bg-slate/10"}`}
                  disabled={isBusy}
                  onPress={async () => {
                    setIsBusy(true);
                    await leaveCommunity();
                    setShowManage(false);
                    setIsBusy(false);
                  }}
                >
                  <Text className="text-center text-sm font-semibold text-slate">
                    Leave community
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="text-lg font-semibold text-slate">
                  Leave community
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate/70">
                  Your check-in history will be removed from this community.
                </Text>
                <Pressable
                  className={`mt-4 rounded-[20px] px-4 py-4 ${isBusy ? "bg-slate/5" : "bg-slate/10"}`}
                  disabled={isBusy}
                  onPress={async () => {
                    setIsBusy(true);
                    await leaveCommunity();
                    setShowManage(false);
                    setIsBusy(false);
                  }}
                >
                  <Text className="text-center text-sm font-semibold text-slate">
                    Leave community
                  </Text>
                </Pressable>
              </>
            )}
            {manageMessage ? (
              <Text className="mt-3 text-sm leading-6 text-slate/70">
                {manageMessage}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Members */}
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
