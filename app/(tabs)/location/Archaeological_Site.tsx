import { Ionicons } from "@expo/vector-icons";
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
   onPress={handlePress}
   activeOpacity={0.85}
   style={{ width: '100%', maxWidth: 720, backgroundColor: '#FFF6ED', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
   accessibilityRole="button"
  >
   <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
     <View style={{ flex: 1, paddingRight: 12 }}>
       <Text style={{ fontFamily: 'MateSC-Regular', fontSize: 18, color: '#3d2c13', fontWeight: '700' }} numberOfLines={1} ellipsizeMode="tail">{Name}</Text>

       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
         <View style={{ backgroundColor: '#EADFCB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
           <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13', fontSize: 12 }}>{regionName}</Text>
         </View>
         <View style={{ backgroundColor: '#F3E9DD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
           <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13', fontSize: 12 }}>{countryName}</Text>
         </View>
       </View>
     </View>

     <Ionicons name="chevron-forward-outline" size={20} color="#8B5E3C" />
   </View>

   <View style={{ borderTopWidth: 1, borderTopColor: '#F1E8DA', paddingTop: 12 }}>
     <InfoItem icon="location-outline" label="Ubicación" value={Location} />
     <InfoItem icon="information-circle-outline" label="Descripción" value={Description} multiline />
   </View>
  </TouchableOpacity>
 );
}

type IoniconsIconNames = "location-outline" | "globe-outline" | "calendar-outline" | "information-circle-outline" | "flag-outline";

function InfoItem({
 icon,
 label,
 value,
 multiline = false,
}: {
 icon: IoniconsIconNames;
 label: string;
 value: string;
 multiline?: boolean;
}) {
 return (
  <View className="flex-row items-start mb-3">
   <View className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-0.5 bg-[#8B5E3C]">
    <Ionicons name={icon} size={16} color="#FEF3C7" />
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