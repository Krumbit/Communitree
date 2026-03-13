import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [tasks, updateTasks] = useState<string[]>([]);
  const addTask = () => {
    updateTasks(prev => [...prev, `Task ${prev.length + 1}`]);
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-[#F1F7ED]" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-6">
          <View className="rounded-[28px] bg-[#74A982] px-6 py-7 shadow-sm">
            <Text className="text-4xl font-bold leading-tight text-white">
              Upcoming tasks
            </Text>
          </View>

          {tasks.map((task, i) => (
            <View key={i}>
              <Text>{task}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable onPress={addTask}
        className="absolute bottom-10 right-20 rounded-full bg-[#74A982] px-10 py-10">
          <Text className="text-white text-2xl">
            Add task
          </Text>
      </Pressable>
    </View>
  );
}
