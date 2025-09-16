import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function New_Conutry() {
  const [regionName, setRegionName] = useState("");

  const handleCrear = () => {};
  const handleCancelar = () => {};

  return (
    <View className="flex-1 bg-[#F7F0E6] items-center px-0">
      <View className="w-full">
        <Navbar
          title="Alta de País"
          showBackArrow
          backToHome={false}
          redirectTo="/(tabs)/location/New_location"
        />
      </View>
      <View className="w-full max-w-[500px] items-center self-center px-4">
        <Text
          className="text-center text-lg mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingrese los datos del nuevo país
        </Text>
        <View className="mb-2 w-full">
          <Text
            className="text-2xl font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Nombre
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full font-crimson placeholder:text-[#A68B5B] selection:bg-[#8B5E3C]"
            placeholder="Ingrese el nombre"
            value={regionName}
            onChangeText={setRegionName}
          />
        </View>
        <Button
          title="Crear País"
          onPress={handleCrear}
          className="w-full self-center mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-base font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
        <Button
          title="Cancelar"
          onPress={handleCancelar}
          className="w-full self-center bg-[#D9C6A5] rounded-lg py-3 items-center"
          textClassName="text-base text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
      </View>
    </View>
  );
}
