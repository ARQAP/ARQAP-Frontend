import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import { ArchaeologicalSiteCard, GenericList } from "../../../components/ui";
// Importar el hook de lectura de la API y el tipo
import { useAllArchaeologicalSites, useDeleteArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
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
    error,
    refetch,
    isFetching
  } = useAllArchaeologicalSites();

  const deleteMutation = useDeleteArchaeologicalSite();

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

  // La lógica de filtro usa el campo 'Name' del tipo SiteType
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

  // Handlers para las acciones de las tarjetas
  const handleEdit = (site: SiteType) => {
    router.push({
      pathname: "/(tabs)/location/Edit_site" as any,
      params: { id: String(site.id) },
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      Alert.alert("Éxito", "Sitio arqueológico eliminado correctamente.");
    } catch (error) {
      const errorMessage = (error as Error).message || "Error al eliminar el sitio.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleViewDetails = (site: SiteType) => {
    router.push({
      pathname: `/(tabs)/location/View_site` as any,
      params: {
        id: site.id?.toString() || '', 
        Name: site.Name,
        Description: site.Description,
        Location: site.Location,
        regionName: site.region?.name || 'Región no especificada',
        countryName: site.region?.country?.name || 'País no especificado',
      },
    });
  };

  const renderSiteCard = (site: SiteType) => (
    <ArchaeologicalSiteCard
      site={site}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );
  
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

  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />
      
      {/* Contenedor responsive - diferentes layouts para web y móvil */}
      {Platform.OS === 'web' ? (
        // Layout para web
        <View style={{ 
          flex: 1,
          paddingHorizontal: 20,
        }}>
          <View style={{ 
            width: '100%', 
            maxWidth: 900,
            alignSelf: 'center',
          }}>
            <View className="pt-5">
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

              <Text
                className="text-[#8B5E3C] text-base mb-2"
                style={{ fontFamily: "MateSC-Regular" }}
              >
                {filteredSites.length} Sitios arqueológicos encontrados
              </Text>
            </View>

            {/* Lista de sitios usando el componente estandarizado */}
            <View className="flex-1">
              <GenericList
                data={filteredSites}
                renderItem={renderSiteCard}
                keyExtractor={(item) => item.id?.toString() || ''}
                isLoading={false} // Ya manejamos loading arriba
                isRefreshing={isFetching}
                onRefresh={refetch}
                emptyStateMessage="No hay sitios arqueológicos registrados"
                error={null} // Ya manejamos errores arriba
                customStyles={{
                  container: { backgroundColor: 'transparent', paddingTop: 0 }
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        // Layout para móvil - estructura simple
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ marginTop: 20 }}>
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

            <Text
              className="text-[#8B5E3C] text-base mb-2"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              {filteredSites.length} Sitios arqueológicos encontrados
            </Text>
          </View>

          {/* Lista de sitios usando el componente estandarizado */}
          <View style={{ flex: 1 }}>
            <GenericList
              data={filteredSites}
              renderItem={renderSiteCard}
              keyExtractor={(item) => item.id?.toString() || ''}
              isLoading={false} // Ya manejamos loading arriba
              isRefreshing={isFetching}
              onRefresh={refetch}
              emptyStateMessage="No hay sitios arqueológicos registrados"
              error={null} // Ya manejamos errores arriba
              customStyles={{
                container: { backgroundColor: 'transparent', paddingTop: 0 }
              }}
            />
          </View>
        </View>
      )}

      {/* --- Bloque de Sugerencias flotantes --- */}
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