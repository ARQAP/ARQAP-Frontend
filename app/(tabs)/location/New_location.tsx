import React from "react";
import { Text, View } from "react-native";

export default function New_location() {
  return (
    <View className="flex-1 bg-[#F3E9DD] items-center justify-center">
      <Text
        className="text-2xl text-[#333] font-bold"
        style={{ fontFamily: "MateSC-Regular" }}
      >
        Registrar nuevo sitio arqueológico
      </Text>
    </View>
  );
}
