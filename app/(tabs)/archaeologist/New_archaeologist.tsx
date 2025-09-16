import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function New_archaeologist() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const handleCrear = () => {
    router.back();
  };

  const handleCancelar = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F7F0E6] items-center">
      <Navbar title="Nuevo Arqueólogo" showBackArrow />
      <View className="w-full items-center">
        <Text className="text-center text-[18px] mt-3 mb-2 text-[#222] font-crimson">
          Ingrese los datos del nuevo arqueologo
        </Text>
        <View className="mb-2 w-[98%] self-center">
          <Text className="text-[16px] font-bold mb-2 text-[#3d2c13] font-mate">
            NOMBRE
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full font-crimson"
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
          />
        </View>
        <View className="mb-2 w-[98%] self-center">
          <Text className="text-[16px] font-bold mb-2 text-[#3d2c13] font-mate">
            APELLIDO
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full font-crimson"
            placeholder="Apellido"
            value={apellido}
            onChangeText={setApellido}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
          />
        </View>
        <Button
          title="Crear Arqueólogo"
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
    </View>
  );
}
