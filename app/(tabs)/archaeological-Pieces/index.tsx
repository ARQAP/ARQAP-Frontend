import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Navbar from "../Navbar";

type ActionCardProps = {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
};

const ActionCard = ({ title, description, icon, color, onPress }: ActionCardProps) => (
  <Pressable
    onPress={onPress}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 active:scale-95 transition-all"
    style={{ minHeight: 140 }}
  >
    <View className="flex-row items-start justify-between">
      <View className="flex-1">
        <Text className="text-xl font-bold text-[#2F2F2F] mb-2">{title}</Text>
        <Text className="text-sm text-gray-600 leading-5">{description}</Text>
      </View>
      <View
        className="w-12 h-12 rounded-full items-center justify-center ml-3"
        style={{ backgroundColor: color }}
      >
        <Text className="text-2xl">{icon}</Text>
      </View>
    </View>
  </Pressable>
);

export default function ArchaeologicalPiecesIndex() {
  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar
        title="Piezas Arqueológicas"
        showBackArrow
        backToHome={true}
        redirectTo="/(tabs)/home"
      />
      <ScrollView className="flex-1">
        <View className="px-4 sm:px-8 lg:px-12 py-6 max-w-6xl mx-auto w-full">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-[#2F2F2F] mb-2">
              Gestión del Inventario
            </Text>
            <Text className="text-gray-600">
              Administre las piezas arqueológicas del museo
            </Text>
          </View>

          {/* Grid de acciones */}
          <View className="gap-4">
            {/* Primera fila - 2 columnas en desktop */}
            <View className="flex-row gap-4 flex-wrap">
              <View className="flex-1 min-w-[280px]">
                <ActionCard
                  title="Ver todas las piezas"
                  description="Consulte el catálogo completo del inventario"
                  icon="📋"
                  color="#B7C9A6"
                  onPress={() => router.push("/(tabs)/archaeological-Pieces/View_pieces")}
                />
              </View>
              <View className="flex-1 min-w-[280px]">
                <ActionCard
                  title="Registrar nueva pieza"
                  description="Añada un nuevo artefacto al inventario"
                  icon="➕"
                  color="#6B705C"
                  onPress={() => router.push("/(tabs)/archaeological-Pieces/New_piece")}
                />
              </View>
            </View>

            {/* Segunda fila - destacado */}
            <View className="mt-2">
              <ActionCard
                title="Mapa del Depósito"
                description="Visualice la distribución de piezas en las estanterías del depósito"
                icon="🗺️"
                color="#4A5D23"
                onPress={() => router.push("/(tabs)/archaeological-Pieces/deposit-map")}
              />
            </View>

            {/* Tercera fila - utilidades */}
            <View className="flex-row gap-4 flex-wrap mt-2">
              <View className="flex-1 min-w-[280px]">
                <ActionCard
                  title="Nueva estantería"
                  description="Agregue ubicaciones físicas"
                  icon="📦"
                  color="#C9ADA1"
                  onPress={() => router.push("/(tabs)/archaeological-Pieces/New_shelf")}
                />
              </View>
              <View className="flex-1 min-w-[280px]">
                <ActionCard
                  title="Clasificador interno"
                  description="Configure etiquetas de clasificación"
                  icon="🏷️"
                  color="#D9C6A5"
                  onPress={() => router.push("/(tabs)/archaeological-Pieces/New_internal-classifier")}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
