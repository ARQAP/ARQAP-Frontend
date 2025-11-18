import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";
import { removeToken } from "../../services/authStorage";

interface NavbarProps {
  title: string;
  showBackArrow?: boolean;
  backToHome?: boolean;
  redirectTo?: string;
  showLogout?: boolean;
}

function Navbar({
  title,
  showBackArrow,
  backToHome,
  redirectTo,
  showLogout = true,
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace("/(tabs)");
  };

  return (
    <View
      className="w-full flex-row items-center h-[80px] px-4"
      style={{ position: "relative", backgroundColor: Colors.cremit }}
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
          className="font-bold text-lg text-black flex-shrink leading-tight"
          style={{
            fontFamily: "MateSC-Regular",
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      {/* Logo en el centro absoluto */}
      <View
        style={{
          position: "absolute",
          left: "48.2%",
          marginLeft: 0,
          justifyContent: "center",
          alignItems: "center",
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

      {/* Área derecha: logout */}
      <View className="flex-1 items-end" style={{ maxWidth: "100%" }}>
        {showLogout && (
          <TouchableOpacity
            onPress={handleLogout}
            className="p-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={24} color={Colors.brown} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default Navbar;
