import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Region } from "../../../repositories/regionRepository";

// La interfaz refleja exactamente los datos que vienen del backend
interface ArchaeologicalSiteProps {
  id?: number;
  Name: string;
  Description: string;
  Location: string;
  regionId: Region['id'];
  region: Region; // Objeto de la región anidado
}

export default function ArchaeologicalSite({
 id,
 Name,
 Description,
 Location,
 region,
}: ArchaeologicalSiteProps) {
 const router = useRouter();

  const regionName = region?.name || 'Región no especificada';
  const countryName = region?.country?.name || 'País no especificado';

 const handlePress = () => {
  router.push({
   pathname: `/(tabs)/location/View_site` as any,
   params: {
    // Es importante convertir el ID a string si se pasa por `params` de router
    id: id?.toString() || '', 
    Name,
    Description,
    Location,
    regionName: regionName,
    countryName: countryName,
   },
  });
 };

 return (
  <TouchableOpacity
   className="w-full max-w-md p-4 rounded-xl mb-4 bg-[#D9C6A5] relative"
   onPress={handlePress}
   activeOpacity={0.8}
  >
   <View className="absolute top-3 right-3">
    <Feather name="chevron-right" size={20} color="#8B5E3C" />
   </View>

   <Text
    className="text-xl font-bold text-amber-900 mb-4 tracking-wide pr-8"
    style={{ fontFamily: "MateSC-Regular" }}
   >
    {Name}
   </Text>

   <View className="space-y-3">
    {/* Muestra 'location' (que en tu UI original era 'province') */}
    <InfoItem icon="map-pin" label="Ubicación" value={Location} /> 
    <InfoItem icon="globe" label="Región" value={regionName} /> 
    <InfoItem icon="flag" label="País" value={countryName} /> {/* Muestra el país */}
    
        {/* Eliminados: País (country) y Antigüedad (antiquity) */}
    
        <InfoItem
     icon="info"
     label="Descripción"
     value={Description}
     multiline
    />
   </View>
  </TouchableOpacity>
 );
}

type FeatherIconNames = "map-pin" | "globe" | "calendar" | "info" | "flag";

function InfoItem({
 icon,
 label,
 value,
 multiline = false,
}: {
 icon: FeatherIconNames;
 label: string;
 value: string;
 multiline?: boolean;
}) {
 return (
  <View className="flex-row items-start mb-3">
   <View className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-0.5 bg-[#8B5E3C]">
    <Feather name={icon} size={16} color="#FEF3C7" />
   </View>
   <View className="flex-1">
    <Text
     className="text-xs font-semibold text-amber-900 tracking-wide"
     style={{ fontFamily: "MateSC-Regular" }}
    >
     {label}
    </Text>
    <Text
     className={multiline ? "text-sm leading-5" : "text-sm"}
     style={{ fontFamily: "CrimsonText-Regular", color: "#000" }}
    >
     {value}
    </Text>
   </View>
  </View>
 );
}