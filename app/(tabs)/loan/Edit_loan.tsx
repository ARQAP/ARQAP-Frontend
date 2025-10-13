import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

type Loan = {
  id: number;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  requester: string;
};

export default function EditLoan() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const { id } = params || {};
  const [loan, setLoan] = useState<Loan | null>(null);

  useEffect(() => {
    const mockLoans: Loan[] = [
      {
        id: 0,
        startDate: "20/07/2024",
        startTime: "18:32",
        endDate: "24/07/2024",
        endTime: "11:03",
        requester:
          "Exhibicion 22-07-2024 / Departamento 10 / Horacio Rodriguez",
      },
      {
        id: 1,
        startDate: "01/08/2024",
        startTime: "10:00",
        requester: "Departamento 5 / Juan Perez",
      },
    ];
    const found =
      mockLoans.find((m) => String(m.id) === String(id)) || mockLoans[0];
    setLoan(found);
  }, [id]);

  const handleSave = () => {
    // Replace with API call to save
    Alert.alert("Guardado", "Los cambios fueron guardados (mock).", [
      {
        text: "OK",
        onPress: () =>
          router.push({
            pathname: "/(tabs)/loan/View_detail_loan",
            params: { id },
          }),
      },
    ]);
  };

  if (!loan) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5ECD6" }}>
      <Navbar title="Editar Prestamo" showBackArrow />
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
            marginBottom: 12,
            color: "#222",
            fontFamily: "CrimsonText-Regular",
          }}
        >
          Editar información del préstamo
        </Text>

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Fecha de Prestamo
        </Text>
        <TextInput
          value={loan.startDate}
          onChangeText={(t) => setLoan({ ...loan, startDate: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Hora de Prestamo
        </Text>
        <TextInput
          value={loan.startTime}
          onChangeText={(t) => setLoan({ ...loan, startTime: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Fecha Fin de Prestamo
        </Text>
        <TextInput
          value={loan.endDate}
          onChangeText={(t) => setLoan({ ...loan, endDate: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Hora Fin de Prestamo
        </Text>
        <TextInput
          value={loan.endTime}
          onChangeText={(t) => setLoan({ ...loan, endTime: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Solicitante</Text>
        <TextInput
          value={loan.requester}
          onChangeText={(t) => setLoan({ ...loan, requester: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Button
          title="GUARDAR"
          className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
          textClassName="text-white text-[16px]"
          onPress={handleSave}
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
