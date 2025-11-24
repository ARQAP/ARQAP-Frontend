import Navbar from "@/app/(tabs)/Navbar";
import MovementCard from "@/components/ui/MovementCard";
import Button from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { useInternalMovements, useUpdateInternalMovement } from "@/hooks/useInternalMovement";
import { InternalMovement } from "@/repositories/internalMovementRepository";
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

export default function ViewMovements() {
    const router = useRouter();
    const {
        data: movements = [],
        isLoading,
        error,
        refetch,
        isFetching,
    } = useInternalMovements();
    const updateMovementMutation = useUpdateInternalMovement();

    const handleViewDetails = (movement: InternalMovement) => {
        // Por ahora solo mostramos los detalles en el card
        // Podrías crear una pantalla de detalle si lo necesitas
        console.log("Ver detalles del movimiento:", movement);
    };

    const handleFinalizeMovement = async (id: number) => {
        try {
            const movement = movements.find((m) => m.id === id);
            if (!movement) return;

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");

            // Crear datetime con zona horaria local
            const timezoneOffset = -now.getTimezoneOffset();
            const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
            const offsetMinutes = Math.abs(timezoneOffset) % 60;
            const offsetSign = timezoneOffset >= 0 ? "+" : "-";
            const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

            const returnDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneString}`;

            // Enviar los datos con datetime completo con zona horaria
            const updateData = {
                ...movement,
                returnDate: returnDateTime,
                returnTime: returnDateTime,
            };

            await updateMovementMutation.mutateAsync({ id, payload: updateData });
            Alert.alert("Éxito", "Movimiento finalizado correctamente. La pieza ha sido devuelta a su ubicación origen.");
        } catch (error) {
            const errorMessage =
                (error as Error).message || "Error al finalizar el movimiento";
            Alert.alert("Error", errorMessage);
            console.log("Error details:", error);
        }
    };

    // Separar movimientos según estén activos o finalizados
    const activeMovements = movements
        .filter((movement) => !movement.returnTime)
        .sort((a, b) => {
            try {
                const dateTimeA = new Date(a.movementTime).getTime();
                const dateTimeB = new Date(b.movementTime).getTime();
                return dateTimeB - dateTimeA;
            } catch (error) {
                return 0;
            }
        });

    const finishedMovements = movements
        .filter((movement) => movement.returnTime)
        .sort((a, b) => {
            try {
                const dateTimeA = new Date(a.movementTime).getTime();
                const dateTimeB = new Date(b.movementTime).getTime();
                return dateTimeB - dateTimeA;
            } catch (error) {
                return 0;
            }
        });

    const renderMovementCard = (movement: InternalMovement) => (
        <MovementCard
            movement={movement}
            onViewDetails={handleViewDetails}
            onFinalize={handleFinalizeMovement}
        />
    );

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
                <Navbar title="Movimientos Internos" showBackArrow backToHome />
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator size="large" color={Colors.brown} />
                    <Text style={{ marginTop: 10, color: Colors.brown }}>
                        Cargando movimientos...
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
                <Navbar title="Movimientos Internos" showBackArrow backToHome />
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
                        Error al cargar los movimientos:{" "}
                        {(error as Error).message}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
            <Navbar title="Movimientos Internos" showBackArrow />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 24,
                    alignItems: Platform.OS === "web" ? "center" : "stretch",
                }}
                refreshControl={
                    Platform.OS !== "web" ? (
                        <View />
                    ) : undefined
                }
            >
                <View
                    style={{
                        width: "100%",
                        maxWidth: 900,
                    }}
                >
                    {/* Botón para crear nuevo movimiento */}
                    <View style={{ paddingVertical: 20 }}>
                        <Button
                            title="Registrar Movimiento"
                            onPress={() => router.push("/(tabs)/internal-movements/New_movement")}
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
                                    {activeMovements.length}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.brown,
                                        fontSize: 12,
                                    }}
                                >
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
                                    {finishedMovements.length}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.green,
                                        fontSize: 12,
                                    }}
                                >
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
                                    {movements.length}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.black,
                                        fontSize: 12,
                                    }}
                                >
                                    Total
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Movimientos Activos */}
                    <View style={{ marginBottom: 30 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#F7F5F2",
                                padding: 15,
                                borderRadius: 12,
                                marginBottom: 15,
                            }}
                        >
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
                                    fontWeight: "600",
                                    color: Colors.brown,
                                }}
                            >
                                Movimientos Activos
                            </Text>
                        </View>

                        {activeMovements.length === 0 ? (
                            <View
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 12,
                                    padding: 40,
                                    alignItems: "center",
                                }}
                            >
                                <Ionicons
                                    name="move-outline"
                                    size={48}
                                    color="#B8967D"
                                />
                                <Text
                                    style={{
                                        marginTop: 16,
                                        fontSize: 16,
                                        color: "#8B5E3C",
                                        textAlign: "center",
                                    }}
                                >
                                    No hay movimientos registrados
                                </Text>
                                <Text
                                    style={{
                                        marginTop: 8,
                                        fontSize: 14,
                                        color: "#A0785D",
                                        textAlign: "center",
                                    }}
                                >
                                    Registre el primer movimiento interno de una pieza
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 16 }}>
                                {activeMovements.map((movement) =>
                                    movement.id
                                        ? renderMovementCard(movement)
                                        : null
                                )}
                            </View>
                        )}
                    </View>

                    {/* Movimientos Finalizados */}
                    <View style={{ marginBottom: 30 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#F7F5F2",
                                padding: 15,
                                borderRadius: 12,
                                marginBottom: 15,
                            }}
                        >
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
                                    fontWeight: "600",
                                    color: Colors.green,
                                }}
                            >
                                Movimientos Finalizados
                            </Text>
                        </View>

                        {finishedMovements.length === 0 ? (
                            <View
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 12,
                                    padding: 40,
                                    alignItems: "center",
                                }}
                            >
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={48}
                                    color="#B8967D"
                                />
                                <Text
                                    style={{
                                        marginTop: 16,
                                        fontSize: 16,
                                        color: "#8B5E3C",
                                        textAlign: "center",
                                    }}
                                >
                                    No hay movimientos finalizados
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 16 }}>
                                {finishedMovements.map((movement) =>
                                    movement.id
                                        ? renderMovementCard(movement)
                                        : null
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

