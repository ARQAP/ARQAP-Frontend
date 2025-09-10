import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionCardProps {
  name: string;
}

export default function ActionCard({ name }: ActionCardProps) {
  return (
    <TouchableOpacity
      className="bg-[#deceb1] rounded-2xl p-4 w-28 h-32 items-center justify-center mx-2 shadow-md"
      activeOpacity={0.8}
    >
      <View className="bg-[#8b5c2a] rounded-full w-12 h-12 items-center justify-center mb-2">
        <Text className="text-white text-2xl font-bold">+</Text>
      </View>
      <Text className="font-serif text-base text-[#3d2c13] text-center mt-2">
        {name}
      </Text>
    </TouchableOpacity>
  );
}
