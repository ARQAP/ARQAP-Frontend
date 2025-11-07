import React from "react";
import { ScrollView, Text, View } from "react-native";
import Navbar from "../Navbar";

export default function LocationIndex() {
  return (
    <View className="flex-1 bg-[#F7F0E6]">
      <Navbar
        title="Ubicaciones"
        showBackArrow
        backToHome={true}
        redirectTo="/(tabs)/home"
      />
      <ScrollView className="flex-1 px-4">
        <Text className="text-lg text-center mt-4 text-gray-700">
          Sección de Ubicaciones
        </Text>
        <Text className="text-sm text-center mt-2 text-gray-500">
          Selecciona una opción del menú
        </Text>
      </ScrollView>
    </View>
  );
}
