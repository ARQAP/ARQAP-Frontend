// New_Country.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

// --- Importar Hooks y Tipos ---
import { useCreateCountry } from "../../../hooks/useCountry";
import { Country } from "../../../repositories/countryRepository";

export default function New_Country() {
  const [countryName, setCountryName] = useState("");
  const router = useRouter();
  
  // Conexión con el Hook de Mutación
  const { mutate, isPending: isCreating } = useCreateCountry();

  const handleCrear = () => {
    const trimmedName = countryName.trim();
    if (!trimmedName) {
      return Alert.alert("Error", "El nombre del país no puede estar vacío.");
    }

    const newCountryPayload: Country = { 
        name: trimmedName 
    };

    mutate(newCountryPayload, {
      onSuccess: () => {
        Alert.alert("Éxito", `El país '${trimmedName}' fue creado correctamente.`);
        // Redirigir a la pantalla donde se puede usar el país
        router.push("/(tabs)/location/New_location"); 
      },
      onError: (error) => {
        Alert.alert("Error de Creación", `Fallo al crear el país: ${error.message}`);
      }
    });
  };

  const handleCancelar = () => {
    router.push("/(tabs)/location/New_location");
  };

  return (
    <View className="flex-1 bg-[#F7F0E6] items-center px-0">
      <View className="w-full">
        <Navbar
          title="Alta de País"
          showBackArrow
          backToHome={false}
          redirectTo="/(tabs)/location/New_location"
        />
      </View>
      <View className="w-full max-w-[500px] items-center self-center px-4">
        <Text
          className="text-center text-lg mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingrese los datos del nuevo país
        </Text>
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Nombre
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full font-crimson placeholder:text-[#A68B5B]"
            placeholder="Ingrese el nombre"
            value={countryName}
            onChangeText={setCountryName}
            editable={!isCreating}
            style={{ fontFamily: "CrimsonText-Regular" }}
          />
        </View>
        <Button
          title={isCreating ? "Creando..." : "Crear País"}
          onPress={handleCrear}
          className="w-full self-center mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-base font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
        <Button
          title="Cancelar"
          onPress={handleCancelar}
          className="w-full self-center bg-[#D9C6A5] rounded-lg py-3 items-center"
          textClassName="text-base text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
      </View>
    </View>
  );
}