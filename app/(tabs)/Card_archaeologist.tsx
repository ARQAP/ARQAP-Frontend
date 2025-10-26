import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useDeleteArchaeologist } from "../../hooks/useArchaeologist";

interface CardArchaeologistProps {
  id?: number;
  nombre: string;
  apellido: string;
}

const Card_archaeologist: React.FC<CardArchaeologistProps> = ({ id, nombre, apellido }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const delMut = useDeleteArchaeologist();

  const [isDeleting, setIsDeleting] = useState(false);
  const isPending = isDeleting || (delMut.isPending && delMut.variables === id);
  const isDisabled = isPending || delMut.isPending; 
  const handleDotsPress = () => {
    if (isDisabled) return;
    setMenuVisible((v) => !v);
  };
  
  const handleEdit = () => {
    setMenuVisible(false);
    if (isDisabled || !id) return;
    router.push({
      pathname: "/(tabs)/Edit_archaeologist",
      params: { id: String(id), nombre, apellido },
    });
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (!id || isDisabled) return;

    const doDelete = () => {
      setIsDeleting(true);
      delMut.mutate(id, {
        onError: (error) => {
          const errorMessage = (error as Error).message || "Error al eliminar el registro.";
          Alert.alert("Error de Servidor", errorMessage);
        },
        onSettled: () => {
          setIsDeleting(false);
        },
      });
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`¿Eliminar a ${nombre} ${apellido}? Esta acción es irreversible.`);
      if (confirmed) doDelete();
      return;
    }

    Alert.alert(
      "Eliminar",
      `¿Eliminar a ${nombre} ${apellido}? Esta acción es irreversible.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: doDelete },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className={`bg-[#deceb1] rounded-xl p-4 mb-4 w-full flex relative shadow-md ${isDisabled ? 'opacity-60' : 'z-10'}`}>
      
      {isPending && (
        <View className="absolute inset-0 z-50 justify-center items-center bg-black/30 rounded-xl">
          <View className="bg-white/90 p-4 rounded-lg items-center">
            <ActivityIndicator size="large" color="#8B5E3C" />
            <Text className="text-[#3d2c13] mt-2" style={{ fontFamily: "CrimsonText-Regular" }}>
              Eliminando...
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row items-center mb-1 justify-between">
        <View className="flex-row items-center">
          <Text className="text-[#3d2c13] font-bold text-[15px] mr-1" style={{ fontFamily: "MateSC-Regular" }}>
            Nombre:
          </Text>
          <Text className="text-[#3d2c13] text-[15px]" style={{ fontFamily: "CrimsonText-Regular" }}>
            {nombre}
          </Text>
        </View>
        
        <View className="relative items-end">
          <TouchableOpacity
            className="flex-col items-center justify-center w-9 h-9 rounded-full bg-[#E2D1B2] px-1.5 py-1.5"
            onPress={handleDotsPress}
            activeOpacity={0.7}
            disabled={isDisabled}
            hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
          >
            {[0, 1, 2].map((i) => (
              <View key={i} className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" style={{ marginTop: i === 0 ? 0 : 3 }} />
            ))}
          </TouchableOpacity>
          
          {menuVisible && (
            <View className="absolute top-10 right-0 bg-white rounded-lg shadow-lg p-1 min-w-[140px] border border-[#eee]">
              <TouchableOpacity onPress={() => { setMenuVisible(false); handleEdit(); }} className="py-2 px-3 flex-row items-center w-full">
                <Text className="mr-2">✏️</Text>
                <Text className="text-[#333] text-[15px]" style={{ fontFamily: "CrimsonText-Regular" }}>
                  Editar
                </Text>
              </TouchableOpacity>

              <View className="h-[1px] bg-[#f0e9df] mx-2" />

              <TouchableOpacity onPress={() => { setMenuVisible(false); handleDelete(); }} className="py-2 px-3 flex-row items-center w-full">
                <Text className="mr-2">🗑️</Text>
                <Text className="text-[#8B5E3C] text-[15px]" style={{ fontFamily: "CrimsonText-Regular" }}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row items-center mb-1">
        <Text className="text-[#3d2c13] font-bold text-[15px] mr-1" style={{ fontFamily: "MateSC-Regular" }}>
          Apellido:
        </Text>
        <Text className="text-[#3d2c13] text-[15px]" style={{ fontFamily: "CrimsonText-Regular" }}>
          {apellido}
        </Text>
      </View>
    </View>
  );
};

export default Card_archaeologist;