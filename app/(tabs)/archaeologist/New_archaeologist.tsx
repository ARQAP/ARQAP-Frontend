import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  Alert, 
  Text, 
  TextInput, 
  View, 
  ScrollView, 
  Platform,
  KeyboardAvoidingView 
} from "react-native";
import Button from "../../../components/ui/Button";
import { useCreateArchaeologist } from "../../../hooks/useArchaeologist";
import { Archaeologist } from "../../../repositories/archaeologistRespository";
import Navbar from "../Navbar";
import Colors from "@/constants/Colors";

export default function New_archaeologist() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  
  const createMutation = useCreateArchaeologist();

  const isButtonDisabled = createMutation.isPending || !nombre.trim() || !apellido.trim();

  const handleCrear = () => {
    if (isButtonDisabled && !createMutation.isPending) return;

    const newArchaeologist: Archaeologist = {
        firstname: nombre.trim(), 
        lastname: apellido.trim(),
    };

    createMutation.mutate(newArchaeologist, {
        onSuccess: () => {
            Alert.alert("Éxito", "Arqueólogo registrado correctamente.");
            router.back(); 
        },
        onError: (error) => {
            const errorMessage = (error as Error).message || "Ocurrió un error al crear el registro.";
            Alert.alert("Error", errorMessage);
        },
    });
  };

  const handleCancelar = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Navbar title="Nuevo Arqueólogo" showBackArrow />
      
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
        >
          <View
            style={{
              width: "100%",
              maxWidth: 800,
              alignSelf: "center",
            }}
          >
            {/* Encabezado */}
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
                Registro de Arqueólogo
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Ingrese los datos del nuevo arqueólogo en el sistema
              </Text>
            </View>

            {/* Formulario */}
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
              {/* Campo Nombre */}
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
                  Nombre
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
                  placeholder="Ingrese el nombre"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                />
              </View>

              {/* Campo Apellido */}
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
                  Apellido
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
                  placeholder="Ingrese el apellido"
                  value={apellido}
                  onChangeText={setApellido}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                />
              </View>
            </View>

            {/* Botones de Acción */}
            <View style={{ gap: 16 }}>
              <Button
                title={createMutation.isPending ? "Creando..." : "Crear Arqueólogo"}
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