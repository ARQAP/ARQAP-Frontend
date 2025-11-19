import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Platform, Text, TextInput, View, Alert } from "react-native";
import Button from "../../../components/ui/Button";
import { useArchaeologists, useDeleteArchaeologist } from "../../../hooks/useArchaeologist";
import { ArchaeologistCard, GenericList } from "../../../components/ui";
import { Archaeologist } from "../../../repositories/archaeologistRespository";
import Navbar from "../Navbar";

export default function View_archaeologist() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, status, error, isFetching, refetch } = useArchaeologists();
  const deleteMutation = useDeleteArchaeologist();

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return data || [];
    return (data || []).filter(
      (a) =>
        a.firstname.toLowerCase().includes(term) ||
        a.lastname.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleEdit = (archaeologist: Archaeologist) => {
    router.push({
      pathname: "/(tabs)/archaeologist/Edit_archaeologist",
      params: { 
        id: String(archaeologist.id), 
        nombre: archaeologist.firstname, 
        apellido: archaeologist.lastname 
      },
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      Alert.alert("Éxito", "Arqueólogo eliminado correctamente.");
    } catch (error) {
      const errorMessage = (error as Error).message || "Error al eliminar el arqueólogo.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleViewDetails = (archaeologist: Archaeologist) => {
    Alert.alert("Detalles", `Ver detalles de: ${archaeologist.firstname} ${archaeologist.lastname}`);
  };

  const renderArchaeologistCard = (archaeologist: Archaeologist) => (
    <ArchaeologistCard
      archaeologist={archaeologist}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );

  return (
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <Navbar title="Ver Arqueólogos" showBackArrow backToHome />
      
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
            <View className="mt-5">
              <Button
                title="Registrar nuevo arqueólogo"
                onPress={() => router.push("/(tabs)/archaeologist/New_archaeologist")}
                textStyle={{ fontFamily: "MateSC-Regular", fontWeight: "bold" }}
              />

              <TextInput
                placeholder="Buscar por nombre o apellido"
                className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc] mt-4"
                value={search}
                onChangeText={setSearch}
                style={{ fontFamily: "CrimsonText-Regular", fontSize: 16 }}
              />

              <Text
                className="text-[#8B5E3C] text-base mb-2"
                style={{ fontFamily: "MateSC-Regular" }}
              >
                {filtered.length} Arqueólogos encontrados
              </Text>
            </View>

            <View className="flex-1">
              <GenericList
                data={filtered}
                renderItem={renderArchaeologistCard}
                keyExtractor={(item) => item.id?.toString() || `${item.firstname}-${item.lastname}`}
                isLoading={status === "pending"}
                isRefreshing={isFetching}
                onRefresh={refetch}
                emptyStateMessage="No hay arqueólogos registrados"
                error={status === "error" ? (error as Error)?.message : null}
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
              title="Registrar nuevo arqueólogo"
              onPress={() => router.push("/(tabs)/archaeologist/New_archaeologist")}
              textStyle={{ fontFamily: "MateSC-Regular", fontWeight: "bold" }}
            />

            <TextInput
              placeholder="Buscar por nombre o apellido"
              className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc] mt-4"
              value={search}
              onChangeText={setSearch}
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
              keyExtractor={(item) => item.id?.toString() || `${item.firstname}-${item.lastname}`}
              isLoading={status === "pending"}
              isRefreshing={isFetching}
              onRefresh={refetch}
              emptyStateMessage="No hay arqueólogos registrados"
              error={status === "error" ? (error as Error)?.message : null}
              customStyles={{
                container: { backgroundColor: 'transparent', paddingTop: 0 }
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
