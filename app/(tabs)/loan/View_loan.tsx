import { useAllLoans } from "@/hooks/useloan";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function ViewLoan() {
  const router = useRouter();
  const { data: loans, isLoading, error } = useAllLoans();

  const ongoingLoans = (loans || []).filter((l: any) => !l.FechaDevolucion);
  const finishedLoans = (loans || []).filter((l: any) => l.FechaDevolucion);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5ECD6" }}>
      <Navbar title="Préstamos" showBackArrow backToHome />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            flex: 1,
            width: "90%",
            backgroundColor: "#F5ECD6",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#222",
            }}
          >
            En curso
          </Text>
          <ScrollView style={{ maxHeight: 180, marginBottom: 16 }}>
            {isLoading && <Text>Cargando...</Text>}
            {!isLoading && ongoingLoans.length === 0 && (
              <Text style={{ color: "#222" }}>No hay préstamos en curso</Text>
            )}
            {ongoingLoans.map((loan: any) => (
              <View
                key={String(loan.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E2D3B3",
                  borderRadius: 6,
                  marginBottom: 8,
                  padding: 8,
                }}
              >
                <Text
                  style={{ flex: 1, color: "#222" }}
                >{`#${loan.id} — ${loan.FechaPrestamo || "-"}`}</Text>
                <Button
                  title="Finalizar"
                  className="bg-[#6B705C] rounded-lg px-4 py-2"
                  textClassName="text-white"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/loan/Finalize_loan",
                      params: { id: loan.id },
                    })
                  }
                />
              </View>
            ))}
          </ScrollView>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#222",
            }}
          >
            Finalizados
          </Text>
          <ScrollView style={{ maxHeight: 180, marginBottom: 16 }}>
            {!isLoading && finishedLoans.length === 0 && (
              <Text style={{ color: "#222" }}>
                No hay préstamos finalizados
              </Text>
            )}
            {finishedLoans.map((loan: any) => (
              <View
                key={String(loan.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E2D3B3",
                  borderRadius: 6,
                  marginBottom: 8,
                  padding: 8,
                }}
              >
                <Text
                  style={{ flex: 1, color: "#222" }}
                >{`#${loan.id} — ${loan.FechaPrestamo || "-"}`}</Text>
                <Button
                  title="Ver detalle"
                  className="bg-[#6B705C] rounded-lg px-4 py-2"
                  textClassName="text-white"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/loan/View_detail_loan",
                      params: { id: loan.id },
                    })
                  }
                />
              </View>
            ))}
          </ScrollView>
          <Button
            title="CREAR PRESTAMO"
            className="bg-[#6B705C] rounded-lg py-3 items-center mb-2"
            textClassName="text-white text-[16px]"
            onPress={() => router.push("/(tabs)/loan/New_loan")}
          />
          <Button
            title="CANCELAR"
            className="bg-[#E2D3B3] rounded-lg py-3 items-center"
            textClassName="text-[#222] text-[16px]"
          />
        </View>
      </View>
    </View>
  );
}
