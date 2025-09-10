import React from "react";
import { Text, View } from "react-native";

function Navbar() {
  return (
    <View className="w-full bg-[#D9C6A5] py-3 px-4 flex-row items-center">
      <Text
        className="font-bold text-xl text-left text-black"
        style={{ fontFamily: "MateSC-Regular" }}
      >
        Inicio
      </Text>
    </View>
  );
}

export default Navbar;
