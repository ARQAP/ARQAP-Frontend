import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Button from "../../components/ui/Button";
import Card_archaeologist from "./Card_archaeologist";
import Navbar from "./Navbar";

export default function View_archaeologist() {
  const router = useRouter();
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
      <Navbar title="Ver Arqueólogos" showBackArrow backToHome />
      <View className="p-5 flex-1">
        <Button
          title="Registrar nuevo arqueologo"
          onPress={() => router.push("/(tabs)/New_archaeologist")}
          textStyle={{ fontFamily: "MateSC-Regular", fontWeight: "bold" }}
        />
        <TextInput
          placeholder="Buscar por nombre o apellido"
          className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc]"
          value={search}
          onChangeText={setSearch}
          style={{ fontFamily: "CrimsonText-Regular", fontSize: 16 }}
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
