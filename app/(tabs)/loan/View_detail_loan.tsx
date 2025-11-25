import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import Colors from "@/constants/Colors";

type Loan = {
  id: number;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  requester: string;
};

export default function ViewDetailLoan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params as any;
  const [loan, setLoan] = useState<Loan | null>(null);

  useEffect(() => {
    // Mock fetch: replace with real API call
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Navbar
        title="Detalle Prestamo"
        showBackArrow
        redirectTo={"/(tabs)/loan/View_loan"}
      />
      <View
        style={{
          width: "90%",
          maxWidth: 700,
          alignSelf: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "#222",
              fontFamily: "MateSC-Regular",
            }}
          >
            Informacion
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/loan/Edit_loan",
                params: { id },
              })
            }
          >
            <Ionicons name="create-outline" size={22} color="#222" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#e3d6bf",
            paddingTop: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: "#3d2c13",
                  fontWeight: "700",
                }}
              >
                Fecha de Prestamo
              </Text>
              <Text style={{ color: "#222", marginTop: 6 }}>20/07/2024</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: "#3d2c13",
                  fontWeight: "700",
                }}
              >
                Hora de Prestamo
              </Text>
              <Text style={{ color: "#222", marginTop: 6 }}>18:32</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: "#3d2c13",
                  fontWeight: "700",
                }}
              >
                Fecha Fin de Prestamo
              </Text>
              <Text style={{ color: "#222", marginTop: 6 }}>24/07/2024</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: "#3d2c13",
                  fontWeight: "700",
                }}
              >
                Hora fin del prestamo
              </Text>
              <Text style={{ color: "#222", marginTop: 6 }}>11:03</Text>
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: "#3d2c13",
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Solicitante
            </Text>
            <Text style={{ color: "#222" }}>{loan ? loan.requester : ""}</Text>
          </View>
        </View>

        <Button
          title="ELIMINAR PRESTAMO"
          className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
          textClassName="text-white text-[16px]"
          onPress={() => {
            Alert.alert(
              "Confirmar eliminación",
              "¿Estás seguro que deseas eliminar este préstamo?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: () => {
                    // TODO: call API to delete
                    router.push("/(tabs)/loan/View_loan");
                  },
                },
              ]
            );
          }}
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
