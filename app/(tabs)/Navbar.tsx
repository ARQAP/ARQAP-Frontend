import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
  title: string;
  showBackArrow?: boolean;
  backToHome?: boolean;
  redirectTo?: string;
}

function Navbar({
  title,
  showBackArrow,
  backToHome,
  redirectTo,
}: NavbarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full bg-[#D9C6A5] flex-row items-center h-[80px] px-4"
      style={{ 
        position: "relative",
        paddingTop: insets.top,
        height: 80 + insets.top
      }}
    >
      {/* Área izquierda: flecha + título multilinea */}
      <View
        className="flex-1 flex-row items-center"
        style={{ maxWidth: "100%" }}
      >
        {showBackArrow && (
          <TouchableOpacity
            onPress={() =>
              backToHome
                ? router.push("/(tabs)/home")
                : redirectTo
                  ? router.push(redirectTo as any)
                  : router.back()
            }
            className="mr-2"
            activeOpacity={1}
          >
            <Text
              className="text-[32px] text-[#222]"
              style={{
                fontFamily: "MateSC-Regular",
              }}
            >
              {"\u2190"}
            </Text>
          </TouchableOpacity>
        )}

        <Text
          className="font-bold text-xl text-black flex-shrink leading-tight"
          style={{
            fontFamily: "MateSC-Regular",
            lineHeight: 24,
            fontSize: 20,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      {/* Logo movido a la derecha */}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 16,
        }}
      >
        <Image
          source={require("../../assets/images/museo.png")}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
            backgroundColor: "transparent",
            borderWidth: 0,
            overflow: "hidden",
          }}
          fadeDuration={0}
          accessible={true}
          accessibilityLabel="Logo del Museo"
        />
      </View>
    </View>
  );
}

export default Navbar;
