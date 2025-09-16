import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function New_location() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [paisSearch, setPaisSearch] = useState("");

  const handleCrear = () => {};

  const handleCancelar = () => {};

  return (
    <ScrollView
      className="flex-1 bg-[#F3E9DD]"
      contentContainerStyle={{ alignItems: "center" }}
    >
      <Navbar
        title="Nuevo Sitio Arqueológico"
        showBackArrow
        backToHome={false}
      />
      <View className="w-[90%] max-w-[500px] items-center self-center">
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
              // @ts-ignore
              placeholderStyle={{ fontFamily: "CrimsonText-Regular" }}
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
        <View className="mb-2 w-[98%] self-center">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a una región
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            style={{ fontFamily: "MateSC-Regular" }}
            placeholder="Buscar o seleccionar región"
            value={regionSearch}
            onChangeText={setRegionSearch}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
          />
          <Text
            className="p-2 text-[#A68B5B]"
            style={{ fontFamily: "MateSC-Regular", textAlign: "right" }}
            onPress={() => router.push("/(tabs)/location/New_Region")}
          >
            Crear nueva Región 🡥
          </Text>
        </View>
        <View className="mb-2 w-[98%] self-center">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a un País
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            style={{ fontFamily: "MateSC-Regular" }}
            placeholder="Buscar o seleccionar país"
            value={paisSearch}
            onChangeText={setPaisSearch}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
          />
          <Text
            className="p-2 text-[#A68B5B]"
            style={{ fontFamily: "MateSC-Regular", textAlign: "right" }}
            onPress={() => router.push("/(tabs)/location/New_Country")}
          >
            Crear nuevo País 🡥
          </Text>
        </View>
        <Button
          title="Crear Sitio Arqueológico"
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
    </ScrollView>
  );
}
