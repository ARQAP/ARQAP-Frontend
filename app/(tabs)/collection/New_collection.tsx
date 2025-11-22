import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  Alert, 
  ScrollView, 
  Text, 
  TextInput, 
  View,
  Platform,
  KeyboardAvoidingView 
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import { useCreateCollection } from "../../../hooks/useCollections";
import { Collection } from "../../../repositories/collectionRepository";

export default function NewCollection() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [year, setYear] = useState("");

  const createMutation = useCreateCollection();
  const isButtonDisabled = createMutation.isPending || !nombre.trim();

  const handleCrear = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return;
    }

    const yearNum = year.trim() ? parseInt(year) : undefined;
    if (
      year.trim() &&
      (isNaN(yearNum!) || yearNum! < 1000 || yearNum! > 9999)
    ) {
      Alert.alert("Error", "El año debe ser un número válido de 4 dígitos.");
      return;
    }

    const newCollection: Collection = {
      name: nombre.trim(),
      description: descripcion.trim() || undefined,
      year: yearNum,
    };

    createMutation.mutate(newCollection, {
      onSuccess: () => {
        Alert.alert("Éxito", "Colección registrada correctamente.");
        router.back();
      },
      onError: (error) => {
        const errorMessage =
          (error as Error).message || "Ocurrió un error al crear la colección.";
        Alert.alert("Error", errorMessage);
      },
    });
  };

  const handleCancelar = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Nueva Colección Arqueológica"
        showBackArrow
        backToHome={false}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: Platform.OS === "web" ? 32 : 20,
            paddingTop: Platform.OS === "web" ? 40 : 20,
            paddingBottom: Platform.OS === "web" ? 32 : 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 800,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 28,
                marginBottom: 32,
                shadowColor: "#8B5E3C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontSize: 28,
                  color: "#8B5E3C",
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Nueva Colección Arqueológica
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Ingrese los datos de la nueva colección arqueológica
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#8B5E3C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontFamily: "MateSC-Regular",
                    fontSize: 15,
                    color: "#8B5E3C",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Nombre *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                  }}
                  placeholder="Nombre de la colección"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                />
              </View>

              {/* Campo Descripción */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontFamily: "MateSC-Regular",
                    fontSize: 15,
                    color: "#8B5E3C",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Descripción
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                    minHeight: 120,
                    textAlignVertical: "top",
                  }}
                  placeholder="Descripción detallada de la colección"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  multiline
                  numberOfLines={5}
                />
              </View>

              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontFamily: "MateSC-Regular",
                    fontSize: 15,
                    color: "#8B5E3C",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Año
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                  }}
                  placeholder="Ej: 2024"
                  value={year}
                  onChangeText={setYear}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={{ gap: 16 }}>
              <Button
                title={
                  createMutation.isPending
                    ? "Creando..."
                    : "Crear Colección Arqueológica"
                }
                onPress={handleCrear}
                style={{
                  opacity: isButtonDisabled ? 0.6 : 1,
                }}
                textStyle={{
                  fontFamily: "MateSC-Regular",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              />
              
              <Button
                title="Cancelar"
                onPress={handleCancelar}
                style={{
                  backgroundColor: "#E5D4C1",
                }}
                textStyle={{
                  fontFamily: "MateSC-Regular",
                  fontSize: 15,
                  color: "#8B5E3C",
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}