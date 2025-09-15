import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import ArchaeologicalSite from "./Archaeological_Site";

export default function Location() {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: "#F3E9DD" }}>
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />
      <View className="flex-1" style={{ padding: 20 }}>
        <Button
          title="Registrar nuevo sitio arqueológico"
          onPress={() => router.push("/(tabs)/location/New_location")}
          className="mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            className="mx-auto"
            style={{ maxWidth: 800, alignSelf: "center" }}
          >
            <View
              className="flex-row flex-wrap justify-between"
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
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

const styles = StyleSheet.create({
  inner: {
    maxWidth: 800,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
