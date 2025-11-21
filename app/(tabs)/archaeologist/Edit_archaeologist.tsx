import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text, 
  TextInput, 
  View 
} from "react-native";
import Button from "../../../components/ui/Button";
import { useUpdateArchaeologist } from "../../../hooks/useArchaeologist";
import Navbar from "../Navbar";

export default function Edit_archaeologist({
  showBackArrow = false,
}: {
  showBackArrow?: boolean;
}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const [nombre, setNombre] = useState(
    Array.isArray(params.nombre) ? params.nombre[0] : (params.nombre as string) || ""
  );
  const [apellido, setApellido] = useState(
    Array.isArray(params.apellido) ? params.apellido[0] : (params.apellido as string) || ""
  );

  const updateMut = useUpdateArchaeologist();
  const isButtonDisabled = updateMut.isPending || !nombre.trim() || !apellido.trim();

  const handleGuardar = () => {
    if (!id || !nombre.trim() || !apellido.trim()) return;
    updateMut.mutate(
      { id, payload: { firstname: nombre.trim(), lastname: apellido.trim() } },
      { onSuccess: () => router.back() }
    );
  };

  const handleCancelar = () => router.back();

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Editar Arqueólogo" showBackArrow />
      
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
                Editar Arqueólogo
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Edite los datos del arqueólogo
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
                  placeholder="Nombre del arqueólogo"
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
                  Apellido *
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
                  placeholder="Apellido del arqueólogo"
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
                title={updateMut.isPending ? "Guardando..." : "Guardar cambios"}
                onPress={handleGuardar}
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