// New_Country.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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

  const isButtonDisabled = isCreating || !countryName.trim();

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Nuevo País"
        showBackArrow
        backToHome={false}
        redirectTo="/(tabs)/location/New_location"
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: Platform.OS === "web" ? 32 : 20,
            paddingTop: Platform.OS === "web" ? 40 : 20,
            paddingBottom: Platform.OS === "web" ? 32 : 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 800,
              alignSelf: "center",
            }}
          >
            {/* Encabezado */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 28,
                marginBottom: 32,
                shadowColor: "#8B5E3C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontSize: 28,
                  color: "#8B5E3C",
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Nuevo País
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Ingrese los datos del nuevo país
              </Text>
            </View>

            {/* Formulario */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#8B5E3C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {/* Campo Nombre */}
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontFamily: "MateSC-Regular",
                    fontSize: 15,
                    color: "#8B5E3C",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Nombre *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                  }}
                  placeholder="Nombre del país"
                  value={countryName}
                  onChangeText={setCountryName}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  editable={!isCreating}
                />
              </View>
            </View>

            {/* Botones de Acción */}
            <View style={{ gap: 16 }}>
              <Button
                title={isCreating ? "Creando País..." : "Crear País"}
                onPress={handleCrear}
                style={{
                  opacity: isButtonDisabled ? 0.6 : 1,
                }}
                textStyle={{
                  fontFamily: "MateSC-Regular",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              />
              
              <Button
                title="Cancelar"
                onPress={handleCancelar}
                style={{
                  backgroundColor: "#E5D4C1",
                }}
                textStyle={{
                  fontFamily: "MateSC-Regular",
                  fontSize: 15,
                  color: "#8B5E3C",
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}