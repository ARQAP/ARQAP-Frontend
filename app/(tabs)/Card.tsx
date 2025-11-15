import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CubeBadge from "../../components/ui/CubeBadge";

interface CardProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  cubeCount?: number;
}

export default function Card({ title, subtitle, icon, cubeCount }: CardProps) {
  const router = useRouter();
  const handlePress = () => {
    const t = title || "";
    if (/pieza/i.test(t)) {
      router.push({ pathname: "/(tabs)/archaeological-Pieces/View_pieces" });
      return;
    }
    if (title === "Arqueólogos") {
      router.push({ pathname: "/(tabs)/archaeologist/View_archaeologist" });
    } else if (title === "Sitios Arqueológicos") {
      router.push({ pathname: "/(tabs)/location/Location" });
    } else if (title === "Préstamos") {
      router.push({ pathname: "/(tabs)/loan/View_loan" });
    } else if (
      title === "Piezas Arqueológicas" ||
      title === "Piezas arqueologicas"
    ) {
      router.push({ pathname: "/(tabs)/archaeological-Pieces/View_pieces" });
    } else if (title === "Colecciones Arqueológicas" || /colección/i.test(title)) {
      router.push({ pathname: "/(tabs)/collection/View_collection" });
    }
  };
  return (
    <TouchableOpacity
      className="w-[90%] self-center rounded-xl p-4 my-2 flex-row items-center bg-[#6B705C]"
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View className="flex-1">
        <Text
          className="font-bold text-xl mb-1 text-white"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          {title}
        </Text>
        <Text
          className="text-base text-white opacity-80"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          {subtitle}
        </Text>
      </View>
      <View className="ml-4 items-center justify-center">
        {cubeCount !== undefined ? (
          <CubeBadge count={cubeCount} icon={icon} />
        ) : icon ? (
          <FontAwesome name={icon} size={32} color="#fff" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
