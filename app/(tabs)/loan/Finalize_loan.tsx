import { useAllLoans, useUpdateLoan } from "@/hooks/useloan";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function FinalizeLoan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params as any;

  const { data: loans } = useAllLoans();
  const updateMutation = useUpdateLoan();

  const loan = useMemo(
    () => (loans || []).find((l: any) => String(l.id) === String(id)) || null,
    [loans, id]
  );

  const [fecha, setFecha] = useState<string>(loan?.FechaDevolucion ?? "");
  const [hora, setHora] = useState<string>(loan?.HoraDevolucion ?? "");

  const handleFinalize = async () => {
    if (!loan) return;
    try {
      await updateMutation.mutateAsync({
        id: Number(id),
        payload: { ...loan, FechaDevolucion: fecha, HoraDevolucion: hora },
      } as any);
      router.push("/(tabs)/loan/View_loan");
    } catch (e) {
      alert("No se pudo finalizar el préstamo.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5ECD6" }}>
      <Navbar title="Finalizar Prestamo" showBackArrow />
      <View
        style={{
          width: "90%",
          maxWidth: 700,
          alignSelf: "center",
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            marginBottom: 12,
            color: "#222",
            fontFamily: "CrimsonText-Regular",
          }}
        >
          Registra la finalización de un prestamo de piezas
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{ fontWeight: "bold", marginBottom: 4, color: "#222" }}
            >
              Fecha de Fin de Prestamo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="calendar"
                size={20}
                color="#222"
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="DD/MM/AAAA"
                value={fecha}
                onChangeText={setFecha}
                style={{
                  flex: 1,
                  backgroundColor: "#E2D3B3",
                  borderRadius: 4,
                  padding: 8,
                  color: "#222",
                }}
              />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text
              style={{ fontWeight: "bold", marginBottom: 4, color: "#222" }}
            >
              Hora de Fin de Prestamo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="clock-o"
                size={20}
                color="#222"
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="--:--"
                value={hora}
                onChangeText={setHora}
                style={{
                  flex: 1,
                  backgroundColor: "#E2D3B3",
                  borderRadius: 4,
                  padding: 8,
                  color: "#222",
                }}
              />
            </View>
          </View>
        </View>

        <Button
          title="FINALIZAR PRESTAMO"
          className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
          textClassName="text-white text-[16px]"
          onPress={handleFinalize}
        />
        <Button
          title="CANCELAR"
          className="bg-[#E2D3B3] rounded-lg py-3 items-center w-full"
          textClassName="text-[#222] text-[16px]"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
