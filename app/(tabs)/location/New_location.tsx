import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

// --- 1. IMPORTAR HOOKS Y TIPOS ---
import { useCreateArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
import { useAllCountries } from "../../../hooks/useCountry";
import { useAllRegions } from "../../../hooks/useRegion";
import { ArchaeologicalSite } from "../../../repositories/archaeologicalsiteRepository";
import { Country } from "../../../repositories/countryRepository";
import { Region } from "../../../repositories/regionRepository";

// Define un tipo para las posiciones de los inputs (se mantiene igual)
interface InputPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}


export default function New_location() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // --- 2. ESTADO DE LOS DATOS A CREAR ---
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  
  // Guardamos el nombre y el ID seleccionado para la mutación
  const [regionSearch, setRegionSearch] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [paisSearch, setPaisSearch] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);

  // Estados de UI
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [showPaisSuggestions, setShowPaisSuggestions] = useState(false);
  const [regionInputPosition, setRegionInputPosition] = useState<InputPosition>({ x: 0, y: 0, width: 0, height: 0 });
  const [paisInputPosition, setPaisInputPosition] = useState<InputPosition>({ x: 0, y: 0, width: 0, height: 0 });
  
  // --- 3. CONEXIÓN CON LOS HOOKS DE LECTURA (Regiones y Países) ---
  const { data: allRegions = [], isLoading: regionsLoading } = useAllRegions();
  const { data: allCountries = [], isLoading: countriesLoading } = useAllCountries();
  
  // HOOK DE MUTACIÓN (Sitio Arqueológico)
  const { mutate, isPending: isCreating } = useCreateArchaeologicalSite();


  // --- 4. LÓGICA DE SELECCIÓN Y BÚSQUEDA ---

  const handleRegionSearchChange = (text: string) => {
    setRegionSearch(text);
    // Limpiamos el ID seleccionado si el usuario empieza a escribir
    setSelectedRegionId(undefined); 
    setShowRegionSuggestions(text.length > 0);
  };

  const handleRegionSuggestionSelect = (region: Region) => {
    setRegionSearch(region.name);
    setSelectedRegionId(region.id); // Guardamos el ID real para la mutación
    setShowRegionSuggestions(false);
  };

  const handleClearRegionSearch = () => {
    setRegionSearch("");
    setSelectedRegionId(undefined);
    setShowRegionSuggestions(false);
  };

  const handlePaisSearchChange = (text: string) => {
    setPaisSearch(text);
    setSelectedCountryId(undefined);
    setShowPaisSuggestions(text.length > 0);
  };

  const handlePaisSuggestionSelect = (country: Country) => {
    setPaisSearch(country.name);
    setSelectedCountryId(country.id); // Guardamos el ID real
    setShowPaisSuggestions(false);
  };

  const handleClearPaisSearch = () => {
    setPaisSearch("");
    setSelectedCountryId(undefined);
    setShowPaisSuggestions(false);
  };

  // Filtramos la data real de la API
  const regionSuggestions =
    regionSearch.length > 0
      ? allRegions
          .filter((region: Region) =>
            region.name.toLowerCase().includes(regionSearch.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const paisSuggestions =
    paisSearch.length > 0
      ? allCountries
          .filter((country: Country) =>
            country.name.toLowerCase().includes(paisSearch.toLowerCase())
          )
          .slice(0, 5)
      : [];
      
  // --- 5. FUNCIÓN DE CREACIÓN CON MUTATION ---
  const handleCrear = () => {
    if (!nombre.trim() || !ubicacion.trim() || !descripcion.trim()) {
      return Alert.alert("Error", "Debe completar Nombre, Ubicación y Descripción.");
    }
    if (!selectedRegionId) {
        return Alert.alert("Error", "Debe seleccionar o buscar una Región válida.");
    }
    // NOTA: Tu modelo de ArchaeologicalSite no tiene countryId, solo regionId. 
    // Si tu modelo real lo necesita, el tipo SiteType debe actualizarse en el repositorio.
    // Usaremos solo regionId por ahora, asumiendo que el campo 'País' en la UI es informativo o debe ser un input extra en el modelo.
    
    // El payload debe coincidir con el tipo ArchaeologicalSite para la mutación
    const newSite: ArchaeologicalSite = {
      Name: nombre.trim(),
      Description: descripcion.trim(),
      Location: ubicacion.trim(),
      regionId: selectedRegionId,
      // La mutación NO debe enviar el objeto 'region' completo, solo la clave foránea.
      // Aquí estamos forzando el tipo para que TypeScript no se queje, pero en producción,
      // el tipo ArchaeologicalSite solo debería tener regionId para la mutación.
      region: {} as Region, 
    };

    mutate(newSite, {
      onSuccess: () => {
        Alert.alert("Éxito", "Sitio Arqueológico creado correctamente.");
        router.push("/(tabs)/location/Location"); // Navegar de vuelta a la lista
      },
      onError: (e) => {
        Alert.alert("Error", `Fallo al crear el sitio: ${e.message}`);
      }
    });
  };

  const handleCancelar = () => {
    router.push("/(tabs)/location/Location");
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F3E9DD]"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      <Navbar
        title="Nuevo Sitio Arqueológico"
        showBackArrow
        backToHome={false}
        redirectTo="/(tabs)/location/Location"
      />
      <View className="w-[90%] max-w-[500px] items-center self-center">
        {/* ... (Nombre, Ubicación, Descripción inputs, JSX sin cambios) ... */}
        <Text
          className="text-center text-[18px] mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingrese los datos del nuevo sitio arqueológico
        </Text>
        <View className="flex-row w-[98%] gap-2 mb-2">
          <View className="flex-1">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Nombre
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
              style={{ fontFamily: "MateSC-Regular" }}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Ubicación
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
              style={{ fontFamily: "MateSC-Regular" }}
              placeholder="Ubicación"
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
          </View>
        </View>
        <View className="mb-2 w-[98%] self-center">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Descripción
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            style={{ fontFamily: "MateSC-Regular", textAlignVertical: "top" }}
            placeholder="Descripción detallada del sitio"
            value={descripcion}
            onChangeText={setDescripcion}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* --- INPUT DE REGIÓN (Con indicador de carga) --- */}
        <View className="mb-2 w-[98%] self-center relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a una región {regionsLoading && <ActivityIndicator size="small" color="#A68B5B" />}
          </Text>
          <View className="relative">
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full pr-12"
              style={{ fontFamily: "MateSC-Regular" }}
              placeholder="Buscar o seleccionar región"
              value={regionSearch}
              onChangeText={handleRegionSearchChange}
              onFocus={() => setShowRegionSuggestions(regionSearch.length > 0)}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setRegionInputPosition({ x, y, width, height });
              }}
            />
            {regionSearch.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-2 p-1"
                onPress={handleClearRegionSearch}
              >
                <Feather name="x" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="p-2 flex-row items-center justify-end"
            onPress={() => router.push("/(tabs)/location/New_Region")}
          >
            <Text
              className="text-[#A68B5B] mr-1"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Crear nueva Región
            </Text>
            <Feather name="arrow-up-right" size={16} color="#A68B5B" />
          </TouchableOpacity>
        </View>
        
        {/* --- INPUT DE PAÍS (Con indicador de carga) --- */}
        <View className="mb-2 w-[98%] self-center relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a un País {countriesLoading && <ActivityIndicator size="small" color="#A68B5B" />}
          </Text>
          <View className="relative">
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full pr-12"
              style={{ fontFamily: "MateSC-Regular" }}
              placeholder="Buscar o seleccionar país"
              value={paisSearch}
              onChangeText={handlePaisSearchChange}
              onFocus={() => setShowPaisSuggestions(paisSearch.length > 0)}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setPaisInputPosition({ x, y, width, height });
              }}
            />
            {paisSearch.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-2 p-1"
                onPress={handleClearPaisSearch}
              >
                <Feather name="x" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="p-2 flex-row items-center justify-end"
            onPress={() => router.push("/(tabs)/location/New_Country")}
          >
            <Text
              className="text-[#A68B5B] mr-1"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Crear nuevo País
            </Text>
            <Feather name="arrow-up-right" size={16} color="#A68B5B" />
          </TouchableOpacity>
        </View>

        {/* --- BOTONES DE ACCIÓN (Con estado de carga de mutación) --- */}
        <Button
          title={isCreating ? "Creando Sitio..." : "Crear Sitio Arqueológico"}
          onPress={handleCrear}
          className="w-[98%] self-center mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
        <Button
          title="Cancelar"
          onPress={handleCancelar}
          className="w-[98%] self-center bg-[#D9C6A5] rounded-lg py-3 items-center"
          textClassName="text-[16px] text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
      </View>

      {/* --- Bloque de Sugerencias de Región (usando data de la API) --- */}
      {showRegionSuggestions && regionSuggestions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: regionInputPosition.y + regionInputPosition.height + 5,
            left: regionInputPosition.x,
            right: 0,
            marginHorizontal: 8,
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: "#A67C52",
            borderRadius: 8,
            maxHeight: 200,
            zIndex: 99999,
            elevation: 50,
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled>
            {regionSuggestions.map((region: Region, index: number) => ( // Corregido: tipado y usando objeto Region
              <TouchableOpacity
                key={region.id || index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handleRegionSuggestionSelect(region)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* --- Bloque de Sugerencias de País (usando data de la API) --- */}
      {showPaisSuggestions && paisSuggestions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: paisInputPosition.y + paisInputPosition.height + 5,
            left: paisInputPosition.x,
            right: 0,
            marginHorizontal: 8,
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: "#A67C52",
            borderRadius: 8,
            maxHeight: 200,
            zIndex: 99999,
            elevation: 50,
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled>
            {paisSuggestions.map((pais: Country, index: number) => ( // Corregido: tipado y usando objeto Country
              <TouchableOpacity
                key={pais.id || index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handlePaisSuggestionSelect(pais)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {pais.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}