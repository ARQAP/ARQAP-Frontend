import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Button from "../../components/ui/Button";
import { useUpdateArchaeologist } from "../../hooks/useArchaeologist";
import Navbar from "./Navbar";

export default function Edit_archaeologist() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const [nombre, setNombre] = useState(
    Array.isArray(params.nombre) ? params.nombre[0] : (params.nombre as string) || ""
  );
  const [apellido, setApellido] = useState(
    Array.isArray(params.apellido) ? params.apellido[0] : (params.apellido as string) || ""
  );

  const updateMut = useUpdateArchaeologist();

  const handleGuardar = () => {
    if (!id || !nombre.trim() || !apellido.trim()) return;
    updateMut.mutate(
      { id, payload: { firstname: nombre.trim(), lastname: apellido.trim() } },
      { onSuccess: () => router.back() }
    );
  };

  const handleCancelar = () => router.back();

  return (
    <View className="flex-1 bg-[#F7F0E6] pt-0 items-center">
      <Navbar title="Editar Arqueólogo" showBackArrow />
      <View className="w-full items-center">
        <Text className="text-center text-[18px] mt-3 mb-2 text-[#222]" style={{ fontFamily: "CrimsonText-Regular" }}>
          Edita los datos del arqueólogo
        </Text>

        <View className="mb-2 w-[98%] self-center">
          <Text className="text-[16px] font-bold mb-2 text-[#3d2c13]" style={{ fontFamily: "MateSC-Regular" }}>
            NOMBRE
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            style={{ fontFamily: "CrimsonText-Regular" }}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
          />
        </View>

        <View className="mb-2 w-[98%] self-center">
          <Text className="text-[16px] font-bold mb-2 text-[#3d2c13]" style={{ fontFamily: "MateSC-Regular" }}>
            APELLIDO
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            style={{ fontFamily: "CrimsonText-Regular" }}
            placeholder="Apellido"
            value={apellido}
            onChangeText={setApellido}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
          />
        </View>

        <Button
          title={updateMut.isPending ? "Guardando..." : "Guardar cambios"}
          onPress={handleGuardar}
          style={{ width: "98%", alignSelf: "center", marginBottom: 16 }}
          textStyle={{ fontFamily: "MateSC-Regular", fontSize: 16, fontWeight: "bold" }}
        />
        <Button
          title="Cancelar"
          onPress={handleCancelar}
          style={{ width: "98%", alignSelf: "center", backgroundColor: "#D9C6A5", marginBottom: 0 }}
          textStyle={{ fontFamily: "MateSC-Regular", fontSize: 16, fontWeight: "bold", color: "#fff" }}
        />
      </View>
    </View>
  );
}
