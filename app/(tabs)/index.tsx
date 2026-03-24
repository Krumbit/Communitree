import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { palette } from "@/constants/palette";
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
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const byDeadlineAsc = (a: { deadline: string }, b: { deadline: string }) => {
    const at = new Date(a.deadline).getTime();
    const bt = new Date(b.deadline).getTime();
    if (Number.isNaN(at)) return 1;
    if (Number.isNaN(bt)) return -1;
    return at - bt;
  };

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = [...personalTasks]
      .filter((t) => !t.completed)
      .sort(byDeadlineAsc);
    const completed = [...personalTasks]
      .filter((t) => t.completed)
      .sort((a, b) => byDeadlineAsc(b, a));
    return { activeTasks: active, completedTasks: completed };
  }, [personalTasks]);

  const currentMember = community.members.find(
    (member) => member.id === user.id,
  );
  const hasCompletedToday = currentMember?.completedToday ?? false;

  if (!user.signedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <ScrollView
      className="flex-1 bg-ivory"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        <View className="rounded-[32px] border border-teal/30 bg-slate px-6 py-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="mt-3 text-4xl font-bold leading-tight text-ivory">
                Dashboard
              </Text>
            </View>

            <Pressable
              className="rounded-full border border-teal/60 px-4 py-3"
              onPress={() => router.push("../profile")}
            >
              <Ionicons name="person-outline" size={18} color={palette.ivory} />
            </Pressable>
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-[24px] bg-ivory px-4 py-4">
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
        </View>

        <View className="mt-6 rounded-[30px] border border-teal/20 bg-ivory-soft px-5 py-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
                Today&apos;s community habit
              </Text>
              <Text className="mt-2 text-2xl font-bold leading-tight text-slate">
                {community.currentTaskTitle}
              </Text>
              <Text className="mt-2 text-sm text-slate/70">
                {community.currentTaskEnds}
              </Text>
            </View>
            <View className="rounded-full bg-teal-mist px-4 py-2">
              <Text className="text-sm font-semibold text-slate">
                {completedCount}/{community.members.length}
              </Text>
            </View>
          </View>

          <View className="mt-5 h-4 overflow-hidden rounded-full bg-slate/10">
            <View className="h-full w-1/2 bg-slate/20" />
            <View className="absolute right-0 top-0 h-full w-1/2 bg-teal/60" />
            <View
              className="absolute left-0 top-0 h-full bg-slate/65"
              style={{ width: `${Math.max(8, completionRate * 100)}%` }}
            />
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-sm leading-6 text-slate/70">
                Crossing the 50% mark moves the plant forward tomorrow.
                Full-community days still add a coin bonus for everyone.
              </Text>
            </View>
            <Pressable
              className={`rounded-full px-4 py-3 ${hasCompletedToday ? "bg-slate" : "bg-teal"}`}
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
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
              Personal tasks
            </Text>
            <Text className="mt-2 text-2xl font-bold text-slate">
              Closest deadlines first
            </Text>
          </View>
          <Pressable
            className="rounded-full bg-slate px-4 py-3"
            onPress={() => setShowComposer((current) => !current)}
          >
            <Text className="text-sm font-semibold text-ivory">
              {showComposer ? "Close" : "New task"}
            </Text>
          </Pressable>
        </View>

        {showComposer ? (
          <View className="mt-4 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5">
            <Text className="text-lg font-semibold text-slate">
              Create a private task
            </Text>
            <TextInput
              className="mt-4 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
              placeholder="Task title"
              placeholderTextColor={palette.slateMuted}
              value={title}
              onChangeText={setTitle}
            />
            <Pressable
              className="mt-3 flex-row items-center justify-between rounded-[20px] border border-teal/20 bg-ivory px-4 py-4"
              onPress={() => setShowDatePicker((v) => !v)}
            >
              <Text className="text-base text-slate">
                {deadline.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={palette.slateMuted} />
            </Pressable>

            {showDatePicker ? (
              <DateTimePicker
                value={deadline}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_event: DateTimePickerEvent, selected?: Date) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (selected) {
                    setDeadline(selected);
                    if (Platform.OS === "android") setShowTimePicker(true);
                  }
                }}
              />
            ) : null}

            <Pressable
              className="mt-3 flex-row items-center justify-between rounded-[20px] border border-teal/20 bg-ivory px-4 py-4"
              onPress={() => setShowTimePicker((v) => !v)}
            >
              <Text className="text-base text-slate">
                {deadline.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Ionicons name="time-outline" size={18} color={palette.slateMuted} />
            </Pressable>

            {showTimePicker ? (
              <DateTimePicker
                value={deadline}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_event: DateTimePickerEvent, selected?: Date) => {
                  if (Platform.OS === "android") setShowTimePicker(false);
                  if (selected) setDeadline(selected);
                }}
              />
            ) : null}

            <Pressable
              className="mt-4 rounded-[20px] bg-teal px-4 py-4"
              onPress={() => {
                addPersonalTask(title, deadline.toISOString());
                setTitle("");
                setDeadline(new Date());
                setShowDatePicker(false);
                setShowTimePicker(false);
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
          {activeTasks.map((task) => (
            <Pressable
              key={task.id}
              className="rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5"
              onPress={() => togglePersonalTask(task.id)}
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-xl font-semibold leading-7 text-slate">
                    {task.title}
                  </Text>
                  <Text className="mt-2 text-sm font-medium text-slate/65">
                    Due {formatDeadline(task.deadline)}
                  </Text>
                </View>
                <View className="rounded-full bg-teal/10 p-3">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color={palette.slateMuted}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {completedTasks.length > 0 ? (
          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
                  Completed
                </Text>
                <Text className="mt-2 text-2xl font-bold text-slate">
                  Habit history
                </Text>
              </View>
              {completedTasks.length > 3 ? (
                <Pressable
                  className="rounded-full bg-slate/10 px-4 py-2"
                  onPress={() => router.push("../habit-history")}
                >
                  <Text className="text-sm font-semibold text-slate">
                    See all
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <View className="mt-4 gap-4">
              {completedTasks.slice(0, 3).map((task) => (
                <Pressable
                  key={task.id}
                  className="rounded-[28px] border border-teal/10 bg-slate/5 px-5 py-5"
                  onPress={() => togglePersonalTask(task.id)}
                >
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <Text className="text-xl font-semibold leading-7 text-slate/40 line-through">
                        {task.title}
                      </Text>
                      <Text className="mt-2 text-sm font-medium text-slate/40">
                        Due {formatDeadline(task.deadline)}
                      </Text>
                    </View>
                    <View className="rounded-full bg-teal/15 p-3">
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={palette.teal}
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
