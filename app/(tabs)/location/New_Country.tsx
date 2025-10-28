// New_Country.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

// --- Importar Hooks y Tipos ---
import { SimplePickerItem } from '../../../components/ui/SimpleModal';
import { useAllCountries, useCreateCountry } from "../../../hooks/useCountry";
import { Country } from "../../../repositories/countryRepository";

export default function New_Country() {
  const [countryName, setCountryName] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Conexión con el Hook de Mutación
  const { mutate, isPending: isCreating } = useCreateCountry();
  const { data: allCountries = [] } = useAllCountries();
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const countryItems: SimplePickerItem<Country>[] = useMemo(() => (
    allCountries.map((c) => ({ value: c.id!, label: c.name, raw: c }))
  ), [allCountries]);

  const handleCrear = () => {
    const trimmedName = countryName.trim();
    if (!trimmedName) {
      return Alert.alert("Error", "El nombre del país no puede estar vacío.");
    }

    const newCountryPayload: Country = { 
        name: trimmedName 
    };

    mutate(newCountryPayload, {
      onSuccess: (createdCountry: any) => {
        const createdId = createdCountry?.id;
        const createdName = createdCountry?.name ?? trimmedName;
        Alert.alert("Éxito", `El país '${createdName}' fue creado correctamente.`);
        const p: any = params ?? {};
        router.push({ pathname: "/(tabs)/location/New_location", params: {
          nombre: p.nombre,
          ubicacion: p.ubicacion,
          descripcion: p.descripcion,
          regionSearch: p.regionSearch,
          selectedRegionId: p.selectedRegionId,
          paisSearch: createdName,
          selectedCountryId: createdId ? String(createdId) : undefined,
        }});
      },
      onError: (error) => {
        Alert.alert("Error de Creación", `Fallo al crear el país: ${error.message}`);
      }
    });
  };

  const handleCancelar = () => {
    const p: any = params ?? {};
    router.push({ pathname: "/(tabs)/location/New_location", params: {
      nombre: p.nombre,
      ubicacion: p.ubicacion,
      descripcion: p.descripcion,
      regionSearch: p.regionSearch,
      selectedRegionId: p.selectedRegionId,
      paisSearch: p.paisSearch,
      selectedCountryId: p.selectedCountryId,
    }});
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