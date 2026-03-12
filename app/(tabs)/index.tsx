import { Pressable, ScrollView, Text, View } from "react-native";

const bgColor = "#F1F7ED";

export default function Index() {
  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-[#F1F7ED]" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-6">
          <View className="rounded-[28px] bg-[#74A982] px-6 py-7 shadow-sm">
            <Text className="text-4xl font-bold leading-tight text-white">
              Upcoming tasks
            </Text>
          </View>

          <View className="mt-6 rounded-[28px] bg-[#243E36] px-6 py-6">
            <Text className="mx-2 my-2 text-2xl font-bold text-[#FFFFFF]">Task 1</Text>
          </View>
        </View>
      </ScrollView>

      <Pressable onPress={() => console.log("clicked")}
        className="absolute bottom-10 right-20 rounded-full bg-[#74A982] px-10 py-10">
          <Text className="text-white text-2xl">
            Add task
          </Text>
      </Pressable>
    </View>
  );
}
