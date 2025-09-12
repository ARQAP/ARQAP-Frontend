import React, { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Button from "../../components/ui/Button";
import Card_archaeologist from "./Card_archaeologist";
import Navbar from "./Navbar";

export default function View_archaeologist() {
  const [search, setSearch] = useState("");
  const archaeologists = [
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
  ];

  const filtered = archaeologists.filter(
    (arch) =>
      arch.nombre.toLowerCase().includes(search.toLowerCase()) ||
      arch.apellido.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <Navbar title="Ver Arqueólogos" />
      <View className="p-5">
        <Button title="Registrar nuevo arqueologo" />
        <TextInput
          placeholder="Buscar por nombre o apellido"
          className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc]"
          placeholderTextColor="#8a8a8a"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView>
          {filtered.map((arch, idx) => (
            <Card_archaeologist
              key={idx}
              nombre={arch.nombre}
              apellido={arch.apellido}
              documento={arch.documento}
              numero={arch.numero}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
