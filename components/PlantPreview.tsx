import { View } from "react-native";

type Props = {
  potAccent: string;
  ribbonAccent?: string;
  ornamentAccent?: string;
};

export function PlantPreview({ potAccent, ribbonAccent, ornamentAccent }: Props) {
  return (
    <View className="relative items-center justify-center pb-24 pt-8">
      <View className="absolute top-10 h-20 w-20 rounded-full bg-teal/25" />
      <View className="h-24 w-4 rounded-full bg-teal" />
      <View className="absolute left-[24%] top-10 h-20 w-12 -rotate-12 rounded-full bg-teal-soft" />
      <View className="absolute right-[24%] top-10 h-20 w-12 rotate-12 rounded-full bg-teal-soft" />
      <View className="absolute left-[18%] top-24 h-16 w-10 -rotate-[28deg] rounded-full bg-teal-deep" />
      <View className="absolute right-[18%] top-24 h-16 w-10 rotate-[28deg] rounded-full bg-teal-deep" />

      {ribbonAccent ? (
        <View
          className="absolute bottom-20 h-4 w-24 rounded-full"
          style={{ backgroundColor: ribbonAccent }}
        />
      ) : null}

      {ornamentAccent ? (
        <View
          className="absolute right-[29%] top-20 h-6 w-6 rounded-full border-2 border-white"
          style={{ backgroundColor: ornamentAccent }}
        />
      ) : null}

      <View
        className="absolute bottom-0 h-20 w-40 rounded-b-[40px] rounded-t-[24px] border border-teal-soft"
        style={{ backgroundColor: potAccent }}
      />
    </View>
  );
}
