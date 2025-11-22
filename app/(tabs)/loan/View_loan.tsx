import Navbar from "@/app/(tabs)/Navbar";
import { LoanCard } from "@/components/ui";
import Button from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { useLoans, useUpdateLoan } from "@/hooks/useLoan";
import { Loan } from "@/repositories/loanRepository";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ViewLoan() {
  const router = useRouter();
  const {
    data: loans = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useLoans();
  const updateLoanMutation = useUpdateLoan();

  // Estados para controlar la expansión de las secciones
  const [isActiveSectionExpanded, setIsActiveSectionExpanded] = useState(false);
  const [isFinishedSectionExpanded, setIsFinishedSectionExpanded] =
    useState(false);

  const handleViewDetails = (loan: Loan) => {
    router.push(`/(tabs)/loan/Detail_loan?id=${loan.id}`);
  };

  const handleFinalizeLoan = async (id: number) => {
    try {
      const loan = loans.find((l) => l.id === id);
      if (!loan) return;

      const now = new Date();

      // Crear fecha y hora local en formato ISO pero sin conversión UTC
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      // Crear datetime con zona horaria local
      const timezoneOffset = -now.getTimezoneOffset(); // Offset en minutos
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? "+" : "-";
      const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

      const returnDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneString}`;

      // Enviamos los datos con datetime completo con zona horaria
      const updateData = {
        ...loan,
        returnDate: returnDateTime, // Datetime completo con zona horaria
        returnTime: returnDateTime, // Datetime completo con zona horaria
      };

      await updateLoanMutation.mutateAsync({ id, payload: updateData });
      Alert.alert("Éxito", "Préstamo finalizado correctamente.");
    } catch (error) {
      const errorMessage =
        (error as Error).message || "Error al finalizar el préstamo";
      Alert.alert("Error", errorMessage);
      console.log("Error details:", error);
    }
  };

  // Separar préstamos según tengan returnTime o no
  const activeLoans = loans
    .filter((loan) => !loan.returnTime)
    .sort((a, b) => {
      console.log('Loan A:', {
        id: a.id,
        loanDate: a.loanDate,
        loanTime: a.loanTime,
        combined: `${a.loanDate}T${a.loanTime || '00:00:00'}`
      });
      console.log('Loan B:', {
        id: b.id,
        loanDate: b.loanDate,
        loanTime: b.loanTime,
        combined: `${b.loanDate}T${b.loanTime || '00:00:00'}`
      });

      let dateTimeA, dateTimeB;

      try {
        if (a.loanTime && a.loanTime.includes('T')) {
          dateTimeA = new Date(a.loanTime).getTime();
        } else {
          dateTimeA = new Date(`${a.loanDate}T${a.loanTime || '00:00:00'}`).getTime();
        }

        if (b.loanTime && b.loanTime.includes('T')) {
          dateTimeB = new Date(b.loanTime).getTime();
        } else {
          dateTimeB = new Date(`${b.loanDate}T${b.loanTime || '00:00:00'}`).getTime();
        }
      } catch (error) {
        console.error('Error parsing dates:', error);
        dateTimeA = new Date(a.loanDate).getTime();
        dateTimeB = new Date(b.loanDate).getTime();
      }

      const result = dateTimeB - dateTimeA;
      console.log('Comparison result:', result);
      return result;
    });

  const finishedLoans = loans
    .filter((loan) => loan.returnTime)
    .sort((a, b) => {
      let dateTimeA, dateTimeB;

      try {
        if (a.loanTime && a.loanTime.includes('T')) {
          dateTimeA = new Date(a.loanTime).getTime();
        } else {
          dateTimeA = new Date(`${a.loanDate}T${a.loanTime || '00:00:00'}`).getTime();
        }

        if (b.loanTime && b.loanTime.includes('T')) {
          dateTimeB = new Date(b.loanTime).getTime();
        } else {
          dateTimeB = new Date(`${b.loanDate}T${b.loanTime || '00:00:00'}`).getTime();
        }
      } catch (error) {
        console.error('Error parsing dates:', error);
        dateTimeA = new Date(a.loanDate).getTime();
        dateTimeB = new Date(b.loanDate).getTime();
      }

      return dateTimeB - dateTimeA;
    });

  const renderLoanCard = (loan: Loan) => (
    <LoanCard
      loan={loan}
      onViewDetails={handleViewDetails}
      onFinalize={handleFinalizeLoan}
    />
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar title="Préstamos" showBackArrow backToHome />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.brown} />
          <Text style={{ marginTop: 10, color: Colors.brown }}>
            Cargando préstamos...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar title="Préstamos" showBackArrow backToHome />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: "#DC2626", textAlign: "center", fontSize: 16 }}>
            Error al cargar los préstamos: {(error as Error).message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Préstamos" showBackArrow backToHome />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          // Centrado en web, stretch en mobile
          alignItems: Platform.OS === "web" ? "center" : "stretch",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 900,
          }}
        >
          {/* Botón para crear nuevo préstamo */}
          <View style={{ paddingVertical: 20 }}>
            <Button
              title="Registrar Préstamo"
              onPress={() => router.push("/(tabs)/loan/New_loan")}
              style={{ backgroundColor: "#6B705C" }}
            />
          </View>

          {/* Estadísticas */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                backgroundColor: "#F7F5F2",
                borderRadius: 12,
                padding: 15,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: Colors.brown,
                  }}
                >
                  {activeLoans.length}
                </Text>
                <Text style={{ color: Colors.brown, fontSize: 12 }}>
                  Activos
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: Colors.green,
                  }}
                >
                  {finishedLoans.length}
                </Text>
                <Text style={{ color: Colors.green, fontSize: 12 }}>
                  Finalizados
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: Colors.black,
                  }}
                >
                  {loans.length}
                </Text>
                <Text style={{ color: Colors.black, fontSize: 12 }}>Total</Text>
              </View>
            </View>
          </View>

          {/* Préstamos Activos */}
          <View style={{ marginBottom: 30 }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F7F5F2",
                padding: 15,
                borderRadius: 12,
                marginBottom: 15,
              }}
              onPress={() =>
                setIsActiveSectionExpanded(!isActiveSectionExpanded)
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.brown,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: Colors.brown,
                  }}
                >
                  Préstamos Activos ({activeLoans.length})
                </Text>
              </View>
              <Ionicons
                name={
                  isActiveSectionExpanded
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={24}
                color={Colors.brown}
              />
            </TouchableOpacity>

            {isActiveSectionExpanded &&
              (activeLoans.length > 0 ? (
                activeLoans.map((loan) => (
                  <View key={loan.id} style={{ marginBottom: 10 }}>
                    {renderLoanCard(loan)}
                  </View>
                ))
              ) : (
                <View
                  style={{
                    backgroundColor: "#F7F5F2",
                    padding: 20,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: Colors.brown, fontSize: 14 }}>
                    No hay préstamos activos
                  </Text>
                </View>
              ))}
          </View>

          {/* Préstamos Finalizados */}
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F7F5F2",
                padding: 15,
                borderRadius: 12,
                marginBottom: 15,
              }}
              onPress={() =>
                setIsFinishedSectionExpanded(!isFinishedSectionExpanded)
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.green,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: Colors.green,
                  }}
                >
                  Préstamos Finalizados ({finishedLoans.length})
                </Text>
              </View>
              <Ionicons
                name={
                  isFinishedSectionExpanded
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={24}
                color={Colors.green}
              />
            </TouchableOpacity>

            {isFinishedSectionExpanded &&
              (finishedLoans.length > 0 ? (
                finishedLoans.map((loan) => (
                  <View key={loan.id} style={{ marginBottom: 10 }}>
                    {renderLoanCard(loan)}
                  </View>
                ))
              ) : (
                <View
                  style={{
                    backgroundColor: "#F7F5F2",
                    padding: 20,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: Colors.green, fontSize: 14 }}>
                    No hay préstamos finalizados
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
