// app/(tabs)/inpl/New_internal_classifier.tsx
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

// ⬇️ Hooks que compartiste
import { useCreateInternalClassifier } from "../../../hooks/useInternalClassifier"; // ajustá el path si difiere

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

      // ⚠️ Suponemos que el repo retorna el clasificador creado con `id`
      const created = await createIC.mutateAsync(payload as any);

      Alert.alert("Éxito", "Clasificador interno creado correctamente.");
      // Redirigí a donde quieras. Ej: volver a la pieza nueva:
      router.push("/(tabs)/archaeological-Pieces/New_piece");

      // Si preferís ir al detalle recién creado:
      // if (created?.id) router.push(`/(tabs)/inpl/View_internal_classifier?id=${created.id}`);
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
    router.push("/(tabs)/archaeological-Pieces/New_piece");
  };

  return (
    <View className="flex-1 bg-[#F7F0E6] items-center px-0">
      <View className="w-full">
        <Navbar
          title="Alta Clasificador Interno"
          showBackArrow
          backToHome={false}
          redirectTo="/(tabs)/archaeological-Pieces/New_piece"
        />
      </View>

      <View className="w-full max-w-[500px] items-center self-center px-4">
        <Text
          className="text-center text-lg mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingresá los datos del clasificador interno
        </Text>

        {/* Número */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Número
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full font-crimson placeholder:text-[#A68B5B]"
            placeholder="Número (p. ej. 12)"
            value={numberStr}
            onChangeText={setNumberStr}
            keyboardType="number-pad"
            editable={!isBusy}
          />
        </View>

        {/* Color */}
        <View className="mb-4 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Color
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full font-crimson placeholder:text-[#A68B5B]"
            placeholder='Color (p. ej. "Rojo" o "#A67C52")'
            value={color}
            onChangeText={setColor}
            autoCapitalize="none"
            editable={!isBusy}
          />
        </View>

        <Button
          title={isBusy ? "Creando..." : "Crear Clasificador"}
          onPress={() => {
            if (isBusy) return;
            handleCrear();
          }}
          className={`w-full self-center mb-4 bg-[#6B705C] rounded-lg py-3 items-center ${isBusy ? "opacity-60" : ""}`}
          textClassName="text-base font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />

        <Button
          title="Cancelar"
          onPress={handleCancelar}
          className={`w-full self-center bg-[#D9C6A5] rounded-lg py-3 items-center ${isBusy ? "opacity-60" : ""}`}
          textClassName="text-base text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
      </View>
    </View>
  );
}
