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
import ArchaeologicalSite from "./Archaeological_Site";

export default function Location() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSites = [
    {
      name: "Cueva De Las Manos",
      province: "Provincia de Santa Cruz",
      region: "La Patagonia",
      country: "Argentina",
      antiquity: "Más de 9,000 años",
      description:
        "Sitio arqueológico con pinturas rupestres, famoso por siluetas de manos y escenas de caza",
    },
    {
      name: "Cueva Pucará de Tilcara",
      province: "Provincia de Jujuy",
      region: "Norte Argentino",
      country: "Argentina",
      antiquity: "Más de 1,000 años",
      description:
        "Fortaleza precolombina construida por los pueblos originarios",
    },
    {
      name: "Cueva de Altamira",
      province: "Provincia de Cantabria",
      region: "Norte de España",
      country: "España",
      antiquity: "Más de 36,000 años",
      description: "Famous por sus pinturas rupestres paleolíticas",
    },
    {
      name: "Macchu Picchu",
      province: "Región de Cusco",
      region: "Sierra Sur",
      country: "Perú",
      antiquity: "Más de 500 años",
      description: "Ciudadela inca en los Andes peruanos",
    },
    {
      name: "Quilmes",
      province: "Provincia de Tucumán",
      region: "Noroeste Argentino",
      country: "Argentina",
      antiquity: "Más de 1,400 años",
      description: "Ruinas de la ciudad fortificada más grande de Argentina",
    },
    {
      name: "Cueva del Milodón",
      province: "Región de Magallanes",
      region: "Patagonia Chilena",
      country: "Chile",
      antiquity: "Más de 10,000 años",
      description: "Sitio paleontológico con restos de megafauna extinta",
    },
  ];

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    setShowSuggestions(text.length > 0);
  };

  const handleSuggestionSelect = (siteName: string) => {
    setSearchTerm(siteName);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const suggestions =
    searchTerm.length > 0
      ? allSites
          .filter((site) =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const filteredSites =
    searchTerm.length > 0
      ? allSites.filter((site) =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allSites;

  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Sitios Arqueológicos" showBackArrow backToHome />
      <View className="flex-1 px-2 sm:px-5 pt-5 pb-5">
        <Button
          title="Registrar nuevo sitio arqueológico"
          onPress={() => router.push("/(tabs)/location/New_location")}
          className="mb-4 bg-[#6B705C] rounded-lg py-3 items-center"
          textClassName="text-[16px] font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />

        <View className="mb-4 relative">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Buscar sitio arqueológico
          </Text>
          <View className="relative">
            <TextInput
              className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full pr-12"
              style={{
                fontFamily: "CrimsonText-Regular",
              }}
              placeholder="Escriba el nombre del sitio..."
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

        <ScrollView 
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        >
          <View className="w-full max-w-full mx-auto self-center">
            {filteredSites.length > 0 ? (
              <View className="flex-row flex-wrap justify-center w-full">
                {filteredSites.map((site, index) => (
                  <React.Fragment key={index}>
                    <ArchaeologicalSite
                      name={site.name}
                      province={site.province}
                      region={site.region}
                      country={site.country}
                      antiquity={site.antiquity}
                      description={site.description}
                    />
                    {index < filteredSites.length - 1 && (
                      <View className="w-12" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            ) : searchTerm.length > 0 ? (
              <View className="items-center justify-center py-8">
                <Text
                  className="text-[18px] text-[#A68B5B] text-center"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  No se encontraron sitios arqueológicos que coincidan con "
                  {searchTerm}"
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
            boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ScrollView nestedScrollEnabled>
            {suggestions.map((site, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 border-b border-[#E2D1B2]"
                onPress={() => handleSuggestionSelect(site.name)}
              >
                <Text
                  className="text-[16px] text-[#3d2c13]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {site.name}
                </Text>
                <Text
                  className="text-[12px] text-[#A68B5B] mt-1"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  {site.province}, {site.country}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
