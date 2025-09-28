import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ArchaeologicalSiteProps {
  name: string;
  province: string;
  region: string;
  country: string;
  antiquity: string;
  description: string;
}

export default function ArchaeologicalSite({
  name,
  province,
  region,
  country,
  antiquity,
  description,
}: ArchaeologicalSiteProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: `/(tabs)/location/View_site` as any,
      params: {
        name,
        province,
        region,
        country,
        antiquity,
        description,
      },
    });
  };

  return (
    <TouchableOpacity
      className="w-full max-w-md p-4 rounded-xl mb-4 bg-[#D9C6A5] relative"
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View className="absolute top-3 right-3">
        <Feather name="chevron-right" size={20} color="#8B5E3C" />
      </View>

      <Text
        className="text-xl font-bold text-amber-900 mb-4 tracking-wide pr-8"
        style={{ fontFamily: "MateSC-Regular" }}
      >
        {name}
      </Text>

      <View className="space-y-3">
        <InfoItem icon="map-pin" label="Provincia" value={province} />
        <InfoItem icon="globe" label="Región" value={region} />
        <InfoItem icon="map-pin" label="País" value={country} />
        <InfoItem icon="calendar" label="Antigüedad" value={antiquity} />
        <InfoItem
          icon="info"
          label="Descripción"
          value={description}
          multiline
        />
      </View>
    </TouchableOpacity>
  );
}

type FeatherIconNames = "map-pin" | "globe" | "calendar" | "info";

function InfoItem({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: FeatherIconNames;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View className="flex-row items-start mb-3">
      <View className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-0.5 bg-[#8B5E3C]">
        <Feather name={icon} size={16} color="#FEF3C7" />
      </View>
      <View className="flex-1">
        <Text
          className="text-xs font-semibold text-amber-900 tracking-wide"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          {label}
        </Text>
        <Text
          className={multiline ? "text-sm leading-5" : "text-sm"}
          style={{ fontFamily: "CrimsonText-Regular", color: "#000" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
