import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Navbar from "../Navbar";
import Colors from "@/constants/Colors";

export default function ViewSite() {
  const params = useLocalSearchParams();

  // --- RECUPERAR PARÁMETROS ---
  const id = Array.isArray(params.id) ? params.id[0] : params.id || "";
  const name = Array.isArray(params.Name) ? params.Name[0] : params.Name || "";
  const location = Array.isArray(params.Location)
    ? params.Location[0]
    : params.Location || "";
  const regionName = Array.isArray(params.regionName)
    ? params.regionName[0]
    : params.regionName || "";
  const countryName = Array.isArray(params.countryName)
    ? params.countryName[0]
    : params.countryName || "";
  const description = Array.isArray(params.Description)
    ? params.Description[0]
    : params.Description || "";

  // Convertir ID a número
  const siteId = id ? parseInt(id, 10) : undefined;

  const safe = (value?: string) =>
    value && value.trim().length > 0 ? value : "Sin información registrada";

  // Control de error de ID
  if (siteId === undefined) {
    return (
      <View className="flex-1 bg-[#F3E9DD] items-center justify-center px-6">
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingVertical: 20,
            paddingHorizontal: 24,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#F0E6D6",
            shadowColor: "#8B5E3C",
            shadowOpacity: 0.16,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Feather name="alert-circle" size={26} color="#B3261E" />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                fontSize: 18,
                color: "#3d2c13",
                marginBottom: 4,
              }}
            >
              No se pudo cargar el sitio
            </Text>
            <Text
              style={{
                fontFamily: "CrimsonText-Regular",
                fontSize: 15,
                color: "#7b5a36",
              }}
            >
              Error: ID de sitio no válido. Volvé atrás e intentá nuevamente.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
      <Navbar title="Sitio Arqueológico" showBackArrow />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 900,
            alignSelf: "center",
          }}
        >
          {/* --- Título --- */}
          <View style={{ marginBottom: 24, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                fontSize: 30,
                color: "#3d2c13",
                fontWeight: "700",
                textAlign: "center",
                lineHeight: 36,
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {safe(name)}
            </Text>

            <View style={{ height: 10 }} />

            <View
              style={{
                width: 120,
                height: 3,
                backgroundColor: "#A67C52",
                borderRadius: 999,
              }}
            />
          </View>

          {/* --- FICHA DEL SITIO --- */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 22,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#F0E6D6",
              shadowColor: "#8B5E3C",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            {/* Encabezado de ficha centrado */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontSize: 18,
                  color: "#8B5E3C",
                  letterSpacing: 1,
                  textAlign: "center",
                }}
              >
                FICHA DEL SITIO
              </Text>

              {/* línea decorativa centrada */}
              <View
                style={{
                  marginTop: 8,
                  width: 80,
                  height: 2,
                  backgroundColor: "#A67C52",
                  borderRadius: 999,
                }}
              />
            </View>

            {/* Campos tipo definición */}
            <InfoRow label="Ubicación" value={safe(location)} />

            <View
              style={{
                height: 1,
                backgroundColor: "#F0E6D6",
                marginVertical: 12,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: 20,
                rowGap: 12,
              }}
            >
              <InfoRow label="Región" value={safe(regionName)} compact />
              <InfoRow label="País" value={safe(countryName)} compact />
            </View>
          </View>

          {/* --- DESCRIPCIÓN --- */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 22,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#F0E6D6",
              shadowColor: "#8B5E3C",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                fontSize: 18,
                color: "#8B5E3C",
                marginBottom: 10,
                letterSpacing: 1,
              }}
            >
              DESCRIPCIÓN DEL SITIO
            </Text>

            <View
              style={{
                height: 2,
                backgroundColor: "#F3E9DD",
                marginBottom: 14,
                width: "30%",
              }}
            />

            <Text
              style={{
                fontFamily: "CrimsonText-Regular",
                fontSize: 17,
                color: "#3d2c13",
                lineHeight: 26,
                textAlign: "justify",
              }}
            >
              {safe(description)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Fila reutilizable de información tipo:
 *   Label: valor
 * Para mantener la estética limpia.
 */
function InfoRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        flex: compact ? 1 : undefined,
      }}
    >
      <Text
        style={{
          fontFamily: "MateSC-Regular",
          fontSize: 14,
          color: "#8B5E3C",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "CrimsonText-Regular",
          fontSize: 16,
          color: "#3d2c13",
          lineHeight: 22,
        }}
        numberOfLines={compact ? 2 : undefined}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
}
