import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useCommunitree } from "@/context/communitree-context";

export default function SignInScreen() {
  const { signInMock, user } = useCommunitree();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");

  return (
    <ScrollView className="flex-1 bg-[#F3EFE7]" contentContainerStyle={{ paddingBottom: 36 }}>
      <View className="px-6 pb-8 pt-16">
        <Pressable className="mb-6 w-12 rounded-full bg-white p-3" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#2A2018" />
        </Pressable>

        <View className="rounded-[34px] border border-[#DACFBE] bg-[#FFF9F0] px-6 py-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#8A6A49]">Sign in view</Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-[#2A2018]">
            Join your habit circle and keep the plant alive.
          </Text>
          <Text className="mt-4 text-base leading-6 text-[#6E6151]">
            This screen is front-end only. It previews sign-in and account creation without Clerk, Convex, or any backend setup.
          </Text>

          <View className="mt-6 rounded-[26px] bg-[#E7F0E8] px-5 py-5">
            <Text className="text-lg font-semibold text-[#254032]">Prototype perks</Text>
            <Text className="mt-2 text-sm leading-6 text-[#4A6053]">
              Every account starts with coins for cosmetic unlocks, a private task list, and one shared community slot.
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-[32px] border border-[#DACFBE] bg-white px-5 py-5">
          <View className="flex-row rounded-full bg-[#F2ECE1] p-1">
            <Pressable
              className={`flex-1 rounded-full px-4 py-3 ${!isCreateMode ? "bg-[#2A2018]" : "bg-transparent"}`}
              onPress={() => setIsCreateMode(false)}
            >
              <Text className={`text-center text-sm font-semibold ${!isCreateMode ? "text-white" : "text-[#7C6A55]"}`}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-full px-4 py-3 ${isCreateMode ? "bg-[#2A2018]" : "bg-transparent"}`}
              onPress={() => setIsCreateMode(true)}
            >
              <Text className={`text-center text-sm font-semibold ${isCreateMode ? "text-white" : "text-[#7C6A55]"}`}>
                Create account
              </Text>
            </Pressable>
          </View>

          {isCreateMode ? (
            <TextInput
              className="mt-5 rounded-[20px] border border-[#DDD4C7] px-4 py-4 text-base text-[#2A2018]"
              placeholder="Full name"
              placeholderTextColor="#91836F"
              value={name}
              onChangeText={setName}
            />
          ) : null}

          <TextInput
            className="mt-5 rounded-[20px] border border-[#DDD4C7] px-4 py-4 text-base text-[#2A2018]"
            placeholder="Email"
            placeholderTextColor="#91836F"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="mt-3 rounded-[20px] border border-[#DDD4C7] px-4 py-4 text-base text-[#2A2018]"
            placeholder="Password"
            placeholderTextColor="#91836F"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            className="mt-5 rounded-[22px] bg-[#C5794A] px-4 py-4"
            onPress={() => {
              signInMock({
                name: isCreateMode ? name : undefined,
                email,
              });
              setPassword("");
              router.replace("/(tabs)");
            }}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {isCreateMode ? "Create preview account" : "Sign in to preview"}
            </Text>
          </Pressable>

          <Text className="mt-4 text-center text-sm leading-6 text-[#7C6A55]">
            No real authentication happens here; this just updates local front-end state for the prototype.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
