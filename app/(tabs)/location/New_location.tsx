import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
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
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [showPaisSuggestions, setShowPaisSuggestions] = useState(false);
  const [regionInputPosition, setRegionInputPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [paisInputPosition, setPaisInputPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const allRegions = [
    "La Patagonia",
    "Norte Argentino",
    "Noroeste Argentino",
    "Región Cuyana",
    "Región Pampeana",
    "Litoral Argentino",
    "Norte de España",
    "Sierra Sur",
    "Patagonia Chilena",
    "Región Andina",
    "Costa Atlántica",
    "Región Amazónica",
  ];

  const allCountries = [
    "Argentina",
    "España",
    "Perú",
    "Chile",
    "Brasil",
    "Uruguay",
    "Paraguay",
    "Bolivia",
    "Colombia",
    "Ecuador",
    "Venezuela",
    "México",
  ];

  const handleRegionSearchChange = (text: string) => {
    setRegionSearch(text);
    setShowRegionSuggestions(text.length > 0);
  };

  const handleRegionSuggestionSelect = (region: string) => {
    setRegionSearch(region);
    setShowRegionSuggestions(false);
  };

  const handleClearRegionSearch = () => {
    setRegionSearch("");
    setShowRegionSuggestions(false);
  };

  const handlePaisSearchChange = (text: string) => {
    setPaisSearch(text);
    setShowPaisSuggestions(text.length > 0);
  };

  const handlePaisSuggestionSelect = (pais: string) => {
    setPaisSearch(pais);
    setShowPaisSuggestions(false);
  };

  const handleClearPaisSearch = () => {
    setPaisSearch("");
    setShowPaisSuggestions(false);
  };

  const regionSuggestions =
    regionSearch.length > 0
      ? allRegions
          .filter((region) =>
            region.toLowerCase().includes(regionSearch.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const paisSuggestions =
    paisSearch.length > 0
      ? allCountries
          .filter((country) =>
            country.toLowerCase().includes(paisSearch.toLowerCase())
          )
          .slice(0, 5)
      : [];

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
        <View className="mb-2 w-[98%] self-center relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a una región
          </Text>
          <View className="relative">
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full pr-12"
              style={{ fontFamily: "MateSC-Regular" }}
              placeholder="Buscar o seleccionar región"
              value={regionSearch}
              onChangeText={handleRegionSearchChange}
              onFocus={() => setShowRegionSuggestions(regionSearch.length > 0)}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setRegionInputPosition({ x, y, width, height });
              }}
            />
            {regionSearch.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-2 p-1"
                onPress={handleClearRegionSearch}
              >
                <Feather name="x" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="p-2 flex-row items-center justify-end"
            onPress={() => router.push("/(tabs)/location/New_Region")}
          >
            <Text
              className="text-[#A68B5B] mr-1"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Crear nueva Región
            </Text>
            <Feather name="arrow-up-right" size={16} color="#A68B5B" />
          </TouchableOpacity>
        </View>
        <View className="mb-2 w-[98%] self-center relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Asociar Pieza a un País
          </Text>
          <View className="relative">
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full pr-12"
              style={{ fontFamily: "MateSC-Regular" }}
              placeholder="Buscar o seleccionar país"
              value={paisSearch}
              onChangeText={handlePaisSearchChange}
              onFocus={() => setShowPaisSuggestions(paisSearch.length > 0)}
              placeholderTextColor="#A68B5B"
              selectionColor="#8B5E3C"
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setPaisInputPosition({ x, y, width, height });
              }}
            />
            {paisSearch.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-2 p-1"
                onPress={handleClearPaisSearch}
              >
                <Feather name="x" size={20} color="#A68B5B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="p-2 flex-row items-center justify-end"
            onPress={() => router.push("/(tabs)/location/New_Country")}
          >
            <Text
              className="text-[#A68B5B] mr-1"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Crear nuevo País
            </Text>
            <Feather name="arrow-up-right" size={16} color="#A68B5B" />
          </TouchableOpacity>
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

      {showRegionSuggestions && regionSuggestions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: regionInputPosition.y + regionInputPosition.height + 5,
            left: regionInputPosition.x,
            right: 0,
            marginHorizontal: 8,
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: "#A67C52",
            borderRadius: 8,
            maxHeight: 200,
            zIndex: 99999,
            elevation: 50,
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled>
            {regionSuggestions.map((region, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handleRegionSuggestionSelect(region)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {showPaisSuggestions && paisSuggestions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: paisInputPosition.y + paisInputPosition.height + 5,
            left: paisInputPosition.x,
            right: 0,
            marginHorizontal: 8,
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: "#A67C52",
            borderRadius: 8,
            maxHeight: 200,
            zIndex: 99999,
            elevation: 50,
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled>
            {paisSuggestions.map((pais, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handlePaisSuggestionSelect(pais)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {pais}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}
