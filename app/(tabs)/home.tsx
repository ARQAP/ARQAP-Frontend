import { useAllArchaeologicalSites } from "@/hooks/useArchaeologicalsite";
import { useArchaeologists } from "@/hooks/useArchaeologist";
import { useArtefacts } from "@/hooks/useArtefact";
import { useCollections } from "@/hooks/useCollections";
import { useLoans } from "@/hooks/useLoan";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import ActionButton from "../../components/ui/ActionButton";
import Colors from "../../constants/Colors";
import Card from "./Card";
import Navbar from "./Navbar";

export default function HomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  // Obtener datos para contar elementos
  const { data: artefacts = [] } = useArtefacts();
  const { data: collections = [] } = useCollections();
  const { data: sites = [] } = useAllArchaeologicalSites();
  const { data: archaeologists = [] } = useArchaeologists();
  const { data: loans = [] } = useLoans();

  // Contar préstamos activos (sin fecha de devolución)
  const activeLoans = loans.filter(
    (loan) => !loan.returnDate || !loan.returnTime
  );

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
        <ActivityIndicator size="large" color={Colors.brown} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
      <Navbar title="Inicio" />
      <ScrollView className="pb-8" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-8 mb-8">
          <Text
            className="text-[45px] font-bold text-center w-full"
            style={{ fontFamily: "MateSC-Regular", color: Colors.brown }}
          >
            ARQAP
          </Text>
        </View>
        <View className="items-center mb-8">
          <Text
            className="text-[30px] font-bold text-center w-full"
            style={{ fontFamily: "MateSC-Regular", color: Colors.brown }}
          >
            Museo De Ciencias Naturales
          </Text>
        </View>
        <Card
          title="Piezas Arqueológicas"
          subtitle="Registrar y Gestionar las piezas"
          icon="archive"
          cubeCount={artefacts.length}
        />
        <Card
          title=" Colecciones Arqueológicas"
          subtitle="Organizar por colecciones"
          icon="book"
          cubeCount={collections.length}
        />
        <Card
          title="Sitios Arqueológicos"
          subtitle="Gestionar ubicaciones"
          icon="map-marker"
          cubeCount={sites.length}
        />
        <Card
          title="Arqueólogos"
          subtitle="Gestionar Especialistas"
          icon="user"
          cubeCount={archaeologists.length}
        />
        <Card
          title="Préstamos"
          subtitle="Préstamos activos"
          icon="exchange"
          cubeCount={activeLoans.length}
        />
        <View className="items-center mt-7">
          <Text
            className="text-[28px] font-bold text-[#8B5E3C] mb-3"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Acciones rápidas
          </Text>
          <View className="flex-col md:flex-row justify-center items-center mt-4 gap-4 sm:gap-5 md:gap-4 lg:gap-6 xl:gap-8 w-full md:flex-nowrap md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
            <ActionButton
              title="Nueva Pieza"
              onPress={() =>
                router.push("/(tabs)/archaeological-Pieces/New_piece")
              }
            />
            <ActionButton
              title="Nuevo Arqueólogo"
              onPress={() =>
                router.push("/(tabs)/archaeologist/New_archaeologist")
              }
            />
            <ActionButton
              title="Nueva Colección"
              onPress={() => router.push("/(tabs)/collection/New_collection")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
