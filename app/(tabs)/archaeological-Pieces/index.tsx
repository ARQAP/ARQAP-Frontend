import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";
import { useImportArtefactsFromExcel } from "../../../hooks/useArtefact";

type ActionCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

const ActionCard = ({
  title,
  description,
  icon,
  color,
  onPress,
  isLoading = false,
  disabled = false,
}: ActionCardProps) => {
  const { width } = useWindowDimensions();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = width >= 1024;
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => !isDisabled && setIsPressed(true)}
      onPressOut={() => !isDisabled && setIsPressed(false)}
      activeOpacity={0.8}
      disabled={isDisabled}
      className="bg-[#fbf9f5] rounded-2xl border"
      style={[
        styles.cardShadow,
        {
          borderColor:
            isHovered && isDesktop && !isDisabled
              ? color
              : "rgba(0,0,0,0.06)",
          borderWidth: isHovered && isDesktop && !isDisabled ? 2 : 1,
          paddingHorizontal: isDesktop ? 32 : 16,
          paddingVertical: isDesktop ? 24 : 20,
          minHeight: isDesktop ? 150 : 120,
          justifyContent: "center",
          shadowRadius:
            isHovered && isDesktop && !isDisabled ? 12 : 10,
          shadowOpacity:
            isHovered && isDesktop && !isDisabled ? 0.15 : 0.08,
          opacity: isDisabled ? 0.6 : 1,
        },
        {
          transform: [
            {
              scale: isPressed
                ? 0.98
                : isHovered && isDesktop
                ? 1.02
                : 1,
            },
          ],
        },
        isHovered && isDesktop && { translateY: -2 },
        Platform.select({
          web: isDesktop ? { cursor: "pointer" } : {},
        }),
      ]}
      // estos onMouseEnter/Leave solo existen en web; RN los ignora en mobile
      {...(Platform.OS === "web"
        ? {
            onMouseEnter: () => {
              if (!isDisabled) setIsHovered(true);
            },
            onMouseLeave: () => {
              if (!isDisabled) setIsHovered(false);
            },
          }
        : {})}
    >
      <View
        className="flex-row"
        style={{
          alignItems: "center",
        }}
      >
        <View
          className="rounded-xl items-center justify-center mr-5 shrink-0"
          style={[
            styles.iconShadow,
            {
              backgroundColor: color,
              width: isDesktop ? 72 : 52,
              height: isDesktop ? 72 : 52,
              borderRadius: 18,
              transform: [{ scale: isHovered && isDesktop ? 1.05 : 1 }],
            },
          ]}
        >
          {isLoading ? (
            <Ionicons
              name="hourglass-outline"
              size={isDesktop ? 34 : 24}
              color="#fff"
            />
          ) : (
            <Ionicons
              name={icon}
              size={isDesktop ? 34 : 24}
              color="#fff"
            />
          )}
        </View>
        <View className="flex-1">
          <Text
            className="mb-1.5"
            style={[
              styles.titleText,
              {
                color:
                  isHovered && isDesktop && !isDisabled
                    ? color
                    : Colors.black,
                fontSize: isDesktop ? 27 : 21,
                lineHeight: isDesktop ? 32 : 24,
              },
            ]}
          >
            {isLoading ? "Importando..." : title}
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {
                color: Colors.black,
                opacity: 0.7,
                fontSize: isDesktop ? 22 : 16,
                lineHeight: isDesktop ? 28 : 20,
              },
            ]}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>
      </View>

      {isHovered && isDesktop && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 16,
              backgroundColor: `${color}08`,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

export default function ArchaeologicalPiecesIndex() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const importMutation = useImportArtefactsFromExcel();
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  // --------- LÓGICA PRINCIPAL DE IMPORTACIÓN DESDE EXCEL ---------

  const processImportFile = useCallback(
    async (file: File | any) => {
      try {
        console.log("[IMPORT] ===== INICIO processImportFile =====");
        console.log(
          "[IMPORT] Archivo recibido:",
          JSON.stringify(file, null, 2)
        );
        console.log("[IMPORT] Platform.OS:", Platform.OS);
        console.log("[IMPORT] ¿Tiene URI?", !!file.uri);

        let fileToUpload = file;

        // En mobile, seguir el patrón de New_piece.tsx / Edit_piece.tsx
        if (file.uri && Platform.OS !== "web") {
          console.log(
            "[IMPORT] Es mobile, preparando archivo con FormData..."
          );

          const fd = new FormData();
          const fileObject = {
            uri: file.uri,
            name: file.name || "archivo.xlsx",
            type:
              file.type ||
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          };

          console.log(
            "[IMPORT] FileObject a agregar:",
            JSON.stringify(fileObject, null, 2)
          );
          fd.append("file", fileObject as any);
          console.log("[IMPORT] Archivo agregado a FormData");

          fileToUpload = (fd as any).get("file");
          console.log("[IMPORT] ===== ARCHIVO EXTRAÍDO DE FORMDATA =====");
          console.log("[IMPORT] FileToUpload:", fileToUpload);
          console.log(
            "[IMPORT] ¿Tiene URI?",
            !!fileToUpload?.uri
          );
        } else {
          console.log(
            "[IMPORT] Es web, usando archivo directamente"
          );
        }

        console.log("[IMPORT] ===== INICIANDO MUTACIÓN =====");
        const result = await importMutation.mutateAsync(fileToUpload);

        console.log(
          "[IMPORT] ===== RESULTADO DE LA IMPORTACIÓN ====="
        );
        console.log(
          "[IMPORT] Resultado:",
          JSON.stringify(result, null, 2)
        );

        const errorCount = result.errors?.length || 0;
        const importedCount = result.imported || 0;

        let message = `Importación completada.\n\n`;
        message += `Piezas importadas: ${importedCount}\n`;

        if (errorCount > 0) {
          message += `Advertencias/errores: ${errorCount}\n\n`;
          if (result.errors && result.errors.length > 0) {
            const errorPreview = result.errors
              .slice(0, 5)
              .join("\n");
            message += `Primeros errores:\n${errorPreview}`;
            if (result.errors.length > 5) {
              message += `\n... y ${
                result.errors.length - 5
              } más`;
            }
          }
        }

        Alert.alert("Importación completada", message);
      } catch (error: any) {
        console.error("Error importing Excel:", error);
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo importar el archivo Excel.";

        const errors = error?.response?.data?.errors;
        let fullMessage = errorMessage;

        if (errors && Array.isArray(errors) && errors.length > 0) {
          fullMessage += `\n\nErrores encontrados:\n`;
          const errorPreview = errors.slice(0, 5).join("\n");
          fullMessage += errorPreview;
          if (errors.length > 5) {
            fullMessage += `\n... y ${errors.length - 5} más`;
          }
        }

        Alert.alert("Error en la importación", fullMessage);
      }
    },
    [importMutation]
  );

  const handleImportExcel = useCallback(async () => {
    try {
      // WEB: usamos input type="file" nativo
      if (Platform.OS === "web") {
        excelInputRef.current?.click();
        return;
      }

      // MOBILE: expo-document-picker
      let DocumentPicker: any;
      try {
        DocumentPicker = await import("expo-document-picker");
      } catch {
        Alert.alert(
          "Falta dependencia",
          "Instalá expo-document-picker para importar archivos."
        );
        return;
      }

      console.log(
        "[IMPORT] Llamando getDocumentAsync con tipo Excel..."
      );

      const res: any = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ],
      });

      console.log("[IMPORT] Resultado bruto de DocumentPicker:", res);

      // ---- API NUEVA: { canceled, assets } ----
      if (typeof res.canceled === "boolean") {
        if (res.canceled) {
          console.log("[IMPORT] Usuario canceló (API nueva)");
          return;
        }

        const asset = res.assets?.[0];
        if (!asset) {
          Alert.alert(
            "Error",
            "No se pudo leer el archivo seleccionado."
          );
          return;
        }

        console.log(
          "[IMPORT] Archivo (API nueva):",
          asset.name,
          asset.uri
        );

        const fileName = asset.name || "";
        const validExtensions = [".xlsx", ".xls"];
        const isValidExtension = validExtensions.some((ext) =>
          fileName.toLowerCase().endsWith(ext)
        );

        if (!isValidExtension) {
          Alert.alert(
            "Archivo inválido",
            "Por favor seleccione un archivo Excel (.xlsx o .xls)"
          );
          return;
        }

        const fileObject = {
          uri: asset.uri,
          name: asset.name || "archivo.xlsx",
          type:
            asset.mimeType ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };

        await processImportFile(fileObject);
        return;
      }

      // ---- API VIEJA: { type: "success" | "cancel", uri, name, mimeType } ----
      console.log(
        "[IMPORT] API vieja detectada, res.type =",
        res.type
      );

      if (res.type === "success") {
        const fileName = res.name || "";
        const validExtensions = [".xlsx", ".xls"];
        const isValidExtension = validExtensions.some((ext) =>
          fileName.toLowerCase().endsWith(ext)
        );

        if (!isValidExtension) {
          Alert.alert(
            "Archivo inválido",
            "Por favor seleccione un archivo Excel (.xlsx o .xls)"
          );
          return;
        }

        const fileObject = {
          uri: res.uri,
          name: res.name || "archivo.xlsx",
          type:
            res.mimeType ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };

        await processImportFile(fileObject);
      } else if (res.type === "cancel") {
        console.log("[IMPORT] Usuario canceló (API vieja)");
      }
    } catch (err) {
      console.error("[IMPORT] Error:", err);
      Alert.alert(
        "Error",
        "No se pudo abrir el selector de archivos."
      );
    }
  }, [processImportFile]);

  const handleWebFileChange = async (e: any) => {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const validExtensions = [".xlsx", ".xls"];

    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValidType && !isValidExtension) {
      Alert.alert(
        "Archivo inválido",
        "Por favor seleccione un archivo Excel (.xlsx o .xls)"
      );
      e.target.value = "";
      return;
    }

    await processImportFile(file);
    e.target.value = "";
  };

  // --------- UI ---------

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
      <Navbar
        title="Piezas Arqueológicas"
        showBackArrow
        backToHome={true}
        redirectTo="/(tabs)/home"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isDesktop ? 48 : 32,
          flexGrow: 1,
        }}
      >
        <View
          className="w-full mx-auto flex-1"
          style={{
            maxWidth: isDesktop ? 1360 : 720,
            paddingHorizontal: isDesktop ? 35 : 16,
            paddingTop: isDesktop ? 35 : 0,
            paddingBottom: isDesktop ? 0 : 24,
            justifyContent: isDesktop ? "flex-start" : "center",
          }}
        >
          {/* Header */}
          <View
            style={{ marginBottom: isDesktop ? 36 : 24 }}
            className="items-center"
          >
            <Text
              style={[
                styles.headerTitle,
                {
                  color: Colors.black,
                  fontSize: isDesktop ? 60 : 28,
                  lineHeight: isDesktop ? 75 : 34,
                },
              ]}
            >
              Gestión del Inventario
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                {
                  marginTop: 8,
                  color: Colors.black,
                  opacity: 0.65,
                  fontSize: isDesktop ? 30 : 16,
                  textAlign: "center",
                },
              ]}
            >
              Administre las piezas arqueológicas del museo
            </Text>
          </View>

          {isDesktop && (
            <Text
              style={[
                styles.sectionLabel,
                {
                  marginBottom: 16,
                  color: Colors.black,
                  opacity: 0.6,
                },
              ]}
            >
              Acciones principales
            </Text>
          )}

          <View style={{ rowGap: isDesktop ? 20 : 14 }}>
            {/* Primera fila */}
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                columnGap: isDesktop ? 20 : 0,
                rowGap: isDesktop ? 0 : 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Ver todas las piezas"
                  description="Consulte el catálogo completo del inventario"
                  icon="clipboard-outline"
                  color={Colors.lightgreen}
                  onPress={() =>
                    router.push(
                      "/(tabs)/archaeological-Pieces/View_pieces"
                    )
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Registrar nueva pieza"
                  description="Añada un nuevo artefacto al inventario"
                  icon="add-circle-outline"
                  color={Colors.green}
                  onPress={() =>
                    router.push(
                      "/(tabs)/archaeological-Pieces/New_piece"
                    )
                  }
                />
              </View>
            </View>

            {/* Input oculto para web */}
            {Platform.OS === "web" && (
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                style={{ display: "none" }}
                onChange={handleWebFileChange}
              />
            )}

            {/* Segunda fila */}
            <View style={{ marginVertical: isDesktop ? 0 : 0 }}>
              <ActionCard
                title="Mapa del Depósito"
                description="Visualice la distribución de piezas en las estanterías del depósito"
                icon="map-outline"
                color={Colors.darkgreen}
                onPress={() =>
                  router.push(
                    "/(tabs)/archaeological-Pieces/deposit-map"
                  )
                }
              />
            </View>

            {/* Subtítulo herramientas */}
            {isDesktop && (
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    marginTop: 16,
                    marginBottom: 4,
                    color: Colors.black,
                    opacity: 0.6,
                  },
                ]}
              >
                Herramientas de organización
              </Text>
            )}

            {/* Tercera fila */}
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                columnGap: isDesktop ? 20 : 0,
                rowGap: isDesktop ? 0 : 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Clasificador interno"
                  description="Configure etiquetas de clasificación"
                  icon="pricetag-outline"
                  color={Colors.cremit}
                  onPress={() =>
                    router.push(
                      "/(tabs)/archaeological-Pieces/New_internal-classifier"
                    )
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionCard
                  title={
                    importMutation.isPending
                      ? "Importando..."
                      : "Importar desde Excel"
                  }
                  description="Importe múltiples piezas desde un archivo Excel"
                  icon="document-text-outline"
                  color={Colors.cremit}
                  onPress={handleImportExcel}
                  isLoading={importMutation.isPending}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
  },
  iconShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontFamily: "MateSC-Regular",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "CrimsonText-Regular",
  },
  sectionLabel: {
    fontFamily: "CrimsonText-Regular",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  titleText: {
    fontFamily: "MateSC-Regular",
    letterSpacing: 0.3,
  },
  descriptionText: {
    fontFamily: "CrimsonText-Regular",
  },
});
