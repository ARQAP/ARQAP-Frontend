import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
 // Usamos la variante async de la mutación para control explícito
 const { mutateAsync: deleteSiteAsync, isPending: isDeleting } = useDeleteArchaeologicalSite();
 

 const handleDeleteConfirmation = () => {
  if (siteId === undefined || isDeleting) return;

  const message = `¿Está seguro de que desea eliminar el sitio arqueológico "${name}"? Esta acción es irreversible.`;

  // En web, Alert.alert puede no comportarse igual; usar window.confirm para compatibilidad.
  if (Platform.OS === 'web') {
    const ok = window.confirm(message);
    if (!ok) return;
    // Ejecutar borrado async
    (async () => {
      try {
        await deleteSiteAsync(siteId);
        Alert.alert("Éxito", "Sitio eliminado correctamente.");
        router.push("/(tabs)/location/Location");
      } catch (e: any) {
        Alert.alert("Error", `Fallo al eliminar el sitio: ${e?.message ?? e}`);
      }
    })();
    return;
  }

  // Nativo: usar Alert con botones
  Alert.alert(
    'Confirmar Eliminación',
    message,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await deleteSiteAsync(siteId);
          Alert.alert('Éxito', 'Sitio eliminado correctamente.');
          router.push('/(tabs)/location/Location');
        } catch (e: any) {
          Alert.alert('Error', `Fallo al eliminar el sitio: ${e?.message ?? e}`);
        }
      } }
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
  {/* --- Título centrado --- */}
  <View style={{ marginBottom: 18, alignItems: 'center' }}>
    <Text style={{ fontFamily: 'MateSC-Regular', fontSize: 28, color: '#3d2c13', fontWeight: '700', textAlign: 'center' }} numberOfLines={2} ellipsizeMode="tail">{name}</Text>
    <View style={{ height: 6 }} />
    <View style={{ width: 96, height: 4, backgroundColor: '#A67C52', borderRadius: 4, alignSelf: 'center' }} />
  </View>

  {/* --- Acciones rápidas en la esquina superior derecha (sobre la Navbar) --- */}
  <View style={{ position: 'absolute', right: 14, top: 18, flexDirection: 'row', alignItems: 'center', zIndex: 50 }}>
    <TouchableOpacity
      onPress={isDeleting ? () => {} : () => {
        router.push({ pathname: `/(tabs)/location/Edit_site` as any, params: { id, name, location, regionName, countryName, description } });
      }}
      style={{ backgroundColor: '#A67C52', padding: 10, borderRadius: 10, marginRight: 8 }}
      accessibilityLabel="Editar sitio"
    >
      <Feather name="edit-2" size={18} color="#F7F5F2" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={isDeleting ? () => {} : handleDeleteConfirmation}
      style={{ backgroundColor: '#cf0303', padding: 10, borderRadius: 10 }}
      accessibilityLabel="Eliminar sitio"
    >
      {isDeleting ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="trash-2" size={18} color="#fff" />}
    </TouchableOpacity>
  </View>

  {/* --- Bloque de Información --- */}
  <View style={{ backgroundColor: '#D9C6A5', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
    <View style={{ marginBottom: 8 }}>
      <DetailItem icon="map-pin" label="Ubicación" value={location} />
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
      <View style={{ backgroundColor: '#EADFCB', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 }}>
        <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13' }}>{regionName}</Text>
      </View>
      <View style={{ backgroundColor: '#F3E9DD', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 }}>
        <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13' }}>{countryName}</Text>
      </View>
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

  {/* --- (Botón de eliminación principal eliminado — ahora usar las acciones rápidas) --- */}
  {isDeleting && (
    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={{ marginTop: 12, fontFamily: 'CrimsonText-Regular', color: '#3d2c13' }}>Eliminando sitio...</Text>
      </View>
    </View>
  )}
  
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