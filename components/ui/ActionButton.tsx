import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  title: string;
  onPress?: () => void;
}

export default function ActionButton({ title, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      className="bg-[#deceb1] rounded-2xl p-4 w-[90%] max-w-[500px] h-[90px] flex-col items-center justify-center shadow-md relative overflow-visible self-center"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View className="items-center">
        <View className="bg-[#8b5c2a] rounded-full w-11 h-11 items-center justify-center mb-4">
          <Text
            className="text-white font-bold text-xl"
            style={{ lineHeight: 44, marginTop: -5 }}
          >
            +
          </Text>
        </View>
        <Text
          className="text-center text-[#3d2c13]"
          style={{ fontFamily: "MateSC-Regular", fontSize: 16 }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
