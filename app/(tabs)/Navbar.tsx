import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface NavbarProps {
  title: string;
  showBackArrow?: boolean;
  backToHome?: boolean;
  redirectTo?: string;
}

function Navbar({ title, showBackArrow, backToHome, redirectTo }: NavbarProps) {
  const router = useRouter();
  return (
    <View className="w-full bg-[#D9C6A5] flex-row items-center h-[80px]">
      <TouchableOpacity
        className="h-full justify-center items-center w-[110px]"
        onPress={() => router.push("/(tabs)/home")}
        activeOpacity={0.8}
      >
        <Image
          source={require("../../assets/images/museo.png")}
          style={{
            width: 64,
            height: 64,
            resizeMode: "contain",
            backgroundColor: "transparent",
            borderWidth: 0,
            overflow: "hidden",
          }}
          fadeDuration={0}
          accessible={true}
          accessibilityLabel="Logo del Museo"
        />
      </TouchableOpacity>
      <View className="flex-1 flex-row items-center pl-4">
        {showBackArrow && (
          <TouchableOpacity
            onPress={() =>
              backToHome
                ? router.push("/(tabs)/home")
                : redirectTo
                  ? router.push(redirectTo as any)
                  : router.back()
            }
            className="mr-3"
          >
            <Text
              className="text-[28px] text-[#222]"
              style={{
                fontFamily: "MateSC-Regular",
              }}
            >
              {"\u2190"}
            </Text>
          </TouchableOpacity>
        )}
        <Text
          className="font-bold text-2xl text-left text-black"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

export default Navbar;
