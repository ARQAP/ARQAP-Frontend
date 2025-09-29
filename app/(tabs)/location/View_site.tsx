import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function ViewSite() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const name = Array.isArray(params.name) ? params.name[0] : params.name || "";
  const province = Array.isArray(params.province)
    ? params.province[0]
    : params.province || "";
  const region = Array.isArray(params.region)
    ? params.region[0]
    : params.region || "";
  const country = Array.isArray(params.country)
    ? params.country[0]
    : params.country || "";
  const antiquity = Array.isArray(params.antiquity)
    ? params.antiquity[0]
    : params.antiquity || "";
  const description = Array.isArray(params.description)
    ? params.description[0]
    : params.description || "";

  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Sitio Arqueológico" showBackArrow textStyle={{ fontFamily: "MateSC-Regular" }} />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mb-6">
          <Text
            className="text-3xl font-bold text-[#3d2c13] text-center mb-2"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            {name}
          </Text>
          <View className="h-1 bg-[#A67C52] mx-auto w-24 rounded-full" />
        </View>

        <View className="bg-[#D9C6A5] rounded-2xl p-6 mb-6 shadow-lg relative">
          <TouchableOpacity
            className="absolute top-4 right-4 z-10 bg-[#A67C52] p-2 rounded-full"
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: `/(tabs)/location/Edit_site` as any,
                params: {
                  name,
                  province,
                  region,
                  country,
                  antiquity,
                  description,
                },
              });
            }}
          >
            <Feather name="edit-2" size={20} color="#F7F5F2" />
          </TouchableOpacity>
          <View className="space-y-5">
            <DetailItem icon="map-pin" label="Provincia" value={province} />

            <DetailItem icon="globe" label="Región" value={region} />

            <DetailItem icon="flag" label="País" value={country} />

            <DetailItem icon="calendar" label="Antigüedad" value={antiquity} />
          </View>
        </View>

        <View className="bg-[#F7F5F2] rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-[#A67C52] p-2 rounded-full mr-3">
              <Feather name="info" size={20} color="#F7F5F2" />
            </View>
            <Text
              className="text-xl font-bold text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Descripción
            </Text>
          </View>
          <Text
            className="text-[16px] text-[#3d2c13] leading-6"
            style={{ fontFamily: "CrimsonText-Regular" }}
          >
            {description}
          </Text>
        </View>

        <Button
          title="Volver a Sitios Arqueológicos"
          onPress={() => router.back()}
          className="bg-[#6B705C] rounded-lg py-4 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
      </ScrollView>
    </View>
  );
}

type FeatherIconNames = "map-pin" | "globe" | "flag" | "calendar";

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: FeatherIconNames;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="bg-[#A67C52] p-2 rounded-full mr-4">
        <Feather name={icon} size={16} color="#F7F5F2" />
      </View>
      <View className="flex-1">
        <Text
          className="text-[14px] font-bold text-[#3d2c13] mb-1"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          {label}:
        </Text>
        <Text
          className="text-[16px] text-[#3d2c13]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
