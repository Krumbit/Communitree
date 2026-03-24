import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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

export default function HabitHistoryScreen() {
  const { personalTasks, togglePersonalTask } = useCommunitree();

  const completedTasks = useMemo(() => {
    return [...personalTasks]
      .filter((t) => t.completed)
      .sort((a, b) => {
        const at = new Date(a.deadline).getTime();
        const bt = new Date(b.deadline).getTime();
        if (Number.isNaN(at)) return 1;
        if (Number.isNaN(bt)) return -1;
        return bt - at;
      });
  }, [personalTasks]);

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

        <View className="rounded-[32px] border border-teal/20 bg-ivory-soft px-6 py-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
            Personal tasks
          </Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-slate">
            Habit history
          </Text>
          <Text className="mt-3 text-sm text-slate/60">
            {completedTasks.length} task{completedTasks.length !== 1 ? "s" : ""}{" "}
            completed
          </Text>
        </View>

        {completedTasks.length === 0 ? (
          <View className="mt-6 rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-8">
            <Text className="text-center text-base text-slate/50">
              No completed tasks yet.
            </Text>
          </View>
        ) : (
          <View className="mt-6 gap-4">
            {completedTasks.map((task) => (
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
        )}
      </View>
    </ScrollView>
  );
}
