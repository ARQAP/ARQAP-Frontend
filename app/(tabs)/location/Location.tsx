import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function Location() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />
      <View className="flex-1 p-5">
        <Button
          title="Registrar nuevo sitio arqueológico"
          onPress={() => router.push("/(tabs)/location/New_location")}
          textStyle={{ fontFamily: "MateSC-Regular", fontWeight: "bold" }}
        />
      </View>
    </View>
  );
}
