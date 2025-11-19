// app/(tabs)/shelf/New_shelf.tsx
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import { useCreateShelf } from "../../../hooks/useShelf";

export default function New_shelf() {
  const router = useRouter();
  const [shelfCode, setShelfCode] = useState("");
  const createShelf = useCreateShelf();
  const isBusy = createShelf.isPending;

  const handleCrear = async () => {
    const codeNum = Number(String(shelfCode).trim());

    if (!shelfCode.trim()) {
      Alert.alert("Falta el código", "Ingresá el código de la estantería.");
      return;
    }
    if (Number.isNaN(codeNum) || codeNum <= 0) {
      Alert.alert("Código inválido", "El código debe ser un número mayor a 0.");
      return;
    }

    try {
      // El modelo del backend espera: { code: number }
      await createShelf.mutateAsync({ code: codeNum } as any);
      Alert.alert("Éxito", "Estantería creada correctamente.");
      router.back();
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Error", e?.message ?? "No se pudo crear la estantería.");
    }
  };

  const handleCancelar = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F7F0E6] items-center px-0">
      <View className="w-full">
        <Navbar title="Alta de Estantería" showBackArrow />
      </View>

      <View className="w-full max-w-[500px] items-center self-center px-4">
        <Text
          className="text-center text-lg mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingrese los datos de la nueva estantería
        </Text>

        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Código
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full font-crimson placeholder:text-[#A68B5B]"
            placeholder="Ingrese el código (p. ej. 07)"
            value={shelfCode}
            onChangeText={setShelfCode}
            keyboardType="number-pad"
          />
        </View>

        <Button
          title={isBusy ? "Creando..." : "Crear Estantería"}
          onPress={() => {
            if (isBusy) return; // bloquea mientras muta
            handleCrear();
          }}
          className={`w-full self-center mb-4 bg-[#6B705C] rounded-lg py-3 items-center ${isBusy ? "opacity-60" : ""}`}
          textClassName="text-base font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />

        <Button
          title="Cancelar"
          onPress={() => {
            if (isBusy) return; // bloquea mientras muta
            handleCancelar();
          }}
          className={`w-full self-center bg-[#D9C6A5] rounded-lg py-3 items-center ${isBusy ? "opacity-60" : ""}`}
          textClassName="text-base text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />
      </View>
    </View>
  );
}
