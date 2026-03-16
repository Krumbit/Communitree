import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useCommunitree } from "@/context/communitree-context";

function formatDeadline(deadline: string) {
  const parsed = new Date(deadline);

  if (Number.isNaN(parsed.getTime())) {
    return deadline;
  }

  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomeScreen() {
  const {
    addPersonalTask,
    community,
    completedCount,
    completionRate,
    personalTasks,
    toggleCommunityCompletion,
    togglePersonalTask,
    user,
  } = useCommunitree();
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("2026-03-09 18:00");

  const upcomingTasks = useMemo(() => {
    return [...personalTasks]
      .filter((task) => !task.completed)
      .sort((left, right) => {
        const leftTime = new Date(left.deadline).getTime();
        const rightTime = new Date(right.deadline).getTime();

        if (Number.isNaN(leftTime)) {
          return 1;
        }

        if (Number.isNaN(rightTime)) {
          return -1;
        }

        return leftTime - rightTime;
      })
      .slice(0, 4);
  }, [personalTasks]);

  const currentMember = community.members.find(
    (member) => member.id === user.id,
  );
  const hasCompletedToday = currentMember?.completedToday ?? false;

  return (
    <ScrollView
      className="flex-1 bg-[#F4F1EA]"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        <View className="rounded-[32px] border border-[#D9D0C1] bg-[#1D4D3E] px-6 py-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#BEE3D4]">
                Home dashboard
              </Text>
              <Text className="mt-3 text-4xl font-bold leading-tight text-[#F8F4EE]">
                Keep your habits moving and your community plant thriving.
              </Text>
              <Text className="mt-4 text-base leading-6 text-[#D8EBDD]">
                Your closest deadlines stay here, while the shared task keeps
                everyone accountable.
              </Text>
            </View>

            <Pressable
              className="rounded-full border border-[#79B69A] px-4 py-3"
              onPress={() => router.push("../sign-in")}
            >
              <Ionicons name="person-outline" size={18} color="#F8F4EE" />
            </Pressable>
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-[24px] bg-[#F7F0E6] px-4 py-4">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8A6A49]">
                Coins
              </Text>
              <Text className="mt-2 text-3xl font-bold text-[#2A2018]">
                {user.coins}
              </Text>
            </View>
            <View className="flex-1 rounded-[24px] bg-[#D8EBDD] px-4 py-4">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#3B6A57]">
                Streak
              </Text>
              <Text className="mt-2 text-3xl font-bold text-[#16382D]">
                {user.streakDays}d
              </Text>
            </View>
          </View>
        </View>

        {!user.signedIn ? (
          <View className="mt-5 rounded-[26px] border border-[#E2CFA9] bg-[#FFF5DE] px-5 py-5">
            <Text className="text-lg font-semibold text-[#6D4D1F]">
              Preview mode
            </Text>
            <Text className="mt-2 text-sm leading-6 text-[#7D6241]">
              Sign in is mocked on the front end only. Use the preview form to
              explore the account flow without any backend.
            </Text>
          </View>
        ) : null}

        <View className="mt-6 rounded-[30px] border border-[#D8D0C6] bg-[#F9F6F1] px-5 py-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6A7A6C]">
                Today&apos;s community habit
              </Text>
              <Text className="mt-2 text-2xl font-bold leading-tight text-[#21352E]">
                {community.currentTaskTitle}
              </Text>
              <Text className="mt-2 text-sm text-[#69756D]">
                {community.currentTaskEnds}
              </Text>
            </View>
            <View className="rounded-full bg-[#E5EFE8] px-4 py-2">
              <Text className="text-sm font-semibold text-[#305B47]">
                {completedCount}/{community.members.length}
              </Text>
            </View>
          </View>

          <View className="mt-5 h-4 overflow-hidden rounded-full bg-[#D8DDD6]">
            <View className="h-full w-1/2 bg-[#D77C71]" />
            <View className="absolute right-0 top-0 h-full w-1/2 bg-[#7DB98F]" />
            <View
              className="absolute left-0 top-0 h-full bg-[#59635D]/50"
              style={{ width: `${Math.max(8, completionRate * 100)}%` }}
            />
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-sm leading-6 text-[#667268]">
                More than 50% completion grows the plant tomorrow.
                Full-community days add a coin bonus for everyone.
              </Text>
            </View>
            <Pressable
              className={`rounded-full px-4 py-3 ${hasCompletedToday ? "bg-[#21352E]" : "bg-[#4E7D66]"}`}
              onPress={toggleCommunityCompletion}
            >
              <Text className="text-sm font-semibold text-white">
                {hasCompletedToday ? "Undo check-in" : "Mark done"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-8 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8A7A63]">
              Personal tasks
            </Text>
            <Text className="mt-2 text-2xl font-bold text-[#2A2018]">
              Closest deadlines first
            </Text>
          </View>
          <Pressable
            className="rounded-full bg-[#2A2018] px-4 py-3"
            onPress={() => setShowComposer((current) => !current)}
          >
            <Text className="text-sm font-semibold text-[#F8F4EE]">
              {showComposer ? "Close" : "New task"}
            </Text>
          </Pressable>
        </View>

        {showComposer ? (
          <View className="mt-4 rounded-[28px] border border-[#D9D0C1] bg-white px-5 py-5">
            <Text className="text-lg font-semibold text-[#2A2018]">
              Create a private task
            </Text>
            <TextInput
              className="mt-4 rounded-[20px] border border-[#DDD4C7] px-4 py-4 text-base text-[#2A2018]"
              placeholder="Task title"
              placeholderTextColor="#91836F"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="mt-3 rounded-[20px] border border-[#DDD4C7] px-4 py-4 text-base text-[#2A2018]"
              placeholder="Deadline e.g. 2026-03-09 18:00"
              placeholderTextColor="#91836F"
              value={deadline}
              onChangeText={setDeadline}
            />
            <Pressable
              className="mt-4 rounded-[20px] bg-[#C5794A] px-4 py-4"
              onPress={() => {
                addPersonalTask(title, deadline);
                setTitle("");
                setDeadline("2026-03-09 18:00");
                setShowComposer(false);
              }}
            >
              <Text className="text-center text-sm font-semibold text-white">
                Add personal task
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="mt-4 gap-4">
          {upcomingTasks.map((task) => (
            <Pressable
              key={task.id}
              className="rounded-[28px] border border-[#D9D0C1] bg-white px-5 py-5"
              onPress={() => togglePersonalTask(task.id)}
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-xl font-semibold leading-7 text-[#2A2018]">
                    {task.title}
                  </Text>
                  <Text className="mt-2 text-sm font-medium text-[#7E6B53]">
                    Due {formatDeadline(task.deadline)}
                  </Text>
                </View>
                <View className="rounded-full bg-[#F2ECE4] p-3">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="#7E6B53"
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 rounded-[28px] bg-[#ECE6DB] px-5 py-5">
          <Text className="text-lg font-semibold text-[#2A2018]">
            Why it feels shared
          </Text>
          <Text className="mt-2 text-sm leading-6 text-[#6D604F]">
            Personal tasks stay private, but your daily community check-in
            affects the plant, the level bar, and the whole group&apos;s bonus
            coins.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
