import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import Card_archaeologist from "./Card_archaeologist";

export default function View_archaeologist() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      nombre: "Carlos",
      apellido: "Rodríguez",
      documento: "DNI",
      numero: "30.456.789",
    },
    {
      nombre: "María",
      apellido: "López",
      documento: "DNI",
      numero: "28.654.321",
    },
    {
      nombre: "José",
      apellido: "García",
      documento: "DNI",
      numero: "32.789.456",
    },
    {
      nombre: "Laura",
      apellido: "Fernández",
      documento: "DNI",
      numero: "29.321.654",
    },
    {
      nombre: "Diego",
      apellido: "Santos",
      documento: "DNI",
      numero: "31.147.258",
    },
    {
      nombre: "Carmen",
      apellido: "Ruiz",
      documento: "DNI",
      numero: "26.852.963",
    },
  ];

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    setShowSuggestions(text.length > 0);
  };

  const handleSuggestionSelect = (archaeologistName: string) => {
    setSearchTerm(archaeologistName);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const suggestions =
    searchTerm.length > 0
      ? arqueologos
          .filter((arch) => {
            const fullName = `${arch.nombre} ${arch.apellido}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
          })
          .map((arch) => `${arch.nombre} ${arch.apellido}`)
          .slice(0, 5)
      : [];

  const filteredArchaeologists =
    searchTerm.length > 0
      ? arqueologos.filter((arch) => {
          const fullName = `${arch.nombre} ${arch.apellido}`.toLowerCase();
          return fullName.includes(searchTerm.toLowerCase());
        })
      : arqueologos;
  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Ver Arqueólogos" showBackArrow backToHome />
      <View className="flex-1 px-2 sm:px-5 pt-5 pb-5">
        <Button
          title="Registrar nuevo arqueólogo"
          onPress={() => router.push("/(tabs)/archaeologist/New_archaeologist")}
          className="mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />

        <View className="mb-4 relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Buscar arqueólogo
          </Text>
          <View className="relative">
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full pr-12"
              style={{
                fontFamily: "CrimsonText-Regular",
                backgroundColor: "#F7F5F2",
              }}
              placeholder="Escriba el nombre del arqueólogo..."
              value={searchTerm}
              onChangeText={handleSearchChange}
              onFocus={() => setShowSuggestions(searchTerm.length > 0)}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-3 p-1"
                onPress={handleClearSearch}
              >
                <Feather name="x" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="w-full max-w-full mx-auto self-center">
            {filteredArchaeologists.length > 0 ? (
              <View className="flex flex-col gap-4">
                {filteredArchaeologists.map((arch, idx) => (
                  <Card_archaeologist
                    key={idx}
                    nombre={arch.nombre}
                    apellido={arch.apellido}
                    documento={arch.documento}
                    numero={arch.numero}
                  />
                ))}
              </View>
            ) : searchTerm.length > 0 ? (
              <View className="items-center justify-center py-8">
                <Text
                  className="text-[18px] text-[#A68B5B] text-center"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  No se encontraron arqueólogos que coincidan con "{searchTerm}"
                </Text>
                <Text
                  className="text-[14px] text-[#A68B5B] text-center mt-2"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  Intenta con otro término de búsqueda
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View
          className="absolute bg-white border-2 border-[#A67C52] rounded-lg shadow-lg max-h-[200px]"
          style={{
            top: 245,
            left: 20,
            right: 20,
            zIndex: 99999,
            elevation: 50,
            position: "absolute",
            backgroundColor: "white",
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {suggestions.map((suggestionName, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handleSuggestionSelect(suggestionName)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {suggestionName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
