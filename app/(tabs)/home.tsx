import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import ActionButton from "../../components/ui/ActionButton";
import Card from "./Card";
import Navbar from "./Navbar";

export default function HomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "MateSC-Regular": require("../../assets/fonts/MateSC-Regular.ttf"),
        "CrimsonText-Regular": require("../../assets/fonts/CrimsonText-Regular.ttf"),
        "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#F3E9DD" }}>
      <Navbar title="Inicio" />
      <ScrollView className="pb-8" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-8 mb-8">
          <Text
            className="text-[45px] font-bold text-center w-full text-[#8B5E3C]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            ARQAP
          </Text>
        </View>
        <View className="items-center mb-8">
          <Text
            className="text-[30px] font-bold text-center w-full text-[#8B5E3C]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Museo De Ciencias Naturales
          </Text>
        </View>
        <Card
          title="Piezas Arqueológicas"
          subtitle="Registrar y Gestionar las piezas"
          icon="archive"
          cubeCount={2845}
        />
        <Card
          title=" Colecciones Arqueológicas"
          subtitle="Organizar por colecciones"
          icon="book"
          cubeCount={156}
        />
        <Card
          title="Sitios Arqueológicos"
          subtitle="Gestionar ubicaciones"
          icon="map-marker"
          cubeCount={128}
        />
        <Card
          title="Arqueólogos"
          subtitle="Gestionar Especialistas"
          icon="user"
          cubeCount={12}
        />
        <Card
          title="Préstamos"
          subtitle="Préstamos activos"
          icon="exchange"
          cubeCount={23}
        />
        <View className="items-center mt-7">
          <Text
            className="text-[28px] font-bold text-[#8B5E3C] mb-3"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Acciones rápidas
          </Text>
          <View className="flex-col md:flex-row justify-center items-center mt-4 gap-4 sm:gap-5 md:gap-4 lg:gap-6 xl:gap-8 w-full md:flex-nowrap md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
            <ActionButton title="Nueva Pieza" />
            <ActionButton title="Nuevo Arqueólogo" />
            <ActionButton title="Nueva Colección" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
