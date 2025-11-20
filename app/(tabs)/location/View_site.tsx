import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Navbar from "../Navbar";

export default function ViewSite() {
 const params = useLocalSearchParams();
 const router = useRouter();
 
 // --- RECUPERAR PARÁMETROS ---
 const id = Array.isArray(params.id) ? params.id[0] : params.id || "";
 const name = Array.isArray(params.Name) ? params.Name[0] : params.Name || "";
 const location = Array.isArray(params.Location) ? params.Location[0] : params.Location || "";
 const regionName = Array.isArray(params.regionName) ? params.regionName[0] : params.regionName || "";
 const countryName = Array.isArray(params.countryName) ? params.countryName[0] : params.countryName || "";
 const description = Array.isArray(params.Description) ? params.Description[0] : params.Description || "";

 // Convertir ID a número
 const siteId = id ? parseInt(id, 10) : undefined;

// Control de error de ID
if (siteId === undefined) {
 return (
  <View className="flex-1 bg-[#F3E9DD] items-center justify-center">
   <Text style={{ fontFamily: "MateSC-Regular", color: 'red' }}>Error: ID de sitio no válido.</Text>
  </View>
 );
}

return (
 <View className="flex-1 bg-[#F3E9DD]">
 <Navbar title="Sitio Arqueológico" showBackArrow />

 <ScrollView
  className="flex-1 px-5 pt-5"
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 20 }}
 >
  {/* --- Título centrado --- */}
  <View style={{ marginBottom: 24, alignItems: 'center' }}>
    <Text style={{ fontFamily: 'MateSC-Regular', fontSize: 32, color: '#3d2c13', fontWeight: '700', textAlign: 'center', lineHeight: 38 }} numberOfLines={2} ellipsizeMode="tail">{name}</Text>
    <View style={{ height: 8 }} />
    <View style={{ width: 120, height: 5, backgroundColor: '#A67C52', borderRadius: 6, alignSelf: 'center' }} />
  </View>

  {/* --- Bloque de Información mejorado --- */}
  <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F0E6D6' }}>
    <View style={{ marginBottom: 20 }}>
      <DetailItem icon="location-outline" label="Ubicación" value={location} />
    </View>
    
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: 'MateSC-Regular', fontSize: 16, color: '#8B5E3C', marginBottom: 12, fontWeight: '600' }}>Información Geográfica</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <View style={{ backgroundColor: '#F3E9DD', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E6DAC4' }}>
          <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13', fontSize: 15, fontWeight: '500' }}>📍 {regionName}</Text>
        </View>
        <View style={{ backgroundColor: '#F7F5F2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E6DAC4' }}>
          <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13', fontSize: 15, fontWeight: '500' }}>🌍 {countryName}</Text>
        </View>
      </View>
    </View>
  </View>

  {/* --- Bloque de Descripción mejorado --- */}
  <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F0E6D6' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <View style={{ backgroundColor: '#A67C52', padding: 12, borderRadius: 14, marginRight: 12 }}>
        <Ionicons name="information-circle-outline" size={22} color="#F7F5F2" />
      </View>
      <Text style={{ fontFamily: 'MateSC-Regular', fontSize: 22, color: '#3d2c13', fontWeight: '700' }}>
        Descripción
      </Text>
    </View>
    <Text style={{ fontFamily: 'CrimsonText-Regular', fontSize: 17, color: '#3d2c13', lineHeight: 26, textAlign: 'justify' }}>
      {description}
    </Text>
  </View>
 </ScrollView>
 </View>
);
}

type IoniconsIconNames = "location-outline" | "globe-outline" | "flag-outline" | "calendar-outline";

function DetailItem({
icon,
label,
value,
}: {
icon: IoniconsIconNames;
label: string;
value: string;
}) {
return (
<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
<View style={{ backgroundColor: '#A67C52', padding: 10, borderRadius: 12, marginRight: 16 }}>
 <Ionicons name={icon} size={18} color="#F7F5F2" />
</View>
<View style={{ flex: 1 }}>
 <Text style={{ fontFamily: 'MateSC-Regular', fontSize: 16, color: '#8B5E3C', marginBottom: 4, fontWeight: '600' }}>
 {label}
 </Text>
 <Text style={{ fontFamily: 'CrimsonText-Regular', fontSize: 17, color: '#3d2c13', lineHeight: 24 }}>
 {value}
 </Text>
</View>
</View>
);
}