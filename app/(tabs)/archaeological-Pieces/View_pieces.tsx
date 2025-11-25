// app/(tabs)/archaeological-Pieces/View_pieces.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import FiltersBar, { FilterValues } from "../../../components/ui/FiltersBar";
import InfoRow from "../../../components/ui/InfoRow";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

import type { ArtefactSummary } from "@/repositories/artefactRepository";
import {
    useArtefactSummaries,
    useDeleteArtefact,
} from "../../../hooks/useArtefact";
import { getShelfLabel, getShelfShortLabel } from "@/utils/shelfLabels";

// Tipo extendido para incluir campos adicionales que se usan en la UI
type Piece = ArtefactSummary & {
    site?: string;
    archaeologist?: string;
    collection?: string;
    shelfText?: string;
    levelText?: string;
    columnText?: string;
};

export default function ViewPieces() {
    const router = useRouter();
    const params = useLocalSearchParams() as any;

    const shelfIdParam = params?.shelfId ?? params?.shelfid ?? params?.shelfID;
    const shelfIdNum = shelfIdParam != null ? Number(shelfIdParam) : undefined;

    const hasShelfId =
        typeof shelfIdNum === "number" && !Number.isNaN(shelfIdNum);
    const hasLevel = params?.level != null;
    const hasColumn = params?.column != null;

    // opcional: si te pasan el label desde la screen anterior
    const rawShelfLabel =
        (params?.shelfLabel as string | undefined) ??
        (hasShelfId ? `Estante ${shelfIdNum}` : undefined);

    // Simplificar navegación: usar router.back() por defecto como en View_piece.tsx
    // Solo forzar ruta específica en casos muy particulares
    const backRoute = undefined; // Esto hará que Navbar use router.back() → animación slide_from_left correcta

    const { data, isLoading, isError, refetch } = useArtefactSummaries(
        typeof shelfIdNum === "number" && !Number.isNaN(shelfIdNum)
            ? { shelfId: shelfIdNum }
            : undefined
    );

    const deleteMutation = useDeleteArtefact();

    // Estado consolidado de filtros
    const [filters, setFilters] = useState<FilterValues>({
        name: "",
        material: "",
        collection: "",
        site: "",
        shelf: "",
        shelfLevel: "",
        shelfColumn: "",
        internalClassifierName: "",
        internalClassifierNumber: "",
    });

    // Estado para el menú desplegable
    const [menuVisible, setMenuVisible] = useState<string | null>(null);
    // Estado para rastrear si hay un dropdown de filtros abierto
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Inicializar filtros desde params cuando se navega desde shelf-detail
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            ...(params?.level && { shelfLevel: String(params.level) }),
            ...(params?.column && { shelfColumn: String(params.column) }),
            ...(shelfIdParam && { shelf: String(shelfIdParam) }),
        }));
    }, [params?.level, params?.column, shelfIdParam]);

    const isWeb = Platform.OS === "web";
    const isMobile = Platform.OS === "android" || Platform.OS === "ios";

    // Debounce para el filtro de nombre (mantener compatibilidad con lógica existente)
    const [query, setQuery] = useState("");
    useEffect(() => {
        const handle = setTimeout(() => {
            setQuery(filters.name);
        }, 250);

        return () => clearTimeout(handle);
    }, [filters.name]);

    // 🔥 IMPORTANTE: eliminamos el listener global de click-outside en web
    // porque puede interferir con los onPress del menú.
    // Si en el futuro querés volver a implementarlo, conviene hacerlo con
    // un overlay/Portal en lugar de document.addEventListener.

    const pieces: Piece[] = useMemo(() => {
        const list = (data ?? []) as ArtefactSummary[];

        return list.map((a) => {
            const site = a.archaeologicalSiteName ?? undefined;
            const archaeologist = a.archaeologistName ?? undefined;
            const collection = a.collectionName ?? undefined;

            const shelfText =
                a.shelfCode == null
                    ? undefined
                    : getShelfLabel(a.shelfCode);
            const levelText =
                a.level == null ? undefined : `Nivel ${String(a.level)}`;
            const columnText =
                a.column == null ? undefined : `Columna ${String(a.column)}`;

            return {
                ...a,
                site,
                archaeologist,
                collection,
                shelfText,
                levelText,
                columnText,
            };
        });
    }, [data]);

    const handleEdit = (id: number) => {
        setMenuVisible(null);
        router.push({
            pathname: "/(tabs)/archaeological-Pieces/Edit_piece",
            params: { id: String(id) },
        });
    };

    const handleDelete = (id: number) => {
        setMenuVisible(null);

        const piece = pieces.find((p) => p.id === id);
        const pieceName = piece?.name || "esta pieza";

        const doDelete = () => {
            console.log("Iniciando eliminación de pieza con ID:", id);
            deleteMutation.mutate(id, {
                onSuccess: (data) => {
                    console.log("Eliminación exitosa:", data);
                    Alert.alert("Éxito", "Pieza eliminada correctamente.");
                },
                onError: (error) => {
                    console.error("Error en eliminación:", error);
                    const errorMessage =
                        (error as Error).message ||
                        "Error al eliminar la pieza.";
                    Alert.alert("Error", errorMessage);
                },
            });
        };

        Alert.alert(
            "Confirmar acción",
            `¿Estás seguro que deseas eliminar ${pieceName}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", style: "destructive", onPress: doDelete },
            ]
        );
    };

    const filtered = useMemo(() => {
        return pieces.filter((p) => {
            // Nombre
            if (query && !p.name.toLowerCase().includes(query.toLowerCase()))
                return false;

            // Material (filtrado por "empieza con" para permitir búsqueda parcial)
            if (filters.material.trim() !== "") {
                const pieceMaterial = (p.material || "").trim().toLowerCase();
                const filterMaterial = filters.material.trim().toLowerCase();
                if (!pieceMaterial.startsWith(filterMaterial)) return false;
            }

            // Colección (filtrado por "empieza con" para permitir búsqueda parcial)
            if (filters.collection.trim() !== "") {
                const pieceCollection = (p.collection || "")
                    .trim()
                    .toLowerCase();
                const filterCollection = filters.collection
                    .trim()
                    .toLowerCase();
                if (!pieceCollection.startsWith(filterCollection)) return false;
            }

            // Sitio arqueológico (filtrado por "empieza con" para permitir búsqueda parcial)
            if (filters.site.trim() !== "") {
                const pieceSite = (p.site || "").trim().toLowerCase();
                const filterSite = filters.site.trim().toLowerCase();
                if (!pieceSite.startsWith(filterSite)) return false;
            }

            // ====== ESTANTERÍA (busca por código numérico o por etiqueta) ======
            if (filters.shelf.trim() !== "") {
                const filterValue = filters.shelf.trim().toUpperCase();
                const pieceShelfCode = p.shelfCode;
                
                if (pieceShelfCode == null) return false;
                
                // Obtener la etiqueta de la pieza
                const pieceLabel = getShelfLabel(pieceShelfCode).toUpperCase();
                const pieceShortLabel = getShelfShortLabel(pieceShelfCode).toUpperCase();
                const pieceCode = String(pieceShelfCode);
                
                // Buscar por código numérico, etiqueta completa o etiqueta corta
                const matchesCode = pieceCode === filterValue;
                const matchesLabel = pieceLabel.includes(filterValue);
                const matchesShortLabel = pieceShortLabel.includes(filterValue);
                
                if (!matchesCode && !matchesLabel && !matchesShortLabel) {
                    return false;
                }
            }

            // ====== NIVEL (solo número) ======
            if (filters.shelfLevel.trim() !== "") {
                const levelText = p.levelText || "";
                const pieceLevel = levelText.match(/\d+/)?.[0]; // número en "Nivel 1"

                if (!pieceLevel || pieceLevel !== filters.shelfLevel.trim())
                    return false;
            }

            // ====== COLUMNA (letra A-D) ======
            if (filters.shelfColumn.trim() !== "") {
                const colFiltro = filters.shelfColumn.toUpperCase().trim(); // A/B/C/D
                const colPieza = (p.columnText || "")
                    .toUpperCase()
                    .replace(/COLUMNA/i, "")
                    .trim(); // A/B/C/D

                if (!colPieza || colPieza !== colFiltro) return false;
            }

            return true;
        });
    }, [pieces, query, filters]);

    const MAX_CONTENT_WIDTH = 1400;

    // Handler para limpiar todos los filtros
    const handleClearFilters = () => {
        setFilters({
            name: "",
            material: "",
            collection: "",
            site: "",
            shelf: "",
            shelfLevel: "",
            shelfColumn: "",
            internalClassifierName: "",
            internalClassifierNumber: "",
        });
    };

    // ==================== VISTA WEB ====================
    const webListHeader = (
        <View
            style={{
                width: "90%",
                maxWidth: MAX_CONTENT_WIDTH,
                padding: 32,
                alignSelf: "center",
                // NO usar position: relative ni z-index aquí para evitar crear un nuevo stacking context
                // que limite el z-index del dropdown dentro de FiltersBar
            }}
        >
            <Button
                title="REGISTRAR PIEZA ARQUEOLÓGICA"
                className="bg-[#6B705C] rounded-xl py-5 px-8 items-center mb-8 shadow-lg"
                textClassName="text-white text-base font-bold tracking-wider"
                onPress={() =>
                    router.push("/(tabs)/archaeological-Pieces/New_piece")
                }
            />

            {/* Componente de filtros mejorado */}
            <FiltersBar
                filters={filters}
                onFilterChange={setFilters}
                pieces={pieces}
                onClear={handleClearFilters}
                onDropdownOpenChange={setIsDropdownOpen}
            />

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 24,
                    marginBottom: 24,
                    paddingLeft: 4,
                    // Deshabilitar pointer events cuando hay un dropdown abierto para que no intercepte los clics
                    // @ts-ignore - Web-only style
                    pointerEvents: isDropdownOpen ? "none" : "auto",
                    // Z-index explícito y bajo para asegurar que quede por detrás del dropdown (z-index: 100000)
                    // @ts-ignore - Web-only style
                    position: "relative" as any,
                    // @ts-ignore - Web-only style
                    zIndex: 1,
                }}
            >
                <Ionicons
                    name="checkbox-outline"
                    size={20}
                    color="#6B705C"
                    style={{ marginRight: 8 }}
                />
                <Text
                    style={{
                        color: "#555",
                        fontWeight: "700",
                        fontSize: 16,
                        letterSpacing: 0.5,
                    }}
                >
                    {filtered.length} PIEZAS ENCONTRADAS
                </Text>
            </View>
        </View>
    );

    // ==================== RENDER WEB ====================
    const renderWebView = () => {
        const webRenderPiece = ({ item }: { item: Piece }) => {
            const p = item;
            return (
                <View style={{ flex: 1, minWidth: 0, marginBottom: 24 }}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/(tabs)/archaeological-Pieces/View_piece?id=${p.id}`
                            )
                        }
                        activeOpacity={0.9}
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 16,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: "#E8DFD0",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 16,
                            position: "relative",
                            overflow: "hidden",
                            minWidth: 0,
                        }}
                        // @ts-ignore - Web-only hover effects
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.transform =
                                "translateY(-6px)";
                            e.currentTarget.style.shadowOpacity = "0.16";
                            e.currentTarget.style.borderColor = "#6B705C";
                        }}
                        // @ts-ignore
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.shadowOpacity = "0.08";
                            e.currentTarget.style.borderColor = "#E8DFD0";
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 26,
                                        fontWeight: "700",
                                        marginBottom: 16,
                                        fontFamily: "CrimsonText-Regular",
                                        color: "#2c2c2c",
                                        letterSpacing: 0.3,
                                        lineHeight: 32,
                                    }}
                                >
                                    {p.name}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 10,
                                        marginBottom: 18,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Badge
                                        text={p.shelfText || ""}
                                        background={Colors.green}
                                        textColor={Colors.cremit}
                                    />
                                    <Badge
                                        text={p.levelText || ""}
                                        background={Colors.brown}
                                        textColor={Colors.cremit}
                                    />
                                    <Badge
                                        text={p.columnText || ""}
                                        background={Colors.black}
                                        textColor={Colors.cremit}
                                    />
                                </View>

                                <View style={{ gap: 10 }}>
                                    <InfoRow
                                        icon="cube-outline"
                                        label="MATERIAL"
                                        value={p.material || ""}
                                    />
                                    <InfoRow
                                        icon="location-outline"
                                        label="SITIO ARQUEOLOGICO"
                                        value={p.site || ""}
                                    />
                                    <InfoRow
                                        icon="person-outline"
                                        label="ARQUEOLOGO"
                                        value={p.archaeologist || ""}
                                    />
                                    <InfoRow
                                        icon="archive-outline"
                                        label="COLECCION"
                                        value={p.collection || ""}
                                    />
                                </View>
                            </View>

                            <View
                                style={{
                                    marginLeft: 12,
                                    alignItems: "center",
                                    position: "relative",
                                }}
                                // @ts-ignore - Web-only attribute para el contenedor del menú
                                data-menu-container={isWeb ? true : undefined}
                            >
                                <TouchableOpacity
                                    onPress={(e: any) => {
                                        // @ts-ignore RN synthetic event
                                        e.stopPropagation?.();
                                        if (p.id) {
                                            setMenuVisible(
                                                menuVisible === String(p.id)
                                                    ? null
                                                    : String(p.id)
                                            );
                                        }
                                    }}
                                    style={{
                                        padding: 6,
                                        borderRadius: 20,
                                        backgroundColor: "#F8F9FA",
                                        borderWidth: 1,
                                        borderColor: "#E8E8E8",
                                    }}
                                    activeOpacity={0.7}
                                    accessibilityLabel={`Opciones para pieza ${p.name}`}
                                >
                                    <Ionicons
                                        name="ellipsis-vertical"
                                        size={18}
                                        color={Colors.black}
                                    />
                                </TouchableOpacity>

                                {menuVisible === String(p.id) && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            top: 40,
                                            right: 8,
                                            backgroundColor: "white",
                                            borderRadius: 8,
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: 2,
                                            },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 4,
                                            elevation: 10,
                                            zIndex: 1000,
                                            width: 140,
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={(e: any) => {
                                                e.stopPropagation?.();
                                                handleEdit(p.id!);
                                            }}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                padding: 12,
                                                borderBottomWidth: 1,
                                                borderBottomColor: "#e0e0e0",
                                            }}
                                        >
                                            <Ionicons
                                                name="create-outline"
                                                size={16}
                                                color={Colors.brown}
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    color: Colors.brown,
                                                }}
                                            >
                                                Editar
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={(e: any) => {
                                                e.stopPropagation?.();
                                                handleDelete(p.id!);
                                            }}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                padding: 12,
                                            }}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={16}
                                                color={Colors.brown}
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    color: Colors.brown,
                                                }}
                                            >
                                                Eliminar
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        };

        return (
            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={webRenderPiece}
                ListHeaderComponent={webListHeader}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => setMenuVisible(null)}
                extraData={menuVisible}
                numColumns={3}
                columnWrapperStyle={{
                    width: "90%",
                    maxWidth: MAX_CONTENT_WIDTH,
                    alignSelf: "center",
                    justifyContent: "flex-start",
                    gap: 20,
                    paddingHorizontal: 4,
                }}
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
            />
        );
    };

    // ==================== RENDER MOBILE ====================
    const renderMobileView = () => {
        const mobileListHeader = (
            <View style={{ padding: 16 }}>
                <Button
                    title="REGISTRAR PIEZA ARQUEOLÓGICA"
                    className="bg-[#6B705C] rounded-lg py-3 items-center mb-6"
                    textClassName="text-white"
                    onPress={() =>
                        router.push("/(tabs)/archaeological-Pieces/New_piece")
                    }
                />

                {/* Componente de filtros mejorado */}
                <FiltersBar
                    filters={filters}
                    onFilterChange={setFilters}
                    pieces={pieces}
                    onClear={handleClearFilters}
                    onDropdownOpenChange={setIsDropdownOpen}
                />

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16,
                        marginTop: 8,
                        // Deshabilitar pointer events cuando hay un dropdown abierto para que no intercepte los clics
                        // @ts-ignore - Web-only style
                        pointerEvents: isDropdownOpen ? "none" : "auto",
                        // Asegurar que este div tenga un z-index bajo para que quede por detrás del dropdown (z-index del dropdown es 10000)
                        // @ts-ignore - Web-only style
                        position: "relative" as any,
                        // @ts-ignore - Web-only style
                        zIndex: 0,
                    }}
                >
                    <Text
                        style={{
                            color: "#222",
                            fontWeight: "700",
                            fontSize: 14,
                        }}
                    >
                        {filtered.length} PIEZAS ENCONTRADAS
                    </Text>
                </View>
            </View>
        );

        const mobileRenderPiece = ({ item }: { item: Piece }) => {
            const p = item;
            return (
                <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/(tabs)/archaeological-Pieces/View_piece?id=${p.id}`
                            )
                        }
                        activeOpacity={0.9}
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#e6dac4",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: "700",
                                        marginBottom: 10,
                                        fontFamily: "CrimsonText-Regular",
                                        color: "#2c2c2c",
                                    }}
                                >
                                    {p.name}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        marginBottom: 12,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Badge
                                        text={p.shelfText || ""}
                                        background={Colors.green}
                                        textColor={Colors.cremit}
                                    />
                                    <Badge
                                        text={p.levelText || ""}
                                        background={Colors.brown}
                                        textColor={Colors.cremit}
                                    />
                                    <Badge
                                        text={p.columnText || ""}
                                        background={Colors.black}
                                        textColor={Colors.cremit}
                                    />
                                </View>

                                <View style={{ gap: 8 }}>
                                    <InfoRow
                                        icon="cube-outline"
                                        label="MATERIAL"
                                        value={p.material || ""}
                                    />
                                    <InfoRow
                                        icon="location-outline"
                                        label="SITIO ARQUEOLOGICO"
                                        value={p.site || ""}
                                    />
                                    {p.archaeologist && (
                                        <InfoRow
                                            icon="person-outline"
                                            label="ARQUEOLOGO"
                                            value={p.archaeologist}
                                        />
                                    )}
                                    {p.collection && (
                                        <InfoRow
                                            icon="archive-outline"
                                            label="COLECCION"
                                            value={p.collection}
                                        />
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={(e: any) => {
                                    // @ts-ignore RN synthetic event
                                    e.stopPropagation?.();
                                    if (p.id) {
                                        setMenuVisible(
                                            menuVisible === String(p.id)
                                                ? null
                                                : String(p.id)
                                        );
                                    }
                                }}
                                style={{
                                    padding: 8,
                                    borderRadius: 20,
                                    backgroundColor: "#F8F9FA",
                                    borderWidth: 1,
                                    borderColor: "#E8E8E8",
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="ellipsis-vertical"
                                    size={20}
                                    color={Colors.black}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    <Modal
                        visible={menuVisible === String(p.id)}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setMenuVisible(null)}
                    >
                        <Pressable
                            style={{
                                flex: 1,
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            onPress={() => setMenuVisible(null)}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View
                                    style={{
                                        backgroundColor: "white",
                                        borderRadius: 16,
                                        minWidth: 200,
                                        borderWidth: 1,
                                        borderColor: "#E8E8E8",
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 12,
                                        elevation: 10,
                                        overflow: "hidden",
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleEdit(p.id!)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: 16,
                                            borderBottomWidth: 1,
                                            borderBottomColor:
                                                Colors.lightbrown,
                                        }}
                                    >
                                        <Ionicons
                                            name="pencil"
                                            size={20}
                                            color={Colors.green}
                                        />
                                        <Text
                                            style={{
                                                marginLeft: 12,
                                                fontSize: 16,
                                                color: Colors.black,
                                            }}
                                        >
                                            Editar
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDelete(p.id!)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: 16,
                                            backgroundColor: "#FFF5F5",
                                            borderBottomLeftRadius: 16,
                                            borderBottomRightRadius: 16,
                                        }}
                                    >
                                        <Ionicons
                                            name="trash"
                                            size={20}
                                            color={Colors.brown}
                                        />
                                        <Text
                                            style={{
                                                marginLeft: 12,
                                                fontSize: 16,
                                                color: Colors.brown,
                                            }}
                                        >
                                            Eliminar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        </Pressable>
                    </Modal>
                </View>
            );
        };

        return (
            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={mobileRenderPiece}
                ListHeaderComponent={mobileListHeader}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => setMenuVisible(null)}
                extraData={menuVisible}
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
                // Permitir scroll anidado - ambos scrolls pueden funcionar simultáneamente
                nestedScrollEnabled={true}
            />
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.cream }}>
            <Navbar title="Piezas arqueologicas" showBackArrow />

            {isLoading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator />
                </View>
            ) : isError ? (
                <View style={{ padding: 16 }}>
                    <Text style={{ color: "#b00020", marginBottom: 8 }}>
                        Ocurrió un error al cargar las piezas.
                    </Text>
                    <Button title="Reintentar" onPress={() => refetch()} />
                </View>
            ) : isMobile ? (
                renderMobileView()
            ) : (
                renderWebView()
            )}
        </View>
    );
}
