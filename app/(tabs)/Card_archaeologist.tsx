import React from "react";
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
  return (
    <View className="bg-[#deceb1] rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
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
        <TouchableOpacity className="p-2">
          <Text className="text-[22px] text-[#44483A]">⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Card_archaeologist;
