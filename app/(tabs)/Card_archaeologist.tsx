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
  const handleDotsPress = () => setMenuVisible((v) => !v);
  const handleEdit = () => {
    setMenuVisible(false);
  };
  const handleDelete = () => {
    setMenuVisible(false);
  };
  return (
    <View className="bg-[#deceb1] rounded-xl p-4 mb-4 w-full flex">
          <View
            className="flex-row items-center mb-1"
            style={{ justifyContent: "space-between" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
            <View style={{ position: "relative", alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#E2D1B2",
                  paddingVertical: 6,
                  paddingHorizontal: 6,
                }}
                onPress={handleDotsPress}
                activeOpacity={0.7}
              >
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 4,
                      backgroundColor: "#8B5E3C",
                      marginTop: i === 0 ? 0 : 2,
                    }}
                  />
                ))}
              </TouchableOpacity>
              {menuVisible && (
                <View
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 0,
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    elevation: 4,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    minWidth: 100,
                    zIndex: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={{ paddingVertical: 6 }}
                  >
                    <Text
                      style={{
                        color: "#8B5E3C",
                        fontSize: 15,
                        fontFamily: "CrimsonText-Regular",
                      }}
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{ paddingVertical: 6 }}
                  >
                    <Text
                      style={{
                        color: "#8B5E3C",
                        fontSize: 15,
                        fontFamily: "CrimsonText-Regular",
                      }}
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
}


export default Card_archaeologist;
