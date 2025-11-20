import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Button from "../../../components/ui/Button";
import SimplePickerModal from '../../../components/ui/SimpleModal';
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
  const params = useLocalSearchParams();
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
  // not needed with modal picker
  
  // --- 3. CONEXIÓN CON LOS HOOKS DE LECTURA (Regiones y Países) ---
  const { data: allRegions = [], isLoading: regionsLoading } = useAllRegions();
  const { data: allCountries = [], isLoading: countriesLoading } = useAllCountries();
  
  // HOOK DE MUTACIÓN (Sitio Arqueológico)
  const { mutate, isPending: isCreating } = useCreateArchaeologicalSite();


  // --- 4. LÓGICA DE SELECCIÓN Y BÚSQUEDA ---

  // Si venimos de crear/editar país/región, recuperar los valores previos pasados por params
  useEffect(() => {
    if (!params) return;
    const p: any = params;
    // Los params pueden venir como array o string
    const getVal = (key: string) => {
      const v = p[key];
      if (Array.isArray(v)) return v[0];
      return v;
    };

    const nombreParam = getVal('nombre');
    const ubicacionParam = getVal('ubicacion');
    const descripcionParam = getVal('descripcion');
    const regionSearchParam = getVal('regionSearch');
    const selectedRegionIdParam = getVal('selectedRegionId');
    const paisSearchParam = getVal('paisSearch');
    const selectedCountryIdParam = getVal('selectedCountryId');

    if (nombreParam) setNombre(String(nombreParam));
    if (ubicacionParam) setUbicacion(String(ubicacionParam));
    if (descripcionParam) setDescripcion(String(descripcionParam));
    if (regionSearchParam) setRegionSearch(String(regionSearchParam));
    if (selectedRegionIdParam) setSelectedRegionId(Number(selectedRegionIdParam));
    if (paisSearchParam) setPaisSearch(String(paisSearchParam));
    if (selectedCountryIdParam) setSelectedCountryId(Number(selectedCountryIdParam));
  }, [params]);
  const handleRegionSearchChange = (text: string) => {
    setRegionSearch(text);
    // Limpiamos el ID seleccionado si el usuario empieza a escribir
    setSelectedRegionId(undefined); 
    setShowRegionSuggestions(text.length > 0);
  };

  const handleRegionSuggestionSelect = (region: Region) => {
    // Si ya hay un país seleccionado, verificar que coincidan
    const regionCountryId = (region as any).countryId ?? (region as any).country?.id;
    if (selectedCountryId && regionCountryId && Number(selectedCountryId) !== Number(regionCountryId)) {
      const message = `La región '${region.name}' pertenece a otro país. Desea cambiar el país seleccionado a la región seleccionada?`;
      // web confirm
      if (Platform.OS === 'web') {
        const ok = window.confirm(message);
        if (!ok) return;
        // cambiar el país automáticamente
        const countryFromRegion = (region as any).country;
        if (countryFromRegion) {
          setPaisSearch(countryFromRegion.name);
          setSelectedCountryId(countryFromRegion.id);
        } else if (regionCountryId) {
          const found = allCountries.find(c => c.id === Number(regionCountryId));
          if (found) {
            setPaisSearch(found.name);
            setSelectedCountryId(found.id);
          }
        }
      } else {
        // native alert with options
        Alert.alert(
          'País diferente',
          message,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Cambiar país', onPress: () => {
              const countryFromRegion = (region as any).country;
              if (countryFromRegion) {
                setPaisSearch(countryFromRegion.name);
                setSelectedCountryId(countryFromRegion.id);
              } else if (regionCountryId) {
                const found = allCountries.find(c => c.id === Number(regionCountryId));
                if (found) {
                  setPaisSearch(found.name);
                  setSelectedCountryId(found.id);
                }
              }
            }}
          ]
        );
        // If user cancels, don't select region now
        // We'll return here and wait for user's choice. The Alert callback handles change.
        return;
      }
    }

    // Finalmente, seleccionar la región
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
    // Si el usuario modifica manualmente el país, limpiar la región seleccionada (posible inconsistencia)
    setSelectedRegionId(undefined);
    setRegionSearch('');
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

  // Items para el modal de regiones — si hay un país seleccionado, filtrar por countryId
  const regionItems = (selectedCountryId
    ? allRegions.filter(r => ((r as any).countryId ?? (r as any).country?.id) === Number(selectedCountryId))
    : allRegions
  ).map(r => ({ value: r.id!, label: r.name, raw: r }));
      
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

        {/* --- INPUT DE PAÍS (Con indicador de carga) --- */}
        <View className="mb-2 w-[98%] self-center relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a un País {countriesLoading && <ActivityIndicator size="small" color="#A68B5B" />}
          </Text>
          <View>
            <TouchableOpacity
              onPress={() => setShowPaisSuggestions(true)}
              style={{ borderWidth: 2, borderColor: '#A67C52', borderRadius: 8, padding: 12, backgroundColor: '#F7F5F2' }}
            >
              <Text style={{ fontFamily: 'MateSC-Regular', color: '#3d2c13' }}>{paisSearch || 'Buscar o seleccionar país'}</Text>
            </TouchableOpacity>
            {paisSearch.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-2 p-1"
                onPress={handleClearPaisSearch}
              >
                <Ionicons name="close-outline" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="p-2 flex-row items-center justify-end"
            onPress={() => router.push({ pathname: "/(tabs)/location/New_Country", params: { nombre, ubicacion, descripcion, regionSearch, selectedRegionId: selectedRegionId ? String(selectedRegionId) : undefined, paisSearch, selectedCountryId: selectedCountryId ? String(selectedCountryId) : undefined } })}
          >
            <Text
              className="text-[#A68B5B] mr-1"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Crear nuevo País
            </Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#A68B5B" />
          </TouchableOpacity>
        </View>

        {/* --- INPUT DE REGIÓN (Con indicador de carga) --- */}
        <View className="mb-2 w-[98%] self-center relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a una región {regionsLoading && <ActivityIndicator size="small" color="#A68B5B" />}
          </Text>
          <View>
            {/* Si no hay país seleccionado, impedir abrir el selector y mostrar ayuda */}
            <TouchableOpacity
              onPress={() => {
                if (!selectedCountryId) {
                  Alert.alert('Seleccione un país', 'Primero seleccione un país para ver sus regiones.');
                  return;
                }
                setShowRegionSuggestions(true);
              }}
              style={{ borderWidth: 2, borderColor: '#A67C52', borderRadius: 8, padding: 12, backgroundColor: '#F7F5F2', opacity: selectedCountryId ? 1 : 0.7 }}
            >
              <Text style={{ fontFamily: 'MateSC-Regular', color: '#3d2c13' }}>{regionSearch || (selectedCountryId ? 'Buscar o seleccionar región' : 'Seleccione un país primero')}</Text>
            </TouchableOpacity>
            {regionSearch.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-2 p-1"
                onPress={handleClearRegionSearch}
              >
                <Ionicons name="close-outline" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="p-2 flex-row items-center justify-end"
            onPress={() => router.push({ pathname: "/(tabs)/location/New_Region", params: { nombre, ubicacion, descripcion, regionSearch, selectedRegionId: selectedRegionId ? String(selectedRegionId) : undefined, paisSearch, selectedCountryId: selectedCountryId ? String(selectedCountryId) : undefined } })}
          >
            <Text
              className="text-[#A68B5B] mr-1"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Crear nueva Región
            </Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#A68B5B" />
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

      {/* --- Modal pickers para Región y País (reemplazan overlays) --- */}
      <SimplePickerModal
        visible={showRegionSuggestions}
        title="Seleccionar Región"
        items={regionItems}
        selectedValue={selectedRegionId ?? null}
        onSelect={(value) => {
          const sel = allRegions.find(r => r.id === Number(value));
          if (sel) handleRegionSuggestionSelect(sel);
          setShowRegionSuggestions(false);
        }}
        onClose={() => setShowRegionSuggestions(false)}
      />

      <SimplePickerModal
        visible={showPaisSuggestions}
        title="Seleccionar País"
        items={allCountries.map(c => ({ value: c.id!, label: c.name, raw: c }))}
        selectedValue={selectedCountryId ?? null}
        onSelect={(value) => {
          const sel = allCountries.find(c => c.id === Number(value));
          if (sel) handlePaisSuggestionSelect(sel);
          setShowPaisSuggestions(false);
        }}
        onClose={() => setShowPaisSuggestions(false)}
      />
    </ScrollView>
  );
}