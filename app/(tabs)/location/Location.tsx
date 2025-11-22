import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ArchaeologicalSiteCard, GenericList } from "../../../components/ui";
import Button from "../../../components/ui/Button";
import SimplePickerModal, {
  type SimplePickerItem,
} from "../../../components/ui/SimpleModal";
import Navbar from "../Navbar";
import { useAllArchaeologicalSites, useDeleteArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
import { ArchaeologicalSite as SiteType } from "../../../repositories/archaeologicalsiteRepository";


export default function Location() {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState<number | string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const { 
    data: allSites = [], 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useAllArchaeologicalSites();

  const deleteMutation = useDeleteArchaeologicalSite();

  const siteItems = useMemo<SimplePickerItem<SiteType>[]>(() => {
    return allSites.map((site) => ({
      value: site.id || `${site.Name}`,
      label: `${site.Name} - ${site.Location}`,
      raw: site,
    }));
  }, [allSites]);

  const filteredSites = useMemo(() => {
    if (selectedSiteId) {
      return allSites.filter(
        (site) =>
          site.id === selectedSiteId ||
          `${site.Name}` === selectedSiteId
      );
    }
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      return allSites.filter((site) =>
        site.Name.toLowerCase().includes(searchLower)
      );
    }
    return allSites;
  }, [allSites, selectedSiteId, searchText]);

 const handleEdit = (site: SiteType) => {
    router.push({
      pathname: "/(tabs)/location/Edit_site" as any,
      params: { 
        id: String(site.id),
        name: site.Name,
        location: site.Location,
        description: site.Description,
        regionName: site.region?.name || '',
        countryName: site.region?.country?.name || '',
      },
    });
  };

const handleDelete = (id: number) => {
    if (!id) {
      Alert.alert("Error", "ID de sitio no válido.");
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro que desea eliminar este sitio arqueológico? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
              
              await refetch();
              
              Alert.alert("Éxito", "Sitio arqueológico eliminado correctamente.");
            } catch (error: any) {
              console.error("Error al eliminar:", error);
              const errorMessage = error?.message || error?.response?.data?.message || "Error al eliminar el sitio arqueológico.";
              Alert.alert("Error", errorMessage);
            }
          }
        }
      ]
    );
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

  const clearSearch = () => {
    setSelectedSiteId(null);
    setSearchText("");
  };

  const searchDisplayText = useMemo(() => {
    if (selectedSiteId) {
      return siteItems.find((i) => i.value === selectedSiteId)?.label;
    }
    if (searchText) {
      return `Buscando: "${searchText}"`;
    }
    return null;
  }, [selectedSiteId, searchText, siteItems]);

  const renderSiteCard = (site: SiteType) => (
    <ArchaeologicalSiteCard
      site={site}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3E9DD",
        }}
      >
        <ActivityIndicator size="large" color="#8B5E3C" />
        <Text style={{ marginTop: 10, color: "#8B5E3C", fontFamily: "CrimsonText-Regular" }}>
          Cargando sitios arqueológicos...
        </Text>
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
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />

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
            maxWidth: 1100,
            alignSelf: "center",
          }}
        >
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
              Gestión de Sitios Arqueológicos
            </Text>
            <Text
              style={{
                fontFamily: "CrimsonText-Regular",
                fontSize: 16,
                color: "#A0785D",
                marginBottom: 24,
              }}
            >
              Administra y consulta el registro de sitios arqueológicos del sistema
            </Text>

            <Button
              title="+ Registrar nuevo sitio arqueológico"
              onPress={() => router.push("/(tabs)/location/New_location")}
              textStyle={{
                fontFamily: "MateSC-Regular",
                fontWeight: "bold",
                fontSize: 15,
              }}
            />
          </View>

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
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                fontSize: 18,
                color: "#8B5E3C",
                marginBottom: 16,
                fontWeight: "600",
              }}
            >
              Búsqueda
            </Text>

            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{
                backgroundColor: "#F7F5F2",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#E5D4C1",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="search"
                size={18}
                color="#8B5E3C"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: searchDisplayText ? "#8B5E3C" : "#B8967D",
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {searchDisplayText || "Buscar sitio arqueológico..."}
              </Text>
            </TouchableOpacity>

            {(selectedSiteId || searchText) && (
              <TouchableOpacity
                onPress={clearSearch}
                style={{
                  marginTop: 12,
                  alignSelf: "flex-start",
                  backgroundColor: "#E5D4C1",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 14,
                    color: "#8B5E3C",
                    fontWeight: "600",
                  }}
                >
                  ✕ Limpiar búsqueda
                </Text>
              </TouchableOpacity>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "#E5D4C1",
              }}
            >
              <View
                style={{
                  backgroundColor: "#8B5E3C",
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 17,
                  color: "#8B5E3C",
                  fontWeight: "600",
                }}
              >
                {filteredSites.length}{" "}
                {filteredSites.length === 1
                  ? "Sitio arqueológico encontrado"
                  : "Sitios arqueológicos encontrados"}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              shadowColor: "#8B5E3C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            {filteredSites.length === 0 ? (
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 15,
                  color: "#8B5E3C",
                }}
              >
                No hay sitios arqueológicos registrados.
              </Text>
            ) : (
              <View style={{ flex: 1 }}>
                <GenericList
                  data={filteredSites}
                  renderItem={renderSiteCard}
                  keyExtractor={(item) => item.id?.toString() || ''}
                  isLoading={false}
                  isRefreshing={isFetching}
                  onRefresh={refetch}
                  emptyStateMessage="No hay sitios arqueológicos registrados"
                  error={null}
                  customStyles={{
                    container: { backgroundColor: 'transparent', paddingTop: 0 }
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <SimplePickerModal
        visible={showPicker}
        title="Seleccionar Sitio Arqueológico"
        items={siteItems}
        selectedValue={selectedSiteId}
        onSelect={(value) => {
          setSelectedSiteId(value);
          setSearchText("");
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
        onSearchTextChange={(text) => {
          setSearchText(text);
          setSelectedSiteId(null);
        }}
      />
    </View>
  );
}