import { ScrollView, Text, View } from "react-native";

const products = [
  {
    name: "Starter herb box",
    price: "GBP 12",
    detail: "Basil, mint, thyme, and reusable planters.",
  },
  {
    name: "Balcony compost kit",
    price: "GBP 24",
    detail: "Compact bin, coco coir, and a soil guide.",
  },
  {
    name: "Community tote pack",
    price: "GBP 18",
    detail: "Three heavy-duty bags for swaps and food runs.",
  },
];

export default function ShopScreen() {
  return (
    <ScrollView className="flex-1 bg-[#F3F6FB]" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-16">
        <View className="rounded-[28px] bg-[#163A63] px-6 py-7">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#C9DBF2]">Shop</Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-white">
            Useful tools for low-waste everyday routines.
          </Text>
          <Text className="mt-4 text-base leading-6 text-[#DCE8F7]">
            Pick up practical kits sourced for sharing, repairing, planting, and borrowing across the neighbourhood.
          </Text>
        </View>

        <Text className="mt-8 text-lg font-semibold text-[#1A2A3A]">Featured picks</Text>
        <View className="mt-4 gap-4">
          {products.map((product) => (
            <View key={product.name} className="rounded-[24px] bg-white px-5 py-5">
              <View className="flex-row items-start justify-between gap-4">
                <Text className="flex-1 text-xl font-semibold text-[#1A2A3A]">{product.name}</Text>
                <Text className="text-sm font-semibold uppercase tracking-[1px] text-[#3E6EA1]">
                  {product.price}
                </Text>
              </View>
              <Text className="mt-3 text-sm leading-5 text-[#617080]">{product.detail}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
