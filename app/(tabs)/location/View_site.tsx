import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../../components/ui/Button";
import { useDeleteArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
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
 
 // --- HOOK DE BORRADO ---
 // Usamos isDeleting para el estado de carga (isPending)
 const { mutate: deleteSite, isPending: isDeleting } = useDeleteArchaeologicalSite();
 

 const handleDeleteConfirmation = () => {
  if (siteId === undefined || isDeleting) { // Bloqueamos el botón si ya está borrando
   return; 
  }

    // NOTA: Lanzamos el Alert directamente. No necesitamos setIsAlertOpen.

  Alert.alert(
   "Confirmar Eliminación",
   `¿Está seguro de que desea eliminar el sitio arqueológico "${name}"? Esta acción es irreversible.`,
   [
    { text: "Cancelar", style: "cancel" },
    {
     text: "Eliminar",
     style: "destructive",
     onPress: () => {
                // ESTE CALLBACK LANZA LA MUTACIÓN. isDeleting se vuelve TRUE aquí.
        deleteSite(siteId, {
         onSuccess: () => {
          Alert.alert("Éxito", "Sitio eliminado correctamente.");
          router.push("/(tabs)/location/Location"); 
         },
         onError: (error) => {
          Alert.alert("Error", `Fallo al eliminar el sitio: ${error.message}`); 
         },
                    // No necesitamos onSettled aquí porque TanStack Query maneja el estado
        });
       },
    },
   ]
  );
 };

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
  {/* --- Encabezado --- */}
  <View className="mb-6">
  <Text
   className="text-3xl font-bold text-[#3d2c13] text-center mb-2"
   style={{ fontFamily: "MateSC-Regular" }}
  >
   {name}
  </Text>
  <View className="h-1 bg-[#A67C52] mx-auto w-24 rounded-full" />
  </View>

  {/* --- Bloque de Información --- */}
  <View className="bg-[#D9C6A5] rounded-2xl p-6 mb-6 shadow-lg relative">
  <TouchableOpacity
   className="absolute top-4 right-4 z-10 bg-[#A67C52] p-2 rounded-full"
   activeOpacity={0.8}
   onPress={isDeleting ? () => {} : () => { // Deshabilitado si está borrando
   router.push({
    pathname: `/(tabs)/location/Edit_site` as any,
    params: {
    id, 
    name,
    location, 
    regionName, 
    countryName, 
    description,
    },
   });
   }}
  >
   <Feather name="edit-2" size={20} color="#F7F5F2" />
  </TouchableOpacity>
  <View className="space-y-5">
   <DetailItem icon="map-pin" label="Ubicación" value={location} /> 
   <DetailItem icon="globe" label="Región" value={regionName} /> 
   <DetailItem icon="flag" label="País" value={countryName} /> 
  </View>
  </View>

  {/* --- Bloque de Descripción --- */}
  <View className="bg-[#F7F5F2] rounded-2xl p-6 mb-6">
  <View className="flex-row items-center mb-4">
   <View className="bg-[#A67C52] p-2 rounded-full mr-3">
   <Feather name="info" size={20} color="#F7F5F2" />
   </View>
   <Text
   className="text-xl font-bold text-[#3d2c13]"
   style={{ fontFamily: "MateSC-Regular" }}
   >
   Descripción
   </Text>
  </View>
  <Text
   className="text-[16px] text-[#3d2c13] leading-6"
   style={{ fontFamily: "CrimsonText-Regular" }}
  >
   {description}
  </Text>
  </View>

  {/* --- Botón Eliminar --- */}
  <Button
  title={isDeleting ? "Eliminando..." : "Eliminar Sitio Arqueológico"}
  onPress={isDeleting ? () => {} : handleDeleteConfirmation} 
  className={`bg-[#D32F2F] rounded-lg py-4 items-center mb-4 ${isDeleting ? 'opacity-50' : ''}`} 
  textClassName="text-[16px] font-bold text-white"
  textStyle={{ fontFamily: "MateSC-Regular" }}
  />
  
  {/* --- Botón Volver --- */}
  <Button
  title="Volver a Sitios Arqueológicos"
  onPress={isDeleting ? () => {} : () => router.back()}
  className={`bg-[#6B705C] rounded-lg py-4 items-center ${isDeleting ? 'opacity-50' : ''}`}
  textClassName="text-[16px] font-bold text-white"
  textStyle={{ fontFamily: "MateSC-Regular" }}
  />
 </ScrollView>
 </View>
);
}

type FeatherIconNames = "map-pin" | "globe" | "flag" | "calendar";

function DetailItem({
icon,
label,
value,
}: {
icon: FeatherIconNames;
label: string;
value: string;
}) {
return (
<View className="flex-row items-center">
<View className="bg-[#A67C52] p-2 rounded-full mr-4">
 <Feather name={icon} size={16} color="#F7F5F2" />
</View>
<View className="flex-1">
 <Text
 className="text-[14px] font-bold text-[#3d2c13] mb-1"
 style={{ fontFamily: "MateSC-Regular" }}
 >
 {label}:
 </Text>
 <Text
 className="text-[16px] text-[#3d2c13]"
 style={{ fontFamily: "CrimsonText-Regular" }}
 >
 {value}
 </Text>
</View>
</View>
);
}