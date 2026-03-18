import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useCommunitree } from "@/context/communitree-context";

export default function ShopScreen() {
  const { buyUnlockable, equipUnlockable, equipped, unlockables, user } =
    useCommunitree();
  const [message, setMessage] = useState("");

  const groupedUnlockables = useMemo(() => {
    return {
      pots: unlockables.filter((item) => item.category === "pot"),
      ribbons: unlockables.filter((item) => item.category === "ribbon"),
      ornaments: unlockables.filter((item) => item.category === "ornament"),
    };
  }, [unlockables]);

  return (
    <ScrollView
      className="flex-1 bg-ivory"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="px-6 pb-8 pt-16">
        <View className="rounded-[32px] border border-teal/30 bg-slate px-6 py-6">
          <Text className="mt-3 text-4xl font-bold leading-tight text-white">
            Shop
          </Text>
          <Text className="mt-4 text-base leading-6 text-ivory/80">
            Spend coins on cosmetics for the shared plant.
          </Text>

          <View className="mt-6 flex-row items-end justify-between gap-4 rounded-[26px] bg-ivory px-5 py-5">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
                Balance
              </Text>
              <Text className="mt-2 text-4xl font-bold text-slate">
                {user.coins}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-[32px] border border-teal/20 bg-ivory-soft px-5 py-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
            Current look
          </Text>
          <Text className="mt-2 text-2xl font-bold text-slate">
            Live plant preview
          </Text>

          <View className="relative mt-8 items-center justify-center pb-20 pt-8">
            <View className="h-24 w-4 rounded-full bg-teal" />
            <View className="absolute left-[28%] top-10 h-20 w-12 -rotate-12 rounded-full bg-teal-soft" />
            <View className="absolute right-[28%] top-10 h-20 w-12 rotate-12 rounded-full bg-teal-soft" />
            <View
              className="absolute bottom-16 h-4 w-24 rounded-full"
              style={{
                backgroundColor:
                  unlockables.find((item) => item.id === equipped.ribbon)
                    ?.accent ?? "#4D8F63",
              }}
            />
            <View
              className="absolute right-[30%] top-20 h-6 w-6 rounded-full border-2 border-white"
              style={{
                backgroundColor:
                  unlockables.find((item) => item.id === equipped.ornament)
                    ?.accent ?? "#E0B43B",
              }}
            />
            <View
              className="absolute bottom-0 h-20 w-40 rounded-b-[40px] rounded-t-[24px] border border-teal-soft"
              style={{
                backgroundColor:
                  unlockables.find((item) => item.id === equipped.pot)
                    ?.accent ?? "#C5794A",
              }}
            />
          </View>
        </View>

        {message ? (
          <View className="mt-5 rounded-[24px] bg-teal-mist px-5 py-4">
            <Text className="text-sm leading-6 text-slate">{message}</Text>
          </View>
        ) : null}

        {[
          { title: "Pots", items: groupedUnlockables.pots },
          { title: "Ribbons", items: groupedUnlockables.ribbons },
          { title: "Ornaments", items: groupedUnlockables.ornaments },
        ].map((section) => (
          <View key={section.title} className="mt-8">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate/60">
              {section.title}
            </Text>
            <View className="mt-4 gap-4">
              {section.items.map((item) => {
                const isEquipped = equipped[item.category] === item.id;

                return (
                  <View
                    key={item.id}
                    className="rounded-[28px] border border-teal/20 bg-ivory-soft px-5 py-5"
                  >
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-3">
                          <View
                            className="h-5 w-5 rounded-full border border-teal/20"
                            style={{ backgroundColor: item.accent }}
                          />
                          <Text className="text-xl font-semibold text-slate">
                            {item.name}
                          </Text>
                        </View>
                        <Text className="mt-3 text-sm leading-6 text-slate/70">
                          {item.description}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate/60">
                          {item.price} coins
                        </Text>
                        {item.purchased ? (
                          <View className="mt-3 rounded-full bg-teal-mist px-3 py-2">
                            <Text className="text-xs font-semibold text-slate">
                              Owned
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View className="mt-5 flex-row gap-3">
                      {item.purchased ? (
                        <Pressable
                          className={`flex-1 rounded-[20px] px-4 py-4 ${isEquipped ? "bg-slate" : "bg-teal"}`}
                          onPress={() => {
                            equipUnlockable(item.id);
                            setMessage(
                              `${item.name} is now equipped on the community plant.`,
                            );
                          }}
                        >
                          <Text className="text-center text-sm font-semibold text-white">
                            {isEquipped ? "Equipped" : "Equip"}
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          className="flex-1 rounded-[20px] bg-slate px-4 py-4"
                          onPress={() => {
                            const result = buyUnlockable(item.id);
                            setMessage(result.message);

                            if (result.ok) {
                              equipUnlockable(item.id);
                            }
                          }}
                        >
                          <Text className="text-center text-sm font-semibold text-white">
                            Buy and equip
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
