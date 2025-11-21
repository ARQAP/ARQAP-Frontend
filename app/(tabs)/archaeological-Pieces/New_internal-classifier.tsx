// app/(tabs)/inpl/New_internal_classifier.tsx
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

// ⬇️ Hooks que compartiste
import { useCreateInternalClassifier } from "../../../hooks/useInternalClassifier";

type CreatePayload = {
  number: number;
  color: string;
};

export default function New_internal_classifier() {
  const router = useRouter();
  const [numberStr, setNumberStr] = useState("");
  const [color, setColor] = useState("");

  const createIC = useCreateInternalClassifier();
  const isBusy = createIC.isPending;

  const cleanColor = (s: string) => s.trim();

  const handleCrear = async () => {
    const n = Number(String(numberStr).trim());
    const c = cleanColor(color);

    if (!numberStr.trim()) {
      Alert.alert("Falta el número", "Ingresá el número del clasificador.");
      return;
    }
    if (Number.isNaN(n) || n <= 0) {
      Alert.alert("Número inválido", "El número debe ser mayor a 0.");
      return;
    }
    if (!c) {
      Alert.alert("Falta el color", "Ingresá el color del clasificador.");
      return;
    }

    try {
      const payload: CreatePayload = { number: n, color: c };
      const created = await createIC.mutateAsync(payload as any);

      Alert.alert("Éxito", "Clasificador interno creado correctamente.");
      router.back();
    } catch (e: any) {
      console.warn(e);
      Alert.alert(
        "Error",
        e?.message ?? "No se pudo crear el clasificador interno."
      );
    }
  };

  const handleCancelar = () => {
    if (isBusy) return;
    router.back();
  };

  const isButtonDisabled = isBusy || !numberStr.trim() || !color.trim();

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Nuevo Clasificador Interno" showBackArrow />
      
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
                Nuevo Clasificador Interno
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Ingrese los datos del clasificador interno
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
              {/* Campo Número */}
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
                  Número *
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
                  placeholder="Número (ej: 12)"
                  value={numberStr}
                  onChangeText={setNumberStr}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  keyboardType="number-pad"
                  editable={!isBusy}
                />
              </View>

              {/* Campo Color */}
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
                  Color *
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
                  placeholder='Color (ej: "Rojo" o "#A67C52")'
                  value={color}
                  onChangeText={setColor}
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  autoCapitalize="none"
                  editable={!isBusy}
                />
              </View>
            </View>

            {/* Botones de Acción */}
            <View style={{ gap: 16 }}>
              <Button
                title={isBusy ? "Creando Clasificador..." : "Crear Clasificador"}
                onPress={() => {
                  if (isBusy) return;
                  handleCrear();
                }}
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
                  opacity: isBusy ? 0.6 : 1,
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