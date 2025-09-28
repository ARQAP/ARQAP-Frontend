import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function EditSite() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState(
    Array.isArray(params.name) ? params.name[0] : params.name || ""
  );
  const [province, setProvince] = useState(
    Array.isArray(params.province) ? params.province[0] : params.province || ""
  );
  const [region, setRegion] = useState(
    Array.isArray(params.region) ? params.region[0] : params.region || ""
  );
  const [country, setCountry] = useState(
    Array.isArray(params.country) ? params.country[0] : params.country || ""
  );
  const [antiquity, setAntiquity] = useState(
    Array.isArray(params.antiquity)
      ? params.antiquity[0]
      : params.antiquity || ""
  );
  const [description, setDescription] = useState(
    Array.isArray(params.description)
      ? params.description[0]
      : params.description || ""
  );

  const handleSave = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Editar Sitio Arqueológico" showBackArrow />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mb-6">
          <Text
            className="text-2xl font-bold text-[#3d2c13] text-center mb-2"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            {name}
          </Text>
          <View className="h-1 bg-[#A67C52] mx-auto w-32 rounded-full" />
        </View>

        <View className="space-y-5">
          <View className="mb-4">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              NOMBRE DEL SITIO
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
              }}
              placeholder="Nombre del sitio arqueológico"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              PROVINCIA
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
              }}
              placeholder="Provincia donde se encuentra"
              value={province}
              onChangeText={setProvince}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              REGIÓN
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
              }}
              placeholder="Región geográfica"
              value={region}
              onChangeText={setRegion}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              PAÍS
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
              }}
              placeholder="País donde se ubica"
              value={country}
              onChangeText={setCountry}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              ANTIGÜEDAD
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
              }}
              placeholder="Ej: Más de 9,000 años"
              value={antiquity}
              onChangeText={setAntiquity}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
          </View>

          <View className="mb-16">
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              DESCRIPCIÓN
            </Text>
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
                minHeight: 120,
                textAlignVertical: "top",
              }}
              placeholder="Descripción detallada del sitio arqueológico..."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
              multiline={true}
              numberOfLines={5}
            />
          </View>
        </View>

        <View className="space-y-4 mt-8">
          <Button
            title="Guardar Cambios"
            onPress={handleSave}
            className="bg-[#6B705C] rounded-lg py-4 items-center"
            textClassName="text-[16px] font-bold text-white"
            textStyle={{ fontFamily: "MateSC-Regular" }}
          />

          <Button
            title="Cancelar"
            onPress={handleCancel}
            className="bg-[#D9C6A5] rounded-lg py-4 items-center"
            textClassName="text-[16px] font-bold text-[#3d2c13]"
            textStyle={{ fontFamily: "MateSC-Regular" }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
