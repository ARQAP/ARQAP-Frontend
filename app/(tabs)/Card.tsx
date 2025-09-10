import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import CubeBadge from "../../components/ui/CubeBadge";

interface CardProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  cubeCount?: number;
}

export default function Card({ title, subtitle, icon, cubeCount }: CardProps) {
  return (
    <View className="w-[90%] self-center rounded-xl p-4 my-2 flex-row items-center bg-[#6B705C]">
      <View className="flex-1">
        <Text
          className="font-bold text-xl mb-1 text-white"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          {title}
        </Text>
        <Text
          className="text-base text-white opacity-80"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          {subtitle}
        </Text>
      </View>
      <View className="ml-4 items-center justify-center">
        {cubeCount !== undefined ? (
          <CubeBadge count={cubeCount} icon={icon} />
        ) : icon ? (
          <FontAwesome name={icon} size={32} color="#fff" />
        ) : null}
      </View>
    </View>
  );
}
