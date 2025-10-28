import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

// --- Importar Hooks y Tipos ---
import SimplePickerModal, { SimplePickerItem } from '../../../components/ui/SimpleModal';
import { useAllCountries } from "../../../hooks/useCountry";
import { useCreateRegion } from "../../../hooks/useRegion";
import { Country } from "../../../repositories/countryRepository"; // Para tipar los países
import { CreateRegionPayload } from "../../../repositories/regionRepository";

export default function New_Region() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Si venimos desde New_location con un país seleccionado, pre-seleccionarlo
  useEffect(() => {
    if (!params) return;
    const p: any = params;
    const getVal = (key: string) => {
      const v = p[key];
      if (Array.isArray(v)) return v[0];
      return v;
    };

    const selectedCountryIdParam = getVal('selectedCountryId');
    const paisSearchParam = getVal('paisSearch');

    if (selectedCountryIdParam) {
      const idNum = Number(selectedCountryIdParam);
      setSelectedCountryId(idNum);
    }
    if (paisSearchParam) {
      setSelectedCountryName(String(paisSearchParam));
      setCountrySearch(String(paisSearchParam));
    }
  }, [params]);
  
  // ESTADO DE LA REGIÓN
  const [regionName, setRegionName] = useState("");
  
  // ESTADO DEL PAÍS ASOCIADO
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);
  const [selectedCountryName, setSelectedCountryName] = useState<string>("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  
  // --- Conexión con Hooks ---
  const { mutate, isPending: isCreating } = useCreateRegion();
  const { data: allCountries = [], isLoading: isCountriesLoading } = useAllCountries();

  // --- Lógica de Búsqueda de País ---
  const handleCountrySearchChange = (text: string) => {
    setCountrySearch(text);
    // Limpiamos la selección si el usuario empieza a escribir de nuevo
    setSelectedCountryId(undefined);
    setSelectedCountryName("");
    setShowCountrySuggestions(text.length > 0);
  };

  const handleCountrySuggestionSelect = (country: Country) => {
    setSelectedCountryId(country.id);
    setSelectedCountryName(country.name);
    setCountrySearch(country.name);
    setShowCountrySuggestions(false);
  };

  const countrySuggestions = countrySearch.length > 0
    ? allCountries
        .filter((country: Country) => 
            country.name.toLowerCase().includes(countrySearch.toLowerCase()))
        .slice(0, 5)
    : [];

  // Mapeo para SimplePickerModal
  const countryItems: SimplePickerItem<Country>[] = allCountries.map((c) => ({
    value: c.id!,
    label: c.name,
    raw: c,
  }));

  const handleCrear = () => {
    const trimmedName = regionName.trim();

    if (!trimmedName) {
      return Alert.alert("Error", "El nombre de la región no puede estar vacío.");
    }
    if (selectedCountryId === undefined) {
      return Alert.alert("Error", "Debe seleccionar un País para asociar la región.");
    }

    // --- 2. Crear la Carga Útil (Payload) ---
    const newRegionPayload: CreateRegionPayload = {
      name: trimmedName,
      countryId: selectedCountryId, // ¡Ahora enviamos el ID!
    };

    // --- 3. Ejecutar la Mutación ---
    mutate(newRegionPayload, {
      onSuccess: (createdRegion: any) => {
        const createdId = createdRegion?.id;
        const createdName = createdRegion?.name ?? trimmedName;
        Alert.alert("Éxito", `La región '${createdName}' fue creada y asociada a ${selectedCountryName}.`);
        const p: any = params ?? {};
        router.push({
          pathname: "/(tabs)/location/New_location",
          params: {
            nombre: p.nombre,
            ubicacion: p.ubicacion,
            descripcion: p.descripcion,
            regionSearch: createdName,
            selectedRegionId: createdId ? String(createdId) : undefined,
            paisSearch: p.paisSearch,
            selectedCountryId: p.selectedCountryId,
          }
        });
      },
      onError: (error) => {
        Alert.alert("Error de Creación", `Fallo al crear la región: ${error.message}`);
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
          title="Alta de Región"
          showBackArrow
          backToHome={false}
          redirectTo="/(tabs)/location/New_location"
        />
      </View>
      <View className="w-full max-w-[500px] items-center self-center px-4">
        {/* ... (Título del formulario) ... */}
        <Text
          className="text-center text-lg mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingrese los datos de la nueva región
        </Text>
        
        {/* --- INPUT NOMBRE DE LA REGIÓN --- */}
        <View className="mb-4 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Nombre de la Región
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base w-full placeholder:text-[#A68B5B]"
            placeholder="Ingrese el nombre"
            value={regionName}
            onChangeText={setRegionName}
            style={{ fontFamily: "CrimsonText-Regular" }}
            editable={!isCreating}
          />
        </View>

        {/* --- INPUT Y BÚSQUEDA DE PAÍS (Implementando useAllCountries) --- */}
        <View className="mb-6 w-full relative">
            <Text
                className="text-[16px] font-bold mb-2 text-[#3d2c13]"
                style={{ fontFamily: "MateSC-Regular" }}
            >
                Asociar a País {isCountriesLoading && <ActivityIndicator size="small" color="#A68B5B" />}
            </Text>
      {/* Reemplazamos el TextInput + sugerencias por un selector modal */}
      <TouchableOpacity
        onPress={() => setCountryPickerOpen(true)}
        style={{ borderWidth: 2, borderColor: '#A67C52', borderRadius: 8, padding: 12, backgroundColor: '#F7F5F2' }}
      >
        <Text style={{ fontFamily: 'CrimsonText-Regular' }}>
          {selectedCountryId ? `País: ${selectedCountryName}` : 'Buscar o seleccionar un País'}
        </Text>
      </TouchableOpacity>
      {selectedCountryId !== undefined && (
        <Text className="text-[14px] text-[#3d2c13] mt-2" style={{ fontFamily: "CrimsonText-Regular" }}>
          País Seleccionado: <Text className="font-bold">{selectedCountryName}</Text>
        </Text>
      )}
        </View>

        {/* --- Botones --- */}
        <Button
          title={isCreating ? "Creando..." : "Crear Región"}
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
      {/* Modal de selección de País */}
      <SimplePickerModal
        visible={countryPickerOpen}
        title="Seleccionar país"
        items={countryItems}
        selectedValue={selectedCountryId ?? null}
        onSelect={(value) => {
          const sel = allCountries.find((c) => c.id === Number(value));
          if (sel) {
            setSelectedCountryId(sel.id);
            setSelectedCountryName(sel.name);
            setCountrySearch(sel.name);
          }
          setCountryPickerOpen(false);
        }}
        onClose={() => setCountryPickerOpen(false)}
      />
    </View>
  );
}