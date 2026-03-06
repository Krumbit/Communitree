import { ScrollView, Text, View } from "react-native";

const activities = [
  {
    title: "Riverside litter pick",
    time: "Today, 6:30 PM",
    host: "Hosted by Maya and 11 volunteers",
  },
  {
    title: "Seed library drop-in",
    time: "Friday, 1:00 PM",
    host: "Hosted by High Street Hub",
  },
  {
    title: "Repair cafe social",
    time: "Sunday, 11:00 AM",
    host: "Hosted by Communitree Makers",
  },
];

export default function CommunityScreen() {
  return (
    <ScrollView className="flex-1 bg-[#FCF8F3]" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-16">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#9A6A42]">
          Community
        </Text>
        <Text className="mt-3 text-4xl font-bold leading-tight text-[#2E241C]">
          Meet people making the block a little brighter.
        </Text>

        <View className="mt-6 rounded-[28px] bg-[#FFFFFF] px-6 py-6">
          <Text className="text-lg font-semibold text-[#2E241C]">Local momentum</Text>
          <View className="mt-5 flex-row justify-between">
            <View>
              <Text className="text-3xl font-bold text-[#9A6A42]">86%</Text>
              <Text className="mt-1 text-sm text-[#70665D]">Event attendance</Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-[#9A6A42]">42</Text>
              <Text className="mt-1 text-sm text-[#70665D]">Active helpers</Text>
            </View>
          </View>
        </View>

        <Text className="mt-8 text-lg font-semibold text-[#2E241C]">Upcoming gatherings</Text>
        <View className="mt-4 gap-4">
          {activities.map((activity) => (
            <View key={activity.title} className="rounded-[24px] bg-[#F1E4D8] px-5 py-5">
              <Text className="text-xl font-semibold text-[#33251B]">{activity.title}</Text>
              <Text className="mt-2 text-sm font-medium text-[#8A5D3A]">{activity.time}</Text>
              <Text className="mt-2 text-sm leading-5 text-[#6F5B4B]">{activity.host}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
