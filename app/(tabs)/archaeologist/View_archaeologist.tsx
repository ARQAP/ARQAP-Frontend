"use client";

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Button from "../../../components/ui/Button";
import {
  useArchaeologists,
  useDeleteArchaeologist,
} from "../../../hooks/useArchaeologist";
import { ArchaeologistCard, GenericList } from "../../../components/ui";
import type { Archaeologist } from "../../../repositories/archaeologistRespository";
import Navbar from "../Navbar";
import SimplePickerModal, {
  type SimplePickerItem,
} from "../../../components/ui/SimpleModal";

export default function View_archaeologist() {
  const router = useRouter();
  const [selectedArchaeologistId, setSelectedArchaeologistId] = useState<
    number | string | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const { data, status, error, isFetching, refetch } = useArchaeologists();
  const deleteMutation = useDeleteArchaeologist();

  const archaeologistItems = useMemo<SimplePickerItem<Archaeologist>[]>(() => {
    return (data || []).map((a) => ({
      value: a.id || `${a.firstname}-${a.lastname}`,
      label: `${a.firstname} ${a.lastname}`,
      raw: a,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    if (selectedArchaeologistId) {
      return (data || []).filter(
        (a) =>
          a.id === selectedArchaeologistId ||
          `${a.firstname}-${a.lastname}` === selectedArchaeologistId
      );
    }
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      return (data || []).filter((a) =>
        `${a.firstname} ${a.lastname}`.toLowerCase().includes(searchLower)
      );
    }
    return data || [];
  }, [data, selectedArchaeologistId, searchText]);

  const handleEdit = (archaeologist: Archaeologist) => {
    router.push({
      pathname: "/(tabs)/archaeologist/Edit_archaeologist",
      params: {
        id: String(archaeologist.id),
        nombre: archaeologist.firstname,
        apellido: archaeologist.lastname,
      },
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      Alert.alert("Éxito", "Arqueólogo eliminado correctamente.");
    } catch (error) {
      const errorMessage =
        (error as Error).message || "Error al eliminar el arqueólogo.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleViewDetails = (archaeologist: Archaeologist) => {
    Alert.alert(
      "Detalles",
      `Ver detalles de: ${archaeologist.firstname} ${archaeologist.lastname}`
    );
  };

  const renderArchaeologistCard = (archaeologist: Archaeologist) => (
    <ArchaeologistCard
      archaeologist={archaeologist}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );

  const clearSearch = () => {
    setSelectedArchaeologistId(null);
    setSearchText("");
  };

  const searchDisplayText = useMemo(() => {
    if (selectedArchaeologistId) {
      return archaeologistItems.find((i) => i.value === selectedArchaeologistId)
        ?.label;
    }
    if (searchText) {
      return `Buscando: "${searchText}"`;
    }
    return null;
  }, [selectedArchaeologistId, searchText, archaeologistItems]);

  return (
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <Navbar title="Ver Arqueólogos" showBackArrow backToHome />

      {Platform.OS === "web" ? (
        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingHorizontal: 32,
            paddingTop: 40,
            paddingBottom: 32,
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
                Gestión de Arqueólogos
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                  marginBottom: 24,
                }}
              >
                Administra y consulta el registro de arqueólogos del sistema
              </Text>

              <Button
                title="+ Registrar nuevo arqueólogo"
                onPress={() =>
                  router.push("/(tabs)/archaeologist/New_archaeologist")
                }
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
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E5D4C1",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: searchDisplayText ? "#8B5E3C" : "#B8967D",
                  }}
                >
                  {searchDisplayText || "Buscar arqueólogo..."}
                </Text>
                <Text style={{ color: "#8B5E3C", fontSize: 18 }}>▼</Text>
              </TouchableOpacity>

              {(selectedArchaeologistId || searchText) && (
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
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "Arqueólogo encontrado"
                    : "Arqueólogos encontrados"}
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
              <GenericList
                data={filtered}
                renderItem={renderArchaeologistCard}
                keyExtractor={(item) =>
                  item.id?.toString() || `${item.firstname}-${item.lastname}`
                }
                isLoading={status === "pending"}
                isRefreshing={isFetching}
                onRefresh={refetch}
                emptyStateMessage="No hay arqueólogos registrados"
                error={status === "error" ? (error as Error)?.message : null}
                customStyles={{
                  container: { backgroundColor: "transparent", paddingTop: 0 },
                }}
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ marginTop: 20 }}>
            <Button
              title="Registrar nuevo arqueólogo"
              onPress={() =>
                router.push("/(tabs)/archaeologist/New_archaeologist")
              }
              textStyle={{ fontFamily: "MateSC-Regular", fontWeight: "bold" }}
            />

            <TextInput
              placeholder="Buscar por nombre o apellido"
              className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc] mt-4"
              value={searchText}
              onChangeText={setSearchText}
              style={{ fontFamily: "CrimsonText-Regular", fontSize: 16 }}
            />

            <Text
              className="text-[#8B5E3C] text-base mb-2"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              {filtered.length} Arqueólogos encontrados
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <GenericList
              data={filtered}
              renderItem={renderArchaeologistCard}
              keyExtractor={(item) =>
                item.id?.toString() || `${item.firstname}-${item.lastname}`
              }
              isLoading={status === "pending"}
              isRefreshing={isFetching}
              onRefresh={refetch}
              emptyStateMessage="No hay arqueólogos registrados"
              error={status === "error" ? (error as Error)?.message : null}
              customStyles={{
                container: { backgroundColor: "transparent", paddingTop: 0 },
              }}
            />
          </View>
        </View>
      )}

      <SimplePickerModal
        visible={showPicker}
        title="Seleccionar Arqueólogo"
        items={archaeologistItems}
        selectedValue={selectedArchaeologistId}
        onSelect={(value) => {
          setSelectedArchaeologistId(value);
          setSearchText("");
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
        onSearchTextChange={(text) => {
          setSearchText(text);
          setSelectedArchaeologistId(null);
        }}
      />
    </View>
  );
}
