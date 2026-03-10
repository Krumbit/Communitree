import { Pressable, ScrollView, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-[#F1F7ED]" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-16 pb-8">
          <View className="rounded-[28px] bg-[#1F7A59] px-6 py-7 shadow-sm">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#D7F3E8]">
              Communitree
            </Text>
            <Text className="mt-3 text-4xl font-bold leading-tight text-white">
              Grow greener habits with your neighbours.
            </Text>
            <Text className="mt-4 text-base leading-6 text-[#E4F7EF]">
              Track local clean-ups, swap useful goods, and turn small actions into a shared community rhythm.
            </Text>
          </View>

          <View className="mt-6 flex-row gap-4">
            <View className="flex-1 rounded-[24px] bg-white px-5 py-5">
              <Text className="text-3xl font-bold text-[#163A2D]">128</Text>
              <Text className="mt-2 text-sm text-[#5E6E66]">Trees pledged this month</Text>
            </View>
            <View className="flex-1 rounded-[24px] bg-[#E4F0E8] px-5 py-5">
              <Text className="text-3xl font-bold text-[#163A2D]">14</Text>
              <Text className="mt-2 text-sm text-[#5E6E66]">Events happening nearby</Text>
            </View>
          </View>

          <View className="mt-6 rounded-[28px] bg-[#FFF8EC] px-6 py-6">
            <Text className="text-lg font-semibold text-[#7A4A16]">This week&apos;s focus</Text>
            <Text className="mt-2 text-2xl font-bold text-[#2D2418]">Front garden swap trail</Text>
            <Text className="mt-3 text-base leading-6 text-[#6A5A45]">
              Join local homes opening mini stands for cuttings, seeds, pots, and compost tips on Saturday morning.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Pressable onPress={() => console.log("clicked")}
        className="absolute bottom-10 right-10 rounded-full bg-[#243E36] px-20 py-10">
          <Text className="text-white font-bold">
            Add task
          </Text>
      </Pressable>
    </View>
  );
}
