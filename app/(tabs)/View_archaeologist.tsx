import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import Button from "../../components/ui/Button";
import Card_archaeologist from "./Card_archaeologist";

export default function View_archaeologist() {
  const [search, setSearch] = useState("");
  const arqueologos = [
    {
      nombre: "Pedro",
      apellido: "Martínez",
      documento: "DNI",
      numero: "27.987.987",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
    {
      nombre: "Ana",
      apellido: "Gómez",
      documento: "DNI",
      numero: "25.123.456",
    },
  ];
  const filtered = arqueologos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.apellido.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <View className="bg-[#E2D1B2] py-4 px-5 flex-row items-center">
        <Text
          className="text-[22px] text-[#222] underline"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          &#8592; Ver Arqueólogos
        </Text>
      </View>

      <View className="p-5 flex-1">
        <Button title="Registrar nuevo arqueologo" />
        <TextInput
          placeholder="Buscar por nombre o apellido"
          className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc]"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-4">
            {filtered.map((arch, idx) => (
              <Card_archaeologist
                key={idx}
                nombre={arch.nombre}
                apellido={arch.apellido}
                documento={arch.documento}
                numero={arch.numero}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
