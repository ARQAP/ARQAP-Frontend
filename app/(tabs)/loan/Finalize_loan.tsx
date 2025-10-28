import { useAllLoans, useUpdateLoan } from "@/hooks/useloan";
import { FontAwesome } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function FinalizeLoan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params as any;

  const { data: loans } = useAllLoans();
  const updateMutation = useUpdateLoan();
  const qc = useQueryClient();

  const loan = useMemo(
    () => (loans || []).find((l: any) => String(l.id) === String(id)) || null,
    [loans, id]
  );

  const [fecha, setFecha] = useState<string>(loan?.FechaDevolucion ?? "");
  const [hora, setHora] = useState<string>(loan?.HoraDevolucion ?? "");

  // input mask helpers: insert '/' and ':' while typing
  const handleFechaChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    let formatted = "";
    if (digits.length <= 2) formatted = digits;
    else if (digits.length <= 4)
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    else
      formatted =
        digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    setFecha(formatted);
  };

  const handleHoraChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    let formatted = "";
    if (digits.length <= 2) formatted = digits;
    else formatted = digits.slice(0, 2) + ":" + digits.slice(2);
    setHora(formatted);
  };

  const handleFinalize = async () => {
    if (!loan) return;
    try {
      // parse fecha (DD/MM/AAAA) and hora (HH:MM) into an ISO date for FechaDevolucion
      let finalDate: Date | null = null;
      if (fecha) {
        const parts = fecha.split("/").map((p) => Number(p));
        if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
          const [d, m, y] = parts;
          finalDate = new Date(y, m - 1, d);
        }
      }
      if (!finalDate && loan?.FechaPrestamo) {
        const pd = new Date(loan.FechaPrestamo);
        if (!isNaN(pd.getTime()))
          finalDate = new Date(pd.getFullYear(), pd.getMonth(), pd.getDate());
      }
      if (!finalDate) finalDate = new Date();

      if (hora) {
        const tparts = hora.split(":").map((p) => Number(p));
        if (tparts.length >= 2 && tparts.every((n) => !isNaN(n))) {
          finalDate.setHours(tparts[0], tparts[1], 0, 0);
        }
      }

      const payload = {
        ...loan,
        FechaDevolucion: finalDate.toISOString(),
        HoraDevolucion: hora || (loan?.HoraPrestamo ?? ""),
      } as any;

      await updateMutation.mutateAsync({ id: Number(id), payload });

      try {
        await qc.invalidateQueries({ queryKey: ["loan"] });
      } catch (e) {
      }

      Alert.alert("Listo", "Préstamo finalizado correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
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
                onChangeText={handleFechaChange}
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
                onChangeText={handleHoraChange}
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
