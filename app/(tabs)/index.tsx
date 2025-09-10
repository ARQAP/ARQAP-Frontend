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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Navbar />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginTop: 32, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "MateSC-Regular",
              color: "#8B5E3C",
              fontSize: 45,
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            }}
          >
            ARQAP
          </Text>
        </View>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "MateSC-Regular",
              color: "#8B5E3C",
              fontSize: 30,
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            }}
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
        <View style={{ alignItems: "center", marginTop: 30 }}>
          <Text
            style={{
              fontFamily: "MateSC-Regular",
              color: "#8B5E3C",
              fontSize: 28,
              fontWeight: "bold",
              marginBottom: 14,
            }}
          >
            Acciones rápidas
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
              gap: 14,
            }}
          >
            <ActionButton title="Nueva Pieza" />
            <ActionButton title="Nuevo Arqueólogo" />
            <ActionButton title="Nueva Colección" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
