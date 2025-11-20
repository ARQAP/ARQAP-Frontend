
import React from "react";
import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface CubeBadgeProps {
  count: number;
  size?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

const CubeBadge: React.FC<CubeBadgeProps> = ({
  count,
  size = 32,
  icon = "cube-outline",
}) => {
  return (
    <View className="items-center">
      <View className="bg-[#757A65] rounded-full p-2">
        <Ionicons name={icon} size={size} color="#fff" />
      </View>
      <View className="bg-[#44483A] rounded-full px-4 py-1 mt-[-12px]">
        <Text className="text-white text-base font-semibold">{count}</Text>
      </View>
    </View>
  );
};

export default CubeBadge;
