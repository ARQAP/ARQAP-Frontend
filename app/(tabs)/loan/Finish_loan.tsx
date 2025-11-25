import Navbar from "@/app/(tabs)/Navbar";
import Colors from "@/constants/Colors";
import { useLoans, useUpdateLoan } from "@/hooks/useLoan";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
            // Si la fecha viene en formato ISO (YYYY-MM-DD o con T), extraer solo la parte de fecha
            const dateOnly = date.includes("T") ? date.split("T")[0] : date;
            const [year, month, day] = dateOnly.split("-");
            const localDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
            );

            return localDate.toLocaleDateString("es-AR");
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

            router.replace("/(tabs)/loan/View_loan");
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
        // Establecer fecha actual como valor inicial si no hay returnDate
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        if (Platform.OS === "web") {
            return (
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            // Si no hay fecha seleccionada, usar la fecha actual automáticamente
                            if (!returnDate) {
                                setReturnDate(todayString);
                            } else {
                                setShowPicker(true);
                            }
                        }}
                        style={{
                            backgroundColor: "#F7F5F2",
                            borderRadius: 8,
                            padding: 12,
                            borderWidth: errors.returnDate ? 2 : 1,
                            borderColor: errors.returnDate
                                ? "#DC2626"
                                : "#e0e0e0",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: returnDate ? Colors.brown : "#999",
                            }}
                        >
                            {returnDate
                                ? formatDate(returnDate)
                                : `Usar fecha actual (${formatDate(todayString)})`}
                        </Text>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color={Colors.brown}
                        />
                    </TouchableOpacity>

                    {showPicker && (
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
                                        Cambiar Fecha de Devolución
                                    </Text>

                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e: any) =>
                                            setReturnDate(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            fontSize: "16px",
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            marginBottom: "20px",
                                        }}
                                    />

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            gap: 10,
                                        }}
                                    >
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
                                            <Text
                                                style={{
                                                    color: "#666",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Cerrar
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </Modal>
                    )}
                </View>
            );
        }

        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        // Establecer fecha actual si no existe y abrir picker directamente
                        if (!returnDate) {
                            setReturnDate(todayString);
                        }
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
                        {returnDate
                            ? formatDate(returnDate)
                            : `Usar fecha actual (${formatDate(todayString)})`}
                    </Text>
                    <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={Colors.brown}
                    />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={
                            returnDate
                                ? new Date(`${returnDate}T12:00:00`)
                                : today
                        }
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowPicker(false);
                            if (selectedDate) {
                                const year = selectedDate.getFullYear();
                                const month = String(
                                    selectedDate.getMonth() + 1
                                ).padStart(2, "0");
                                const day = String(
                                    selectedDate.getDate()
                                ).padStart(2, "0");
                                setReturnDate(`${year}-${month}-${day}`);
                            }
                        }}
                    />
                )}
            </View>
        );
    };

    const TimeSelector = () => {
        const [showPicker, setShowPicker] = useState(false);
        // Establecer hora actual como valor inicial si no hay returnTime
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        if (Platform.OS === "web") {
            return (
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            // Si no hay hora seleccionada, usar la hora actual automáticamente
                            if (!returnTime) {
                                setReturnTime(currentTime);
                            } else {
                                setShowPicker(true);
                            }
                        }}
                        style={{
                            backgroundColor: "#F7F5F2",
                            borderRadius: 8,
                            padding: 12,
                            borderWidth: errors.returnTime ? 2 : 1,
                            borderColor: errors.returnTime
                                ? "#DC2626"
                                : "#e0e0e0",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: returnTime ? Colors.brown : "#999",
                            }}
                        >
                            {returnTime || `Usar hora actual (${currentTime})`}
                        </Text>
                        <Ionicons
                            name="time-outline"
                            size={16}
                            color={Colors.brown}
                        />
                    </TouchableOpacity>

                    {showPicker && (
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
                                        Cambiar Hora de Devolución
                                    </Text>

                                    <input
                                        type="time"
                                        value={returnTime}
                                        onChange={(e: any) =>
                                            setReturnTime(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            fontSize: "16px",
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            marginBottom: "20px",
                                        }}
                                    />

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            gap: 10,
                                        }}
                                    >
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
                                            <Text
                                                style={{
                                                    color: "#666",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Cerrar
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </Modal>
                    )}
                </View>
            );
        }

        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        // Establecer hora actual si no existe y abrir picker directamente
                        if (!returnTime) {
                            setReturnTime(currentTime);
                        }
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
                        {returnTime || `Usar hora actual (${currentTime})`}
                    </Text>
                    <Ionicons
                        name="time-outline"
                        size={16}
                        color={Colors.brown}
                    />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={
                            returnTime
                                ? new Date(`2000-01-01T${returnTime}:00`)
                                : now
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
                />
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
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
                />
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 20,
                    }}
                >
                    <Text
                        style={{
                            color: "#DC2626",
                            textAlign: "center",
                            fontSize: 16,
                        }}
                    >
                        Préstamo no encontrado
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)/loan/View_loan")}
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
        <View style={{ flex: 1, backgroundColor: Colors.cream }}>
            <Navbar
                title="Finalizar Préstamo"
                showBackArrow
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
                            <Text
                                style={{
                                    fontWeight: "600",
                                    width: 100,
                                    color: "#555",
                                }}
                            >
                                Pieza:
                            </Text>
                            <Text style={{ flex: 1, color: "#333" }}>
                                {loan.artefact?.name || "No especificado"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text
                                style={{
                                    fontWeight: "600",
                                    width: 100,
                                    color: "#555",
                                }}
                            >
                                Solicitante:
                            </Text>
                            <Text style={{ flex: 1, color: "#333" }}>
                                {loan.requester?.firstname}{" "}
                                {loan.requester?.lastname}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text
                                style={{
                                    fontWeight: "600",
                                    width: 100,
                                    color: "#555",
                                }}
                            >
                                Préstamo:
                            </Text>
                            <Text style={{ flex: 1, color: "#333" }}>
                                {formatDate(loan.loanDate)} a las{" "}
                                {formatTime(loan.loanTime)}
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
                <View
                    style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}
                >
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)/loan/View_loan")}
                        style={{
                            flex: 1,
                            padding: 15,
                            backgroundColor: "#f0f0f0",
                            borderRadius: 12,
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.brown,
                                fontWeight: "600",
                                fontSize: 16,
                            }}
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
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color="white"
                        />
                        <Text
                            style={{
                                color: "white",
                                fontWeight: "600",
                                fontSize: 16,
                            }}
                        >
                            {updateLoanMutation.isPending
                                ? "Finalizando..."
                                : "Finalizar"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
