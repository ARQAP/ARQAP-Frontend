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
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

/**
 * Componente para renderizar una sección de movimientos (grupos o individuales)
 */
interface MovementSectionProps {
    title: string;
    movements: InternalMovement[];
    variant: "group" | "single";
    status: "active" | "finished";
    onFinalize?: (id: number) => void;
    onFinalizeGroup?: (groupId: number) => void;
    groupStats?: Map<number, { total: number; active: number; finished: number }>;
    expandedGroups: Set<number>;
    onToggleGroup: (groupId: number) => void;
}

const MovementSection: React.FC<MovementSectionProps> = ({
    title,
    movements,
    variant,
    status,
    onFinalize,
    onFinalizeGroup,
    groupStats,
    expandedGroups,
    onToggleGroup,
}) => {
    const { width } = useWindowDimensions();
    const isNarrow = width < 420;
    const isVeryNarrow = width < 360;

    if (movements.length === 0) {
        return null;
    }

    const isActive = status === "active";
    const sectionColor = isActive ? Colors.brown : Colors.green;

    return (
        <View style={{ marginBottom: Platform.OS === "web" ? 20 : 16 }}>
            {/* Título de la sección */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: Platform.OS === "web" ? 12 : 10,
                    paddingHorizontal: Platform.OS === "web" ? 4 : 0,
                }}
            >
                <Ionicons
                    name={variant === "group" ? "layers-outline" : "cube-outline"}
                    size={18}
                    color={sectionColor}
                />
                <Text
                    style={{
                        marginLeft: 8,
                        fontSize: 16,
                        fontWeight: "600",
                        color: sectionColor,
                    }}
                >
                    {title} ({movements.length})
                </Text>
            </View>

            {/* Lista de movimientos */}
            {variant === "group" ? (
                // Renderizar grupos
                <View style={{ gap: Platform.OS === "web" ? 12 : 10 }}>
                    {Array.from(
                        new Map(
                            movements
                                .filter((m) => m.groupMovementId !== null)
                                .map((m) => [m.groupMovementId!, m])
                        ).entries()
                    ).map(([groupId, firstMovement]) => {
                            const groupMovements = movements.filter(
                                (m) => m.groupMovementId === groupId
                            );
                            const stats = groupStats?.get(groupId!);
                            const isGroupExpanded = expandedGroups.has(groupId!);
                            const hasActiveMovements =
                                stats && stats.active > 0 && isActive;
                            
                            if (__DEV__ && hasActiveMovements) {
                                console.log("Group header - Platform.OS:", Platform.OS, "hasActiveMovements:", hasActiveMovements, "stats:", stats);
                            }

                            return (
                                <View
                                    key={groupId}
                                    style={{
                                        backgroundColor: Colors.white,
                                        borderRadius: 12,
                                        padding: Platform.OS === "web" ? 12 : 10,
                                        shadowColor: sectionColor,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 3,
                                        borderWidth: 1,
                                        borderColor: sectionColor,
                                    }}
                                >
                                    {/* Header del grupo */}
                                    <View
                                        style={{
                                            flexDirection: isNarrow ? "column" : "row",
                                            alignItems: isNarrow ? "flex-start" : "center",
                                            justifyContent: "space-between",
                                            marginBottom: isGroupExpanded
                                                ? Platform.OS === "web"
                                                    ? 8
                                                    : 6
                                                : 0,
                                            paddingHorizontal:
                                                Platform.OS === "web" ? 12 : isNarrow ? 8 : 10,
                                            paddingVertical:
                                                Platform.OS === "web" ? 10 : 8,
                                            backgroundColor: isActive
                                                ? Colors.cremitLight
                                                : Colors.lightgreen,
                                            borderRadius: 8,
                                            borderLeftWidth: 5,
                                            borderLeftColor: sectionColor,
                                            gap: isNarrow ? 8 : 0,
                                            position: "relative",
                                        }}
                                        pointerEvents="box-none"
                                    >
                                        {/* Chevron siempre arriba a la derecha */}
                                        <Pressable
                                            onPress={() => onToggleGroup(groupId!)}
                                            style={{
                                                position: "absolute",
                                                top: Platform.OS === "web" ? 10 : 8,
                                                right: Platform.OS === "web" ? 12 : isNarrow ? 8 : 10,
                                                zIndex: 10,
                                            }}
                                        >
                                            <Ionicons
                                                name={
                                                    isGroupExpanded
                                                        ? "chevron-up-outline"
                                                        : "chevron-down-outline"
                                                }
                                                size={18}
                                                color={sectionColor}
                                            />
                                        </Pressable>

                                        <Pressable
                                            onPress={() => onToggleGroup(groupId!)}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                flex: 1,
                                                minWidth: 0,
                                                paddingRight: 30, // Espacio para el chevron
                                            }}
                                        >
                                            <Ionicons
                                                name="layers-outline"
                                                size={18}
                                                color={sectionColor}
                                            />
                                            <Text
                                                style={{
                                                    marginLeft: 8,
                                                    fontSize: 15,
                                                    fontWeight: "600",
                                                    color: sectionColor,
                                                    flexShrink: 1,
                                                }}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                Movimiento en grupo ({stats?.total || 0}{" "}
                                                piezas)
                                            </Text>
                                        </Pressable>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                marginLeft: isNarrow ? 0 : 8,
                                                marginRight: isNarrow ? 0 : 30, // Espacio para el chevron
                                                gap: 8,
                                            }}
                                        >
                                            {stats && (
                                                <>
                                                    {hasActiveMovements && (() => {
                                                        const isMobile = Platform.OS !== "web";
                                                        const bgColor = isMobile 
                                                            ? "#2d5016" // Verde oscuro para mobile - mejor contraste
                                                            : Colors.green; // Verde original para web
                                                        
                                                        console.log("Rendering Finalizar todos button - Platform.OS:", Platform.OS, "isMobile:", isMobile, "bgColor:", bgColor);
                                                        
                                                        return (
                                                            <View
                                                                style={{
                                                                    
                                                                    backgroundColor: bgColor,
                                                                    borderRadius: 8,
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    ...(isMobile && {
                                                                        borderWidth: 1,
                                                                        borderColor: "#1a3d0e",
                                                                        shadowColor: "#000",
                                                                        shadowOffset: { width: 0, height: 1 },
                                                                        shadowOpacity: 0.3,
                                                                        shadowRadius: 2,
                                                                        elevation: 3,
                                                                    }),
                                                                }}
                                                            >
                                                                <Pressable
                                                                    onPress={() =>
                                                                        onFinalizeGroup?.(groupId!)
                                                                    }
                                                                    style={({ pressed }) => ({
                                                                        paddingHorizontal: isVeryNarrow ? 8 : 10,
                                                                        paddingVertical: 4,
                                                                        borderRadius: 8,
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        gap: 4,
                                                                        opacity: pressed ? 0.7 : 1,
                                                                        flex: 1,
                                                                    })}
                                                                >
                                                                    <Ionicons
                                                                        name="checkmark-circle"
                                                                        size={14}
                                                                        color={Colors.cremit}
                                                                    />
                                                                    {!isVeryNarrow && (
                                                                        <Text
                                                                            style={{
                                                                                fontSize: 12,
                                                                                fontWeight: "600",
                                                                                color: Colors.cremit,
                                                                                flexShrink: 0,
                                                                            }}
                                                                        >
                                                                            Finalizar todos
                                                                        </Text>
                                                                    )}
                                                                </Pressable>
                                                            </View>
                                                        );
                                                    })()}
                                                    {stats.active > 0 && (
                                                        <View
                                                            style={{
                                                                backgroundColor: Colors.brown,
                                                                paddingHorizontal: isVeryNarrow ? 8 : 10,
                                                                paddingVertical: 4,
                                                                borderRadius: 12,
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: isVeryNarrow ? 11 : 13,
                                                                    fontWeight: "700",
                                                                    color: Colors.cremit,
                                                                }}
                                                            >
                                                                {stats.active}/{stats.total}{" "}
                                                                {!isVeryNarrow && "activas"}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {stats.finished > 0 && (
                                                        <View
                                                            style={{
                                                                backgroundColor: Colors.green,
                                                                paddingHorizontal: isVeryNarrow ? 8 : 10,
                                                                paddingVertical: 4,
                                                                borderRadius: 12,
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: isVeryNarrow ? 11 : 13,
                                                                    fontWeight: "700",
                                                                    color: Colors.cremit,
                                                                }}
                                                            >
                                                                {stats.finished}/{stats.total}{" "}
                                                                {!isVeryNarrow && "finalizadas"}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Movimientos del grupo */}
                                    {isGroupExpanded && (
                                        <View
                                            style={{
                                                marginTop: Platform.OS === "web" ? 8 : 6,
                                                paddingLeft: Platform.OS === "web" ? 8 : 6,
                                                borderLeftWidth: 2,
                                                borderLeftColor: isActive
                                                    ? Colors.cremitLight
                                                    : Colors.lightgreen,
                                                gap: Platform.OS === "web" ? 10 : 8,
                                            }}
                                        >
                                            {groupMovements.map((movement) =>
                                                movement.id ? (
                                                    <View
                                                        key={movement.id}
                                                        style={{
                                                            marginBottom:
                                                                Platform.OS === "web" ? 8 : 6,
                                                        }}
                                                    >
                                                        <MovementCard
                                                            movement={movement}
                                                            onViewDetails={() => {}}
                                                            onFinalize={onFinalize}
                                                            type="group"
                                                            groupSize={stats?.total}
                                                        />
                                                    </View>
                                                ) : null
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                </View>
            ) : (
                // Renderizar movimientos individuales
                <View style={{ gap: Platform.OS === "web" ? 12 : 10 }}>
                    {movements.map((movement) =>
                        movement.id ? (
                            <MovementCard
                                key={movement.id}
                                movement={movement}
                                onViewDetails={() => {}}
                                onFinalize={onFinalize}
                                type="single"
                            />
                        ) : null
                    )}
                </View>
            )}
        </View>
    );
};

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

    // Estados para controlar la expansión de las secciones
    const [isActiveSectionExpanded, setIsActiveSectionExpanded] = useState(true);
    const [isFinishedSectionExpanded, setIsFinishedSectionExpanded] = useState(true);

    // Estados para controlar la expansión de cada grupo
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    const getReturnDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const timezoneOffset = -now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
        const offsetMinutes = Math.abs(timezoneOffset) % 60;
        const offsetSign = timezoneOffset >= 0 ? "+" : "-";
        const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneString}`;
    };

    const handleFinalizeMovement = async (id: number) => {
        try {
            const movement = movements.find((m) => m.id === id);
            if (!movement) return;

            const returnDateTime = getReturnDateTime();
            const updateData = {
                ...movement,
                returnDate: returnDateTime,
                returnTime: returnDateTime,
            };

            await updateMovementMutation.mutateAsync({ id, payload: updateData });
            if (Platform.OS !== "web") {
                Alert.alert(
                    "Éxito",
                    "Movimiento finalizado correctamente. La pieza ha sido devuelta a su ubicación origen."
                );
            }
        } catch (error) {
            const errorMessage =
                (error as Error).message || "Error al finalizar el movimiento";
            if (Platform.OS !== "web") {
                Alert.alert("Error", errorMessage);
            }
            console.log("Error details:", error);
        }
    };

    const handleFinalizeGroup = async (groupId: number) => {
        try {
            const groupMovements = movements.filter(
                (m) => m.groupMovementId === groupId && !m.returnTime && m.id
            );

            if (groupMovements.length === 0) {
                if (Platform.OS !== "web") {
                    Alert.alert(
                        "Info",
                        "No hay movimientos activos en este grupo para finalizar."
                    );
                }
                return;
            }

            const finalizeMovements = async () => {
                const returnDateTime = getReturnDateTime();
                const promises = groupMovements.map((movement) => {
                    if (!movement.id) return Promise.resolve();
                    const updateData = {
                        ...movement,
                        returnDate: returnDateTime,
                        returnTime: returnDateTime,
                    };
                    return updateMovementMutation.mutateAsync({
                        id: movement.id,
                        payload: updateData,
                    });
                });

                try {
                    await Promise.all(promises);
                    if (Platform.OS !== "web") {
                        Alert.alert(
                            "Éxito",
                            `Se finalizaron ${groupMovements.length} movimiento${groupMovements.length > 1 ? "s" : ""} correctamente.`
                        );
                    }
                } catch (error) {
                    console.error("Error finalizing group:", error);
                    const errorMessage =
                        (error as Error).message || "Error al finalizar los movimientos";
                    if (Platform.OS !== "web") {
                        Alert.alert("Error", errorMessage);
                    }
                }
            };

            if (Platform.OS === "web") {
                const message = `¿Está seguro de que desea finalizar todos los movimientos activos de este grupo? (${groupMovements.length} movimiento${groupMovements.length > 1 ? "s" : ""})`;
                if (window.confirm(message)) {
                    await finalizeMovements();
                }
            } else {
                Alert.alert(
                    "Finalizar grupo",
                    `¿Está seguro de que desea finalizar todos los movimientos activos de este grupo? (${groupMovements.length} movimiento${groupMovements.length > 1 ? "s" : ""})`,
                    [
                        {
                            text: "Cancelar",
                            style: "cancel",
                        },
                        {
                            text: "Finalizar",
                            style: "destructive",
                            onPress: finalizeMovements,
                        },
                    ]
                );
            }
        } catch (error) {
            console.error("Error in handleFinalizeGroup:", error);
            const errorMessage =
                (error as Error).message || "Error al finalizar el grupo";
            if (Platform.OS !== "web") {
                Alert.alert("Error", errorMessage);
            }
        }
    };

    const toggleGroupExpansion = (groupId: number) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    // Agrupar movimientos por groupMovementId y calcular estadísticas
    const groupMovements = (
        movementsList: InternalMovement[],
        allMovements: InternalMovement[]
    ) => {
        const grouped = new Map<number | null, InternalMovement[]>();
        const ungrouped: InternalMovement[] = [];

        movementsList.forEach((movement) => {
            if (movement.groupMovementId != null) {
                const groupId = movement.groupMovementId;
                if (!grouped.has(groupId)) {
                    grouped.set(groupId, []);
                }
                grouped.get(groupId)!.push(movement);
            } else {
                ungrouped.push(movement);
            }
        });

        const groupStats = new Map<
            number,
            { total: number; active: number; finished: number }
        >();
        grouped.forEach((groupMovements, groupId) => {
            if (groupId !== null) {
                const allGroupMovements = allMovements.filter(
                    (m) => m.groupMovementId === groupId
                );
                const active = allGroupMovements.filter((m) => !m.returnTime).length;
                const finished = allGroupMovements.filter((m) => m.returnTime).length;
                groupStats.set(groupId, {
                    total: allGroupMovements.length,
                    active,
                    finished,
                });
            }
        });

        return { grouped, ungrouped, groupStats };
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

    const activeGrouped = groupMovements(activeMovements, movements);
    const finishedGrouped = groupMovements(finishedMovements, movements);

    // Separar grupos e individuales para activos
    const activeGroupMovements = Array.from(activeGrouped.grouped.values()).flat();
    const activeSingleMovements = activeGrouped.ungrouped;

    // Separar grupos e individuales para finalizados
    const finishedGroupMovements = Array.from(finishedGrouped.grouped.values()).flat();
    const finishedSingleMovements = finishedGrouped.ungrouped;

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
                <Navbar title="Movimientos Internos" showBackArrow redirectTo="/(tabs)/home" />
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
                <Navbar title="Movimientos Internos" showBackArrow redirectTo="/(tabs)/home" />
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
                        Error al cargar los movimientos: {(error as Error).message}
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
                    paddingHorizontal: Platform.OS === "web" ? 20 : 16,
                    paddingBottom: 24,
                    alignItems: Platform.OS === "web" ? "center" : "stretch",
                }}
            >
                <View
                    style={{
                        width: "100%",
                        maxWidth: 900,
                    }}
                >
                    {/* Botón para crear nuevo movimiento */}
                    <View style={{ paddingVertical: Platform.OS === "web" ? 20 : 16 }}>
                        <Button
                            title="Registrar Movimiento"
                            onPress={() => router.push("/(tabs)/internal-movements/New_movement")}
                            style={{ backgroundColor: "#6B705C" }}
                        />
                    </View>

                    {/* Estadísticas */}
                    <View style={{ marginBottom: Platform.OS === "web" ? 20 : 16 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                justifyContent: "space-around",
                                backgroundColor: "#F7F5F2",
                                borderRadius: 12,
                                padding: Platform.OS === "web" ? 15 : 12,
                                gap: Platform.OS === "web" ? 0 : 8,
                            }}
                        >
                            <View
                                style={{
                                    alignItems: "center",
                                    minWidth: Platform.OS === "web" ? undefined : 80,
                                    flex: Platform.OS === "web" ? undefined : 1,
                                }}
                            >
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
                            <View
                                style={{
                                    alignItems: "center",
                                    minWidth: Platform.OS === "web" ? undefined : 80,
                                    flex: Platform.OS === "web" ? undefined : 1,
                                }}
                            >
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
                            <View
                                style={{
                                    alignItems: "center",
                                    minWidth: Platform.OS === "web" ? undefined : 80,
                                    flex: Platform.OS === "web" ? undefined : 1,
                                }}
                            >
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
                    <View style={{ marginBottom: Platform.OS === "web" ? 30 : 24 }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setIsActiveSectionExpanded(!isActiveSectionExpanded)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: "#F7F5F2",
                                padding: Platform.OS === "web" ? 15 : 12,
                                borderRadius: 12,
                                marginBottom: Platform.OS === "web" ? 15 : 12,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
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
                                    Movimientos Activos ({activeMovements.length})
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

                        {isActiveSectionExpanded && (
                            <>
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
                                            No hay movimientos activos
                                        </Text>
                                    </View>
                                ) : (
                                    <>

                                        {/* Movimientos en grupo */}
                                        <MovementSection
                                            title="Movimientos en grupo"
                                            movements={activeGroupMovements}
                                            variant="group"
                                            status="active"
                                            onFinalize={handleFinalizeMovement}
                                            onFinalizeGroup={handleFinalizeGroup}
                                            groupStats={activeGrouped.groupStats}
                                            expandedGroups={expandedGroups}
                                            onToggleGroup={toggleGroupExpansion}
                                        />

                                        {/* Movimientos individuales */}
                                        <MovementSection
                                            title="Movimientos individuales"
                                            movements={activeSingleMovements}
                                            variant="single"
                                            status="active"
                                            onFinalize={handleFinalizeMovement}
                                            expandedGroups={expandedGroups}
                                            onToggleGroup={toggleGroupExpansion}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </View>

                    {/* Movimientos Finalizados */}
                    <View style={{ marginBottom: Platform.OS === "web" ? 30 : 24 }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() =>
                                setIsFinishedSectionExpanded(!isFinishedSectionExpanded)
                            }
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: "#F7F5F2",
                                padding: Platform.OS === "web" ? 15 : 12,
                                borderRadius: 12,
                                marginBottom: Platform.OS === "web" ? 15 : 12,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
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
                                    Movimientos Finalizados ({finishedMovements.length})
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

                        {isFinishedSectionExpanded && (
                            <>
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
                                    <>

                                        {/* Movimientos en grupo */}
                                        <MovementSection
                                            title="Movimientos en grupo"
                                            movements={finishedGroupMovements}
                                            variant="group"
                                            status="finished"
                                            onFinalize={handleFinalizeMovement}
                                            groupStats={finishedGrouped.groupStats}
                                            expandedGroups={expandedGroups}
                                            onToggleGroup={toggleGroupExpansion}
                                        />

                                        {/* Movimientos individuales */}
                                        <MovementSection
                                            title="Movimientos individuales"
                                            movements={finishedSingleMovements}
                                            variant="single"
                                            status="finished"
                                            onFinalize={handleFinalizeMovement}
                                            expandedGroups={expandedGroups}
                                            onToggleGroup={toggleGroupExpansion}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
