import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  title: string;
  onPress?: () => void;
}

export default function ActionButton({ title, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      className="bg-[#deceb1] rounded-2xl p-4 w-[90%] max-w-[500px] h-[90px] items-center justify-center shadow-md relative overflow-visible self-center"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View className="absolute top-4 left-0 w-full items-center">
        <View className="bg-[#8b5c2a] rounded-full w-11 h-11 items-center justify-center ">
          <Text
            className="text-white font-bold text-xl"
            style={{ lineHeight: 44, marginTop: -5 }}
          >
            +
          </Text>
        </View>
      </View>
      <View className="flex-1 justify-end items-center mt-12">
        <Text
          className="text-center mt-1 text-[#3d2c13]"
          style={{ fontFamily: "MateSC-Regular", fontSize: 16 }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
