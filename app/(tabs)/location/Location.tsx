import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import ArchaeologicalSite from "./Archaeological_Site";

export default function Location() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />
      <View className="flex-1 px-2 sm:px-5 pt-5 pb-5">
        <Button
          title="Registrar nuevo sitio arqueológico"
          onPress={() => router.push("/(tabs)/location/New_location")}
          className="mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="w-full max-w-full mx-auto self-center">
            <View className="flex-row flex-wrap justify-center w-full">
              <ArchaeologicalSite
                name="Cueva De Las Manos"
                province="Provincia de Santa Cruz"
                region="La Patagonia"
                country="Argentina"
                antiquity="Más de 9,000 años"
                description="Sitio arqueológico con pinturas rupestres, famoso por siluetas de manos y escenas de caza"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// Todos los estilos ahora se aplican con clases Nativewind
