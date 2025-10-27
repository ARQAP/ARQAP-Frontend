import { useAllLoans, useDeleteLoan } from "@/hooks/useloan";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function ViewDetailLoan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params as any;

  const { data: loans } = useAllLoans();
  const deleteMutation = useDeleteLoan();

  const loan = useMemo(() => {
    return (loans || []).find((l: any) => String(l.id) === String(id)) || null;
  }, [loans, id]);

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar este préstamo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(Number(id));
              router.push("/(tabs)/loan/View_loan");
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar el préstamo.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5ECD6" }}>
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
            <FontAwesome name="pencil" size={22} color="#222" />
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
              <Text style={{ color: "#222", marginTop: 6 }}>
                {loan?.FechaPrestamo ?? "-"}
              </Text>
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
              <Text style={{ color: "#222", marginTop: 6 }}>
                {loan?.HoraPrestamo ?? "-"}
              </Text>
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
              <Text style={{ color: "#222", marginTop: 6 }}>
                {loan?.FechaDevolucion ?? "-"}
              </Text>
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
              <Text style={{ color: "#222", marginTop: 6 }}>
                {loan?.HoraDevolucion ?? "-"}
              </Text>
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
            <Text style={{ color: "#222" }}>{loan?.Solicitante ?? "-"}</Text>
          </View>
        </View>

        <Button
          title="ELIMINAR PRESTAMO"
          className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
          textClassName="text-white text-[16px]"
          onPress={handleDelete}
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
