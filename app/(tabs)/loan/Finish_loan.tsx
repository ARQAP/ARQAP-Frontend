import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome, Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Navbar from "@/app/(tabs)/Navbar";
import { useLoans, useUpdateLoan } from "@/hooks/useLoan";
import Colors from "@/constants/Colors";

export default function FinishLoan() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: loans = [], isLoading } = useLoans();
  const updateLoanMutation = useUpdateLoan();

  // Encontrar el préstamo específico
  const loan = loans.find((l) => l.id?.toString() === id);

  // Estados para la fecha y hora de devolución
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estados para modales
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("es-AR");
    } catch {
      return date;
    }
  };

  const formatTime = (time: string) => {
    try {
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!returnDate) {
      newErrors.returnDate = "Debe ingresar la fecha de devolución";
    }
    if (!returnTime) {
      newErrors.returnTime = "Debe ingresar la hora de devolución";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !loan) {
      return;
    }

    // Combinar fecha y hora en formato ISO
    const returnDateTime = `${returnDate}T${returnTime}:00.000Z`;

    const updateData = {
      ...loan,
      returnDate: returnDateTime,
      returnTime: returnDateTime,
    };

    try {
      await updateLoanMutation.mutateAsync({
        id: loan.id!,
        payload: updateData,
      });

      if (Platform.OS === "web") {
        window.alert("Préstamo finalizado exitosamente");
      } else {
        Alert.alert("Éxito", "Préstamo finalizado exitosamente");
      }

      router.push("/(tabs)/loan/View_loan");
    } catch (error) {
      const errorMessage =
        (error as Error).message || "Error al finalizar el préstamo";

      if (Platform.OS === "web") {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const DateSelector = () => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempValue, setTempValue] = useState(returnDate);

    if (Platform.OS === "web") {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              setTempValue(returnDate);
              setShowPicker(true);
            }}
            style={{
              backgroundColor: "#F7F5F2",
              borderRadius: 8,
              padding: 12,
              borderWidth: errors.returnDate ? 2 : 1,
              borderColor: errors.returnDate ? "#DC2626" : "#e0e0e0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: returnDate ? Colors.brown : "#999" }}>
              {returnDate ? formatDate(returnDate) : "Seleccionar fecha"}
            </Text>
            <FontAwesome name="calendar" size={16} color={Colors.brown} />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPicker(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
              onPress={() => setShowPicker(false)}
              activeOpacity={1}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 20,
                  minWidth: 300,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={(e) => e.stopPropagation()}
                activeOpacity={1}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 20,
                    color: Colors.brown,
                  }}
                >
                  Seleccionar Fecha de Devolución
                </Text>

                <input
                  type="date"
                  value={tempValue}
                  onChange={(e: any) => setTempValue(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: "#f0f0f0",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#666", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (tempValue) {
                        setReturnDate(tempValue);
                        setShowPicker(false);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: Colors.brown,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      );
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            backgroundColor: "#F7F5F2",
            borderRadius: 8,
            padding: 12,
            borderWidth: errors.returnDate ? 2 : 1,
            borderColor: errors.returnDate ? "#DC2626" : "#e0e0e0",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: returnDate ? Colors.brown : "#999" }}>
            {returnDate ? formatDate(returnDate) : "Seleccionar fecha"}
          </Text>
          <FontAwesome name="calendar" size={16} color={Colors.brown} />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={returnDate ? new Date(returnDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setReturnDate(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
        )}
      </View>
    );
  };

  const TimeSelector = () => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempValue, setTempValue] = useState(returnTime);

    if (Platform.OS === "web") {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              setTempValue(returnTime);
              setShowPicker(true);
            }}
            style={{
              backgroundColor: "#F7F5F2",
              borderRadius: 8,
              padding: 12,
              borderWidth: errors.returnTime ? 2 : 1,
              borderColor: errors.returnTime ? "#DC2626" : "#e0e0e0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: returnTime ? Colors.brown : "#999" }}>
              {returnTime || "Seleccionar hora"}
            </Text>
            <FontAwesome name="clock-o" size={16} color={Colors.brown} />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPicker(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
              onPress={() => setShowPicker(false)}
              activeOpacity={1}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 20,
                  minWidth: 300,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={(e) => e.stopPropagation()}
                activeOpacity={1}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 20,
                    color: Colors.brown,
                  }}
                >
                  Seleccionar Hora de Devolución
                </Text>

                <input
                  type="time"
                  value={tempValue}
                  onChange={(e: any) => setTempValue(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: "#f0f0f0",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#666", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (tempValue) {
                        setReturnTime(tempValue);
                        setShowPicker(false);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: Colors.brown,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      );
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            backgroundColor: "#F7F5F2",
            borderRadius: 8,
            padding: 12,
            borderWidth: errors.returnTime ? 2 : 1,
            borderColor: errors.returnTime ? "#DC2626" : "#e0e0e0",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: returnTime ? Colors.brown : "#999" }}>
            {returnTime || "Seleccionar hora"}
          </Text>
          <FontAwesome name="clock-o" size={16} color={Colors.brown} />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={
              returnTime ? new Date(`2000-01-01T${returnTime}:00`) : new Date()
            }
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowPicker(false);
              if (selectedTime) {
                const hours = selectedTime
                  .getHours()
                  .toString()
                  .padStart(2, "0");
                const minutes = selectedTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0");
                setReturnTime(`${hours}:${minutes}`);
              }
            }}
          />
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar
          title="Finalizar Préstamo"
          showBackArrow
          redirectTo="/(tabs)/loan/View_loan"
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.brown} />
          <Text style={{ marginTop: 10, color: Colors.brown }}>
            Cargando préstamo...
          </Text>
        </View>
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar
          title="Finalizar Préstamo"
          showBackArrow
          redirectTo="/(tabs)/loan/View_loan"
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: "#DC2626", textAlign: "center", fontSize: 16 }}>
            Préstamo no encontrado
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/loan/View_loan")}
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: Colors.brown,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Volver a Préstamos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Finalizar Préstamo"
        showBackArrow
        redirectTo="/(tabs)/loan/View_loan"
      />

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Información del préstamo */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.brown,
              marginBottom: 15,
            }}
          >
            Información del Préstamo
          </Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "600", width: 100, color: "#555" }}>
                Pieza:
              </Text>
              <Text style={{ flex: 1, color: "#333" }}>
                {loan.artefact?.name || "No especificado"}
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "600", width: 100, color: "#555" }}>
                Solicitante:
              </Text>
              <Text style={{ flex: 1, color: "#333" }}>
                {loan.requester?.firstname} {loan.requester?.lastname}
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "600", width: 100, color: "#555" }}>
                Préstamo:
              </Text>
              <Text style={{ flex: 1, color: "#333" }}>
                {formatDate(loan.loanDate)} a las {formatTime(loan.loanTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Formulario de devolución */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.brown,
              marginBottom: 15,
            }}
          >
            Registrar Devolución
          </Text>

          {/* Fecha de devolución */}
          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: Colors.brown,
                marginBottom: 8,
              }}
            >
              Fecha de devolución *
            </Text>
            <DateSelector />
            {errors.returnDate && (
              <Text style={{ color: "#DC2626", marginTop: 5 }}>
                {errors.returnDate}
              </Text>
            )}
          </View>

          {/* Hora de devolución */}
          <View style={{ marginBottom: 15 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: Colors.brown,
                marginBottom: 8,
              }}
            >
              Hora de devolución *
            </Text>
            <TimeSelector />
            {errors.returnTime && (
              <Text style={{ color: "#DC2626", marginTop: 5 }}>
                {errors.returnTime}
              </Text>
            )}
          </View>
        </View>

        {/* Botones */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/loan/View_loan")}
            style={{
              flex: 1,
              padding: 15,
              backgroundColor: "#f0f0f0",
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: Colors.brown, fontWeight: "600", fontSize: 16 }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={updateLoanMutation.isPending}
            style={{
              flex: 1,
              padding: 15,
              backgroundColor: updateLoanMutation.isPending
                ? "#ccc"
                : Colors.green,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Feather name="check-circle" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              {updateLoanMutation.isPending ? "Finalizando..." : "Finalizar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
