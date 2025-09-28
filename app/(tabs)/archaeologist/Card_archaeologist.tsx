import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CardArchaeologistProps {
  nombre: string;
  apellido: string;
  documento: string;
  numero: string;
}

const Card_archaeologist: React.FC<CardArchaeologistProps> = ({
  nombre,
  apellido,
  documento,
  numero,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const handleDotsPress = () => setMenuVisible((v) => !v);
  const handleEdit = () => {
    setMenuVisible(false);
    router.push({
      pathname: "/(tabs)/archaeologist/Edit_archaeologist",
      params: { nombre, apellido },
    });
  };
  const handleDelete = () => {
    setMenuVisible(false);
  };
  return (
    <View className="bg-[#deceb1] rounded-xl p-4 mb-4 w-full flex">
      <View className="flex-row items-center mb-1 justify-between">
        <View className="flex-row items-center">
          <Text
            className="text-[#3d2c13] font-bold text-[15px] mr-1"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Nombre:
          </Text>
          <Text
            className="text-[#3d2c13] text-[15px]"
            style={{ fontFamily: "CrimsonText-Regular" }}
          >
            {nombre}
          </Text>
        </View>
        <View className="relative items-center">
          <TouchableOpacity
            className="flex-col items-center justify-center w-8 h-8 rounded-full bg-[#E2D1B2] px-1.5 py-1.5"
            onPress={handleDotsPress}
            activeOpacity={0.7}
          >
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="w-1 h-1 rounded-full bg-[#8B5E3C]"
                style={{ marginTop: i === 0 ? 0 : 2 }}
              />
            ))}
          </TouchableOpacity>
          {menuVisible && (
            <View className="absolute top-5 right-0 bg-white rounded-lg p-1 px-2 min-w-[100px] z-10">
              <TouchableOpacity
                onPress={handleEdit}
                className="py-3 px-2 min-h-[40px] justify-center items-center w-full"
              >
                <Text
                  className="text-[#8B5E3C] text-[17px] text-center w-full"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="py-3 px-2 min-h-[40px] justify-center items-center w-full"
              >
                <Text
                  className="text-[#8B5E3C] text-[17px] text-center w-full"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View className="flex-row items-center mb-1">
        <Text
          className="text-[#3d2c13] font-bold text-[15px] mr-1"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          Apellido:
        </Text>
        <Text
          className="text-[#3d2c13] text-[15px]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          {apellido}
        </Text>
      </View>
      <View className="flex-row items-center mb-1">
        <Text
          className="text-[#3d2c13] font-bold text-[15px] mr-1"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          Documento:
        </Text>
        <Text
          className="text-[#3d2c13] text-[15px]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          {documento}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text
          className="text-[#3d2c13] font-bold text-[15px] mr-1"
          style={{ fontFamily: "MateSC-Regular" }}
        >
          Número:
        </Text>
        <Text
          className="text-[#3d2c13] text-[15px]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          {numero}
        </Text>
      </View>
    </View>
  );
};

export default Card_archaeologist;
