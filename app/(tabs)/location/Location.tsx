import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, // Importado para el estado de carga
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import ArchaeologicalSite from "./Archaeological_Site";
// Importar el hook de lectura de la API y el tipo
import { useAllArchaeologicalSites } from "../../../hooks/useArchaeologicalsite";
import { ArchaeologicalSite as SiteType } from "../../../repositories/archaeologicalsiteRepository";


export default function Location() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- 1. CONEXIÓN CON EL HOOK DE LA API ---
  const { 
    data: allSites = [], 
    isLoading, 
    isError, 
    error 
  } = useAllArchaeologicalSites();

  // Mantenemos la lógica de búsqueda y filtros con los datos de la API
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    setShowSuggestions(text.length > 0);
  };

  const handleSuggestionSelect = (siteName: string) => {
    setSearchTerm(siteName);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  // La lógica de filtro usa el campo 'name' del tipo SiteType
  const suggestions =
    searchTerm.length > 0
      ? allSites
          .filter((site: SiteType) =>
            site.Name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const filteredSites =
    searchTerm.length > 0
      ? allSites.filter((site: SiteType) =>
          site.Name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allSites;
  
  // --- 2. MANEJO DE ESTADOS DE CARGA Y ERROR ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F3E9DD] items-center justify-center">
        <ActivityIndicator size="large" color="#6B705C" />
        <Text style={{ fontFamily: "CrimsonText-Regular", marginTop: 10 }}>Cargando sitios arqueológicos...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-[#F3E9DD] items-center justify-center p-5">
        <Text style={{ fontFamily: "MateSC-Regular", color: 'red', textAlign: 'center' }}>
          Error al cargar los sitios: {error?.message}.
        </Text>
      </View>
    );
  }
  
  const showNoSitesMessage = !isLoading && !isError && filteredSites.length === 0 && searchTerm.length === 0;

  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />
      <View className="flex-1 px-2 sm:px-5 pt-5 pb-5">
        <Button
          title="Registrar nuevo sitio arqueológico"
          onPress={() => router.push("/(tabs)/location/New_location")}
          className="mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />

        {/* Búsqueda mejorada */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'MateSC-Regular', fontWeight: '700', marginBottom: 8, color: '#3d2c13' }}>
            Buscar sitio arqueológico
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F5F2', borderRadius: 12, borderWidth: 1, borderColor: '#E6DAC4', paddingHorizontal: 12, paddingVertical: 8 }}>
            <Feather name="search" size={18} color="#A68B5B" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChangeText={handleSearchChange}
              onFocus={() => setShowSuggestions(searchTerm.length > 0)}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
              style={{ flex: 1, fontFamily: 'CrimsonText-Regular', fontSize: 16 }}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={{ padding: 6 }} accessibilityLabel="Limpiar búsqueda">
                <Feather name="x" size={18} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          {/* sugerencias inline */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E6DAC4', maxHeight: 240, overflow: 'hidden', elevation: 6 }}>
                <ScrollView nestedScrollEnabled>
                  {suggestions.map((site: SiteType, index: number) => (
                    <TouchableOpacity key={site.id || index} onPress={() => handleSuggestionSelect(site.Name)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1E8DA' }}>
                      <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13', fontSize: 16 }}>{site.Name}</Text>
                      <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#A68B5B', marginTop: 6 }}>{site.Location} • {site.region?.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        >
          <View className="w-full max-w-full mx-auto self-center">
            {filteredSites.length > 0 ? (
              <View>
                {/* resultado count */}
                <Text style={{ fontFamily: 'MateSC-Regular', color: '#3d2c13', marginBottom: 8 }}>{filteredSites.length} sitio(s) encontrado(s)</Text>
                <View>
                  {filteredSites.map((site: SiteType) => (
                    <View key={site.id} style={{ marginBottom: 12 }}>
                      <ArchaeologicalSite
                        id={site.id!}
                        Name={site.Name}
                        Description={site.Description}
                        Location={site.Location}
                        regionId={site.regionId}
                        region={site.region}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : searchTerm.length > 0 || showNoSitesMessage ? (
              <View className="items-center justify-center py-8">
                <Text
                  className="text-[18px] text-[#A68B5B] text-center"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {showNoSitesMessage
                    ? "No hay sitios arqueológicos registrados aún."
                    : `No se encontraron sitios arqueológicos que coincidan con "${searchTerm}"`
                  }
                </Text>
                <Text
                  className="text-[14px] text-[#A68B5B] text-center mt-2"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  Intenta con otro término de búsqueda
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>

      {/* --- Bloque de Sugerencias (Uso de datos anidados) --- */}
      {showSuggestions && suggestions.length > 0 && (
        <View
          className="absolute bg-white border-2 border-[#A67C52] rounded-lg shadow-lg max-h-[200px]"
          style={{
            top: 245,
            left: 20,
            right: 20,
            zIndex: 99999,
            elevation: 50,
            position: "absolute",
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled>
            {suggestions.map((site: SiteType, index: number) => (
              <TouchableOpacity
                key={site.id || index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handleSuggestionSelect(site.Name)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {site.Name}
                </Text>
                <Text
                  className="text-[12px] text-[#A68B5B] mt-1"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {/* Muestra la ubicación y el nombre de la región */}
                  {site.Location}, {site.region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}