import Navbar from "@/app/(tabs)/Navbar";
import Colors from "@/constants/Colors";
import { useLoans } from "@/hooks/useLoan";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DetailLoan() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { data: loans = [], isLoading, error } = useLoans();

    // Encontrar el préstamo específico
    const loan = loans.find((l) => l.id?.toString() === id);

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

            return localDate.toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
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

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
                <Navbar
                    title="Detalle de Préstamo"
                    showBackArrow
                    redirectTo="/(tabs)/loan/View_loan"
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
                        Cargando detalle...
                    </Text>
                </View>
            </View>
        );
    }

    if (error || !loan) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
                <Navbar
                    title="Detalle de Préstamo"
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
                    <Text
                        style={{
                            color: "#DC2626",
                            textAlign: "center",
                            fontSize: 16,
                        }}
                    >
                        {error
                            ? `Error al cargar el préstamo: ${(error as Error).message}`
                            : "Préstamo no encontrado"}
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

    const isFinished = loan.returnDate && loan.returnTime;

    return (
        <View style={{ flex: 1, backgroundColor: Colors.cream }}>
            <Navbar
                title="Detalle de Préstamo"
                showBackArrow
                redirectTo="/(tabs)/loan/View_loan"
            />

            <ScrollView style={{ flex: 1, padding: 20 }}>
                {/* Estado del préstamo */}
                <View
                    style={{
                        backgroundColor: isFinished
                            ? Colors.green
                            : Colors.brown,
                        padding: 15,
                        borderRadius: 12,
                        marginBottom: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <Ionicons
                        name={
                            isFinished
                                ? "checkmark-circle-outline"
                                : "time-outline"
                        }
                        size={24}
                        color="white"
                    />
                    <Text
                        style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "bold",
                        }}
                    >
                        {isFinished
                            ? "Préstamo Finalizado"
                            : "Préstamo en Curso"}
                    </Text>
                </View>

                {/* Información de la pieza */}
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
                        Pieza Arqueológica
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
                                Nombre:
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
                                Material:
                            </Text>
                            <Text style={{ flex: 1, color: "#333" }}>
                                {loan.artefact?.material || "No especificado"}
                            </Text>
                        </View>

                        {loan.artefact?.description && (
                            <View style={{ flexDirection: "row" }}>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        width: 100,
                                        color: "#555",
                                    }}
                                >
                                    Descripción:
                                </Text>
                                <Text style={{ flex: 1, color: "#333" }}>
                                    {loan.artefact.description}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Información del solicitante */}
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
                        Solicitante
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
                                Tipo:
                            </Text>
                            <Text style={{ flex: 1, color: "#333" }}>
                                {loan.requester?.type || "No especificado"}
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
                                Nombre:
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
                                DNI:
                            </Text>
                            <Text style={{ flex: 1, color: "#333" }}>
                                {loan.requester?.dni || "No especificado"}
                            </Text>
                        </View>

                        {loan.requester?.email && (
                            <View style={{ flexDirection: "row" }}>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        width: 100,
                                        color: "#555",
                                    }}
                                >
                                    Email:
                                </Text>
                                <Text style={{ flex: 1, color: "#333" }}>
                                    {loan.requester.email}
                                </Text>
                            </View>
                        )}

                        {loan.requester?.phoneNumber && (
                            <View style={{ flexDirection: "row" }}>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        width: 100,
                                        color: "#555",
                                    }}
                                >
                                    Teléfono:
                                </Text>
                                <Text style={{ flex: 1, color: "#333" }}>
                                    {loan.requester.phoneNumber}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Fechas del préstamo */}
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
                        Fechas del Préstamo
                    </Text>

                    <View style={{ gap: 12 }}>
                        <View>
                            <Text
                                style={{
                                    fontWeight: "600",
                                    color: "#555",
                                    marginBottom: 4,
                                }}
                            >Solicitado:
                            </Text>
                            <Text style={{ color: "#333", fontSize: 14 }}>
                                {formatDate(loan.loanDate)} a las{" "}
                                {formatTime(loan.loanTime)}
                            </Text>
                        </View>

                        {isFinished ? (
                            <View>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        color: "#555",
                                        marginBottom: 4,
                                    }}
                                >
                                    Fecha y hora de devolución:
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.green,
                                        fontSize: 14,
                                        fontWeight: "600",
                                    }}
                                >
                                    {formatDate(loan.returnDate!)} a las{" "}
                                    {formatTime(loan.returnTime!)}
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        color: Colors.brown,
                                        marginBottom: 4,
                                    }}
                                >
                                    Estado: Préstamo activo
                                </Text>
                                <Text style={{ color: "#666", fontSize: 14 }}>
                                    La pieza aún no ha sido devuelta
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Botón para finalizar si está en curso */}
                {!isFinished && (
                    <TouchableOpacity
                        onPress={() =>
                            loan.id &&
                            router.push(
                                `/(tabs)/loan/Finish_loan?id=${loan.id}`
                            )
                        }
                        style={{
                            backgroundColor: Colors.green,
                            padding: 15,
                            borderRadius: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            marginBottom: 20,
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
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                        >
                            Finalizar Préstamo
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}
