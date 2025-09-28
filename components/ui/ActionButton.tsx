import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  title: string;
  onPress?: () => void;
}

export default function ActionButton({ title, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      className="bg-[#deceb1] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 w-[90%] sm:w-[250px] md:w-[280px] lg:w-[300px] xl:w-[320px] max-w-[350px] h-[90px] sm:h-[100px] md:h-[110px] lg:h-[120px] xl:h-[130px] flex-col items-center justify-center relative overflow-visible self-center"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View className="items-center">
        <View className="bg-[#8b5c2a] rounded-full w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 xl:w-15 xl:h-15 items-center justify-center mb-3 sm:mb-3 md:mb-4 lg:mb-4 xl:mb-4">
          <Text
            className="text-white font-bold text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl"
            style={{ lineHeight: 44, marginTop: -5 }}
          >
            +
          </Text>
        </View>
        <Text
          className="text-center text-[#3d2c13] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
