import Colors from "@/constants/Colors";
import { Loan } from "@/repositories/loanRepository";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import SearchableSelect from "./SearchableSelect";

// Tipos para los filtros de préstamos
export interface LoanFilterValues {
    artifactName: string;
    requesterName: string;
}

interface LoanFiltersBarProps {
    // Valores actuales de los filtros
    filters: LoanFilterValues;
    // Callbacks para actualizar filtros
    onFilterChange: (filters: LoanFilterValues) => void;
    // Datos para extraer opciones únicas
    loans: Loan[];
    // Callback para limpiar filtros
    onClear: () => void;
    // Callback opcional para notificar cuando un dropdown está abierto
    onDropdownOpenChange?: (isOpen: boolean) => void;
}

export default function LoanFiltersBar({
    filters,
    onFilterChange,
    loans,
    onClear,
    onDropdownOpenChange,
}: LoanFiltersBarProps) {
    const isWeb = Platform.OS === "web";
    const isMobile = Platform.OS === "android" || Platform.OS === "ios";
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [openSelectId, setOpenSelectId] = useState<string | null>(null);

    // Notificar cuando el estado del dropdown cambia
    useEffect(() => {
        onDropdownOpenChange?.(openSelectId !== null);
    }, [openSelectId, onDropdownOpenChange]);

    // Extraer nombres únicos de solicitantes
    const uniqueRequesters = useMemo(() => {
        const requesters = new Set<string>();
        loans.forEach((loan) => {
            if (loan.requester) {
                const fullName =
                    `${loan.requester.firstname || ""} ${loan.requester.lastname || ""}`.trim();
                if (fullName) {
                    requesters.add(fullName);
                }
            }
        });
        return Array.from(requesters).sort();
    }, [loans]);

    // Contar filtros activos
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.artifactName.trim()) count++;
        if (filters.requesterName.trim()) count++;
        return count;
    }, [filters]);

    // Handlers para actualizar filtros individuales
    const updateFilter = (key: keyof LoanFilterValues, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value,
        });
    };

    // Estilos compartidos para inputs de texto
    const inputStyle = {
        backgroundColor: isWeb ? "#FAFAF8" : "#F7F5F2",
        borderRadius: isWeb ? 10 : 8,
        padding: isWeb ? 15 : 12,
        fontSize: isWeb ? 15 : 14,
        borderWidth: 1,
        borderColor: "#E8DFD0",
        fontWeight: "500" as const,
    };

    // Estilos para los selects buscables
    const selectStyle = {
        width: "100%",
    };

    // Contenedor principal de filtros
    const filtersContent = (
        <View
            style={{
                display: isWeb ? ("grid" as any) : "flex",
                gridTemplateColumns: isWeb ? "1fr 1fr" : undefined,
                gap: isWeb ? 16 : 12,
                flexDirection: isMobile ? "column" : undefined,
            }}
        >
            {/* Filtrar por nombre de pieza */}
            <TextInput
                placeholder="Filtrar por nombre de pieza"
                value={filters.artifactName}
                onChangeText={(text) => updateFilter("artifactName", text)}
                style={inputStyle}
            />

            {/* Dropdown buscable para solicitante */}
            <SearchableSelect
                value={filters.requesterName}
                onChange={(value) => updateFilter("requesterName", value)}
                options={uniqueRequesters}
                placeholder="Filtrar por solicitante"
                style={selectStyle}
                selectId="requesterName"
                openSelectId={openSelectId}
                onOpenChange={setOpenSelectId}
            />
        </View>
    );

    // Botón de limpiar filtros
    const actionButtons = (
        <View
            style={{
                flexDirection: "row",
                gap: 12,
                marginTop: isWeb ? 16 : 12,
                justifyContent: "flex-start",
                opacity: openSelectId ? 0 : 1,
                pointerEvents: openSelectId ? "none" : "auto",
            }}
        >
            <TouchableOpacity
                onPress={onClear}
                style={{
                    flex: isMobile ? 1 : undefined,
                    backgroundColor: "transparent",
                    borderRadius: isWeb ? 10 : 8,
                    paddingVertical: isWeb ? 10 : 8,
                    paddingHorizontal: isWeb ? 20 : 12,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: Colors.brown,
                }}
            >
                <Text
                    style={{
                        color: Colors.brown,
                        fontSize: isWeb ? 14 : 12,
                        fontWeight: "600",
                    }}
                >
                    Limpiar filtros
                </Text>
            </TouchableOpacity>
        </View>
    );

    // Obtener filtros activos para mostrar en chips
    const activeFilters = useMemo(() => {
        const active: Array<{
            key: keyof LoanFilterValues;
            label: string;
            value: string;
        }> = [];
        if (filters.artifactName.trim()) {
            active.push({
                key: "artifactName",
                label: "Pieza",
                value: filters.artifactName,
            });
        }
        if (filters.requesterName.trim()) {
            active.push({
                key: "requesterName",
                label: "Solicitante",
                value: filters.requesterName,
            });
        }
        return active;
    }, [filters]);

    // Handler para limpiar un filtro individual
    const handleClearSingleFilter = (key: keyof LoanFilterValues) => {
        updateFilter(key, "");
    };

    // Vista Desktop
    if (isWeb) {
        return (
            <View
                style={{
                    marginBottom: 16,
                    position: "relative",
                    overflow: "visible",
                    zIndex: 10,
                }}
            >
                {/* Contenedor principal de filtros */}
                <View
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    {filtersContent}
                    {actionButtons}
                </View>

                {/* Chips de filtros activos */}
                {activeFilters.length > 0 && (
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 12,
                        }}
                    >
                        {activeFilters.map((filter) => (
                            <View
                                key={filter.key}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: "#E8F4FD",
                                    borderRadius: 20,
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    gap: 6,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: "#6B705C",
                                        fontWeight: "500",
                                    }}
                                >
                                    {filter.label}: {filter.value}
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        handleClearSingleFilter(filter.key)
                                    }
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: 8,
                                        backgroundColor: "#6B705C",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons
                                        name="close"
                                        size={10}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // Vista Mobile
    return (
        <View
            style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                overflow: "hidden",
            }}
        >
            {/* Botón toggle para mostrar/ocultar filtros */}
            <TouchableOpacity
                onPress={() => setIsMobileExpanded(!isMobileExpanded)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    backgroundColor: "#FFFFFF",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Ionicons name="funnel-outline" size={18} color="#6B705C" />
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#6B705C",
                        }}
                    >
                        Filtros
                    </Text>
                    {activeFiltersCount > 0 && (
                        <View
                            style={{
                                backgroundColor: "#6B705C",
                                borderRadius: 10,
                                width: 20,
                                height: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: 4,
                            }}
                        >
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: 11,
                                    fontWeight: "bold",
                                }}
                            >
                                {activeFiltersCount}
                            </Text>
                        </View>
                    )}
                </View>
                <Ionicons
                    name={isMobileExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B705C"
                />
            </TouchableOpacity>

            {/* Contenido de filtros (colapsable) */}
            {isMobileExpanded && (
                <View style={{ padding: 12, paddingTop: 0 }}>
                    {filtersContent}
                    {actionButtons}
                </View>
            )}
        </View>
    );
}
