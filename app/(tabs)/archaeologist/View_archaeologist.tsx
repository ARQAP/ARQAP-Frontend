"use client";

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Platform,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Button from "../../../components/ui/Button";
import {
  useArchaeologists,
  useDeleteArchaeologist,
} from "../../../hooks/useArchaeologist";
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
      refetch();
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

  const isLoading = status === "pending" || isFetching;

  return (
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <Navbar title="Ver Arqueólogos" showBackArrow backToHome />

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

          {/* Búsqueda */}
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
  <Feather
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
    {searchDisplayText || "Buscar arqueólogo..."}
  </Text>
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

          {/* Lista compacta (misma en web y mobile) */}
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
            {status === "error" ? (
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 15,
                  color: "#B00020",
                }}
              >
                {(error as Error)?.message ||
                  "Error al cargar los arqueólogos."}
              </Text>
            ) : isLoading ? (
              <View
                style={{
                  paddingVertical: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator />
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: "CrimsonText-Regular",
                    color: "#8B5E3C",
                  }}
                >
                  Cargando arqueólogos...
                </Text>
              </View>
            ) : filtered.length === 0 ? (
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 15,
                  color: "#8B5E3C",
                }}
              >
                No hay arqueólogos registrados.
              </Text>
            ) : (
              <View>
                {/* Encabezado tipo tabla */}
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F0E0CF",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      flex: 2,
                      fontFamily: "MateSC-Regular",
                      fontSize: 15,
                      color: "#8B5E3C",
                      fontWeight: "600",
                    }}
                  >
                    Nombre
                  </Text>
                  <Text
                    style={{
                      flex: 2,
                      fontFamily: "MateSC-Regular",
                      fontSize: 15,
                      color: "#8B5E3C",
                      fontWeight: "600",
                    }}
                  >
                    Apellido
                  </Text>
                  <Text
                    style={{
                      width: 150,
                      fontFamily: "MateSC-Regular",
                      fontSize: 15,
                      color: "#8B5E3C",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Acciones
                  </Text>
                </View>

                {/* Filas */}
{filtered.map((archaeologist) => (
  <View
    key={
      archaeologist.id?.toString() ??
      `${archaeologist.firstname}-${archaeologist.lastname}`
    }
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#F5E8D7",
    }}
  >
    <Text
      style={{
        flex: 2,
        flexShrink: 1,          // ⬅️ para que no rompa el layout
        paddingRight: 8,
        fontFamily: "CrimsonText-Regular",
        fontSize: 15,
        color: "#4A3725",
      }}
      numberOfLines={1}         // ⬅️ solo una línea
      ellipsizeMode="tail"      // ⬅️ corta con “...”
    >
      {archaeologist.firstname}
    </Text>

    <Text
      style={{
        flex: 2,
        flexShrink: 1,
        paddingRight: 8,
        fontFamily: "CrimsonText-Regular",
        fontSize: 15,
        color: "#4A3725",
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {archaeologist.lastname}
    </Text>

    <View
      style={{
        width: 150,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <TouchableOpacity
        onPress={() => handleEdit(archaeologist)}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: "#F3E9DD",
          marginRight: 8,
        }}
      >
        <Text
          style={{
            fontFamily: "CrimsonText-Regular",
            fontSize: 13,
            color: "#8B5E3C",
          }}
        >
          Editar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          archaeologist.id && handleDelete(archaeologist.id)
        }
        disabled={deleteMutation.isPending}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: "#EBD0C4",
          opacity: deleteMutation.isPending ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            fontFamily: "CrimsonText-Regular",
            fontSize: 13,
            color: "#7B2C27",
          }}
        >
          Eliminar
        </Text>
      </TouchableOpacity>
    </View>
  </View>
))}

              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
