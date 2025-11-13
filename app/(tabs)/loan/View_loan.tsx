import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Navbar from "@/app/(tabs)/Navbar";
import { useLoans, useDeleteLoan } from "@/hooks/useLoan";
import Colors from "@/constants/Colors";

export default function ViewLoan() {
  const router = useRouter();
  const { data: loans = [], isLoading, error } = useLoans();
  const deleteLoanMutation = useDeleteLoan();

  // Debug: Log all loans to see data structure
  React.useEffect(() => {
    if (loans && loans.length > 0) {
      console.log("=== LOANS DATA DEBUG ===");
      loans.forEach((loan, index) => {
        console.log(`Loan ${index + 1}:`, {
          id: loan.id,
          returnDate: loan.returnDate,
          returnTime: loan.returnTime,
          returnDateType: typeof loan.returnDate,
          returnTimeType: typeof loan.returnTime,
          fullLoan: loan,
        });
      });
      console.log("========================");
    }
  }, [loans]);

  const handleDeleteLoan = async (loanId: number, artefactName: string) => {
    const confirmDelete = () => {
      deleteLoanMutation.mutate(loanId, {
        onSuccess: () => {
          if (Platform.OS === "web") {
            window.alert("Préstamo eliminado exitosamente");
          } else {
            Alert.alert("Éxito", "Préstamo eliminado exitosamente");
          }
        },
        onError: (error) => {
          const errorMessage =
            (error as Error).message || "Error al eliminar el préstamo";
          if (Platform.OS === "web") {
            window.alert(`Error: ${errorMessage}`);
          } else {
            Alert.alert("Error", errorMessage);
          }
        },
      });
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `¿Estás seguro de eliminar el préstamo de "${artefactName}"?`
      );
      if (confirmed) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Confirmar eliminación",
        `¿Estás seguro de eliminar el préstamo de "${artefactName}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

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

  // Separar préstamos según tengan fecha de devolución o no
  const ongoingLoans = loans.filter(
    (loan) => !loan.returnDate || !loan.returnTime
  );
  const finishedLoans = loans.filter(
    (loan) => loan.returnDate && loan.returnTime
  );

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("es-AR");
    } catch {
      return date;
    }
  };

  const formatTime = (time: string) => {
    try {
      // Si es una fecha completa, extraer solo la hora
      if (time.includes("T")) {
        return new Date(time).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return time;
    } catch {
      return time;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Préstamos" showBackArrow backToHome />
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Préstamos en curso */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 15,
              color: Colors.brown,
            }}
          >
            En curso ({ongoingLoans.length})
          </Text>

          {ongoingLoans.length === 0 ? (
            <View
              style={{
                backgroundColor: "#F7F5F2",
                padding: 20,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#666", fontStyle: "italic" }}>
                No hay préstamos en curso
              </Text>
            </View>
          ) : (
            ongoingLoans.map((loan) => (
              <View
                key={loan.id}
                style={{
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  marginBottom: 10,
                  padding: 15,
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "600",
                        color: Colors.brown,
                        fontSize: 16,
                      }}
                    >
                      {loan.artefact?.name || "Pieza no encontrada"}
                    </Text>
                    <Text style={{ color: "#666", marginTop: 2 }}>
                      Solicitante: {loan.requester?.firstname}{" "}
                      {loan.requester?.lastname}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 12, marginTop: 1 }}>
                      Préstamo: {formatDate(loan.loanDate)}{" "}
                      {formatTime(loan.loanTime)}
                    </Text>
                  </View>

                  {/* Botones para préstamos en curso */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {/* Botón Ver Detalle */}
                    <TouchableOpacity
                      onPress={() =>
                        loan.id &&
                        router.push(`/(tabs)/loan/Detail_loan?id=${loan.id}`)
                      }
                      style={{
                        padding: 10,
                        backgroundColor: Colors.brown,
                        borderRadius: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Feather name="eye" size={14} color="white" />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Ver Detalle
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Finalizar Préstamo */}
                    <TouchableOpacity
                      onPress={() =>
                        loan.id &&
                        router.push(`/(tabs)/loan/Finish_loan?id=${loan.id}`)
                      }
                      style={{
                        padding: 10,
                        backgroundColor: Colors.darkgreen,
                        borderRadius: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Feather name="check-circle" size={14} color="white" />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Finalizar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Préstamos finalizados */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 15,
              color: Colors.brown,
            }}
          >
            Finalizados ({finishedLoans.length})
          </Text>

          {finishedLoans.length === 0 ? (
            <View
              style={{
                backgroundColor: "#F7F5F2",
                padding: 20,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#666", fontStyle: "italic" }}>
                No hay préstamos finalizados
              </Text>
            </View>
          ) : (
            finishedLoans.map((loan) => (
              <View
                key={loan.id}
                style={{
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  marginBottom: 10,
                  padding: 15,
                  borderWidth: 1,
                  borderColor: Colors.green,
                  borderLeftWidth: 4,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "600",
                        color: Colors.brown,
                        fontSize: 16,
                      }}
                    >
                      {loan.artefact?.name || "Pieza no encontrada"}
                    </Text>
                    <Text style={{ color: "#666", marginTop: 2 }}>
                      Solicitante: {loan.requester?.firstname}{" "}
                      {loan.requester?.lastname}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 12, marginTop: 1 }}>
                      Préstamo: {formatDate(loan.loanDate)}{" "}
                      {formatTime(loan.loanTime)}
                    </Text>
                    <Text
                      style={{
                        color: Colors.green,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Devuelto: {formatDate(loan.returnDate!)}{" "}
                      {formatTime(loan.returnTime!)}
                    </Text>
                  </View>

                  {/* Botón Ver Detalle para préstamos finalizados */}
                  <TouchableOpacity
                    onPress={() =>
                      loan.id &&
                      router.push(`/(tabs)/loan/Detail_loan?id=${loan.id}`)
                    }
                    style={{
                      padding: 10,
                      backgroundColor: Colors.brown,
                      borderRadius: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Feather name="eye" size={14} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Ver Detalle
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Botón para crear nuevo préstamo */}
        <Button
          title="Registrar Préstamo"
          onPress={() => router.push("/(tabs)/loan/New_loan")}
          style={{
            backgroundColor: "#6B705C",
            marginTop: 10,
            marginBottom: 20,
          }}
        />
      </ScrollView>
    </View>
  );
}
