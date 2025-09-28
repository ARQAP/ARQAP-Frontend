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
      <View
        className="bg-white h-full justify-center"
        style={{ width: 110, borderBottomRightRadius: 40 }}
      >
        <Image
          source={require("../../assets/images/log.png")}
          resizeMode="contain"
          style={{
            width: 70,
            height: 70,
            alignSelf: "center",
          }}
        />
      </View>
      <View className="flex-1 flex-row items-center pl-6">
        {showBackArrow && (
          <TouchableOpacity
            onPress={() =>
              backToHome
                ? router.push("/(tabs)/home")
                : redirectTo
                  ? router.push(redirectTo as any)
                  : router.back()
            }
            style={{ marginRight: 12 }}
          >
            <Text
              style={{
                fontSize: 28,
                color: "#222",
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
