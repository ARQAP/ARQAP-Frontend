import { useRouter } from "expo-router";
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
import Button from "../../../components/ui/Button";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

import { useCreateInternalClassifier } from "../../../hooks/useInternalClassifier";

type CreatePayload = {
  number: number | null;
  name: string;
};

export default function New_internal_classifier() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const createIC = useCreateInternalClassifier();
  const isBusy = createIC.isPending;

  const cleanName = (s: string) => s.trim();

  const handleCrear = async () => {
    setNameError(null);
    setServerError(null);
    const n = null; // when creating only names, number should be null
    const nm = cleanName(name);

    // client-side validation
    if (!nm) {
      setNameError("El nombre es requerido");
      return;
    }
    if (nm.length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    try {
      const payload: CreatePayload = { number: n, name: nm };
      await createIC.mutateAsync(payload as any);

      Alert.alert("Éxito", "Nombre de clasificador creado correctamente.");
      router.back();
    } catch (e: any) {
      const message = e?.response?.data?.error ?? e?.message ?? "No se pudo crear el clasificador interno.";
      setServerError(typeof message === 'string' ? message : String(message));
      Alert.alert("Error", message);
    }
  };

  const handleCancelar = () => {
    if (isBusy) return;
    router.back();
  };

  const isButtonDisabled = isBusy || !name.trim();

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
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontFamily: "MateSC-Regular",
                    fontSize: 15,
                    color: Colors.brown,
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Nombre del Clasificador *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: nameError ? "#ff6b6b" : Colors.cremitLight,
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: Colors.darkText,
                  }}
                  placeholder='Nombre (ej: "Verde")'
                  value={name}
                  onChangeText={(v) => {
                    setName(v);
                    setNameError(null);
                    setServerError(null);
                  }}
                  placeholderTextColor="#B8967D"
                  selectionColor={Colors.brown}
                  autoCapitalize="none"
                  editable={!isBusy}
                />
                {nameError ? (
                  <Text style={{ color: "#ff6b6b", marginTop: 8 }}>{nameError}</Text>
                ) : null}
                {serverError ? (
                  <Text style={{ color: "#8B5E3C", marginTop: 8 }}>{serverError}</Text>
                ) : null}
              </View>
            </View>

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