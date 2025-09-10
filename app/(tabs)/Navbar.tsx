import React from "react";
import { Image, Text, View } from "react-native";

function Navbar() {
  return (
    <View className="w-full bg-[#D9C6A5] flex-row items-center h-[80px]">
      <View
        className="bg-white h-full justify-center"
        style={{ width: 110, borderBottomRightRadius: 40 }}
      >
        <Image
          source={require("../../assets/images/log.png")}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            alignSelf: "center",
          }}
        />
      </View>
      <View className="flex-1 flex-row items-center pl-6">
        <Text
          className="font-bold text-2xl text-left text-black"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          Inicio
        </Text>
      </View>
    </View>
  );
}

export default Navbar;
