import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { palette } from "@/constants/palette";
import { useCommunitree } from "@/context/communitree-context";

export default function SignInScreen() {
  const { signIn } = useCommunitree();

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    const result = await signIn(
      email.trim(),
      password,
      isCreateMode ? name.trim() : undefined
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setPassword("");
    router.replace("/(tabs)");
  };

  return (
    <ScrollView
      className="flex-1 bg-ivory"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        <View className="rounded-[34px] border border-teal/20 bg-ivory-soft px-6 py-6">
          <Text className="mt-3 text-4xl font-bold leading-tight text-slate">
            Sign in
          </Text>
          <Text className="mt-4 text-base leading-6 text-slate/70">
            Join your habit circle and keep the plant alive.
          </Text>

          <View className="mt-6 rounded-[26px] bg-teal-mist px-5 py-5">
            <Text className="text-lg font-semibold text-slate">
              New account perks
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate/75">
              Every account starts with coins for cosmetic unlocks, a private
              task list, and one community slot.
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-[32px] border border-teal/20 bg-ivory-soft px-5 py-5">
          <View className="flex-row rounded-full bg-slate/10 p-1">
            <Pressable
              className={`flex-1 rounded-full px-4 py-3 ${!isCreateMode ? "bg-slate" : "bg-transparent"}`}
              onPress={() => {
                setIsCreateMode(false);
                setErrorMessage("");
              }}
            >
              <Text
                className={`text-center text-sm font-semibold ${!isCreateMode ? "text-ivory" : "text-slate/65"}`}
              >
                Sign in
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-full px-4 py-3 ${isCreateMode ? "bg-slate" : "bg-transparent"}`}
              onPress={() => {
                setIsCreateMode(true);
                setErrorMessage("");
              }}
            >
              <Text
                className={`text-center text-sm font-semibold ${isCreateMode ? "text-ivory" : "text-slate/65"}`}
              >
                Create account
              </Text>
            </Pressable>
          </View>

          {isCreateMode ? (
            <TextInput
              className="mt-5 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
              placeholder="Username"
              placeholderTextColor={palette.slateMuted}
              value={name}
              onChangeText={setName}
            />
          ) : null}

          <TextInput
            className="mt-5 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
            placeholder="Email"
            placeholderTextColor={palette.slateMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="mt-3 rounded-[20px] border border-teal/20 bg-ivory px-4 py-4 text-base text-slate"
            placeholder="Password"
            placeholderTextColor={palette.slateMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? (
            <Text className="mt-3 text-sm font-medium text-red-500">
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            className={`mt-5 rounded-[22px] px-4 py-4 ${isSubmitting ? "bg-teal/50" : "bg-teal"}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-center text-sm font-semibold text-white">
                {isCreateMode ? "Create account" : "Sign in"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
