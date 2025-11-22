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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import InfoRow from "../../../components/ui/InfoRow";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

import type { ArtefactSummary } from "@/repositories/artefactRepository";
import {
  useArtefactSummaries,
  useDeleteArtefact,
} from "../../../hooks/useArtefact";

// Tipo extendido para incluir campos adicionales que se usan en la UI
type Piece = ArtefactSummary & {
  site?: string;
  archaeologist?: string;
  collection?: string;
  shelf?: string;
  levelLabel?: string;
  columnLabel?: string;
};

export default function ViewPieces() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;

  const shelfIdParam = params?.shelfId ?? params?.shelfid ?? params?.shelfID;
  // Convert shelfId from query params (string) to number before sending to the backend
  const shelfIdNum = shelfIdParam != null ? Number(shelfIdParam) : undefined;

  // Si viene con shelfId, viene del DepositMap, sino de la lista normal de piezas
  const backRoute = shelfIdNum !== undefined ? "/(tabs)/archaeological-Pieces/deposit-map" : "/(tabs)/archaeological-Pieces";

  const { data, isLoading, isError, refetch } = useArtefactSummaries(
    typeof shelfIdNum === "number" && !Number.isNaN(shelfIdNum)
      ? { shelfId: shelfIdNum }
      : undefined
  );

  const deleteMutation = useDeleteArtefact();

  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [filterSite, setFilterSite] = useState("");

  // filtros de ubicación
  const [filterShelf, setFilterShelf] = useState(""); // SOLO número de estante
  const [filterShelfLevel, setFilterShelfLevel] = useState(""); // SOLO número de nivel
  const [filterShelfColumn, setFilterShelfColumn] = useState(""); // letra A-D

  // Estado para el menú desplegable
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  // Inicializar filtros desde params cuando se navega desde shelf-detail
  useEffect(() => {
    if (params?.level) {
      setFilterShelfLevel(String(params.level));
    }
    if (params?.column) {
      setFilterShelfColumn(String(params.column));
    }
    if (shelfIdParam) {
      setFilterShelf(String(shelfIdParam));
    }
  }, [params?.level, params?.column, shelfIdParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(rawQuery);
    }, 250);

    return () => clearTimeout(handle);
  }, [rawQuery]);

  const pieces: Piece[] = useMemo(() => {
    const list = (data ?? []) as ArtefactSummary[];

    return list.map((a) => {
      const site = a.archaeologicalSiteName ?? undefined;
      const archaeologist = a.archaeologistName ?? undefined;
      const collection = a.collectionName ?? undefined;

      const shelf =
        a.shelfCode == null ? undefined : `Estantería ${String(a.shelfCode)}`;
      const levelLabel = a.level == null ? undefined : `Nivel ${String(a.level)}`;
      const columnLabel = a.column == null ? undefined : `Columna ${String(a.column)}`;

      return {
        ...a,
        site,
        archaeologist,
        collection,
        shelf,
        levelLabel,
        columnLabel,
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
            (error as Error).message || "Error al eliminar la pieza.";
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

      // Material
      if (
        filterMaterial &&
        !(p.material || "").toLowerCase().includes(filterMaterial.toLowerCase())
      )
        return false;

      // Colección
      if (
        filterCollection &&
        !(p.collection || "")
          .toLowerCase()
          .includes(filterCollection.toLowerCase())
      )
        return false;

      // Sitio arqueológico
      if (
        filterSite &&
        !(p.site || "").toLowerCase().includes(filterSite.toLowerCase())
      )
        return false;

      // ====== ESTANTERÍA (solo número) ======
      if (filterShelf.trim() !== "") {
        const shelfText = p.shelf || "";
        const pieceNum = shelfText.match(/\d+/)?.[0]; // número en "Estantería 1"

        if (!pieceNum || pieceNum !== filterShelf.trim()) return false;
      }

      // ====== NIVEL (solo número) ======
      if (filterShelfLevel.trim() !== "") {
        const levelText = p.levelLabel || "";
        const pieceLevel = levelText.match(/\d+/)?.[0]; // número en "Nivel 1"

        if (!pieceLevel || pieceLevel !== filterShelfLevel.trim()) return false;
      }

      // ====== COLUMNA (letra A-D) ======
      if (filterShelfColumn.trim() !== "") {
        const colFiltro = filterShelfColumn.toUpperCase().trim(); // A/B/C/D
        const colPieza = (p.columnLabel || "")
          .toUpperCase()
          .replace(/COLUMNA/i, "")
          .trim(); // A/B/C/D

        if (!colPieza || colPieza !== colFiltro) return false;
      }

      return true;
    });
  }, [
    pieces,
    query,
    filterMaterial,
    filterCollection,
    filterSite,
    filterShelf,
    filterShelfLevel,
    filterShelfColumn,
  ]);

  const isWeb = Platform.OS === "web";
  const isMobile = Platform.OS === "android" || Platform.OS === "ios";
  const MAX_CONTENT_WIDTH = 1400;

  // ==================== VISTA WEB ====================
  const webListHeader = (
    <View
      style={{
        width: "90%",
        maxWidth: MAX_CONTENT_WIDTH,
        padding: 32,
        alignSelf: "center",
      }}
    >
      <Button
        title="REGISTRAR PIEZA ARQUEOLÓGICA"
        className="bg-[#6B705C] rounded-xl py-5 px-8 items-center mb-8 shadow-lg"
        textClassName="text-white text-base font-bold tracking-wider"
        onPress={() => router.push("/(tabs)/archaeological-Pieces/New_piece")}
      />

      <View
        style={{
          display: "grid" as any,
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 32,
          padding: 28,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#E8DFD0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="filter"
            size={22}
            color="#6B705C"
            style={{ marginRight: 10 }}
          />
          <Text
            style={{
              fontSize: 19,
              fontWeight: "700",
              color: "#6B705C",
              letterSpacing: 0.5,
            }}
          >
            FILTROS DE BÚSQUEDA
          </Text>
        </View>

        <TextInput
          placeholder="Filtrar por nombre"
          value={rawQuery}
          onChangeText={setRawQuery}
          style={{
            backgroundColor: "#FAFAF8",
            borderRadius: 10,
            padding: 15,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            fontWeight: "500",
          }}
        />
        <TextInput
          placeholder="Filtrar por material"
          value={filterMaterial}
          onChangeText={setFilterMaterial}
          style={{
            backgroundColor: "#FAFAF8",
            borderRadius: 10,
            padding: 15,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            fontWeight: "500",
          }}
        />
        <TextInput
          placeholder="Filtrar por colección"
          value={filterCollection}
          onChangeText={setFilterCollection}
          style={{
            backgroundColor: "#FAFAF8",
            borderRadius: 10,
            padding: 15,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            fontWeight: "500",
          }}
        />
        <TextInput
          placeholder="Filtrar por sitio arqueológico"
          value={filterSite}
          onChangeText={setFilterSite}
          style={{
            backgroundColor: "#FAFAF8",
            borderRadius: 10,
            padding: 15,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            fontWeight: "500",
          }}
        />
        <TextInput
          placeholder="Filtrar por numero de estante"
          value={filterShelf}
          onChangeText={(text) => setFilterShelf(text.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          style={{
            backgroundColor: "#FAFAF8",
            borderRadius: 10,
            padding: 15,
            fontSize: 15,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            fontWeight: "500",
          }}
        />

        {filterShelf !== "" && (
          <>
            <TextInput
              placeholder="Filtrar por nivel (1-4)"
              value={filterShelfLevel}
              onChangeText={(text) =>
                setFilterShelfLevel(text.replace(/[^0-9]/g, ""))
              }
              keyboardType="numeric"
              style={{
                backgroundColor: "#FAFAF8",
                borderRadius: 10,
                padding: 15,
                fontSize: 15,
                borderWidth: 1,
                borderColor: "#E8DFD0",
                fontWeight: "500",
              }}
            />
            <TextInput
              placeholder="Filtrar por columna (A-D)"
              value={filterShelfColumn}
              onChangeText={(text) =>
                setFilterShelfColumn(
                  text.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 1)
                )
              }
              autoCapitalize="characters"
              style={{
                backgroundColor: "#FAFAF8",
                borderRadius: 10,
                padding: 15,
                fontSize: 15,
                borderWidth: 1,
                borderColor: "#E8DFD0",
                fontWeight: "500",
              }}
            />
          </>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 24,
          marginBottom: 24,
          paddingLeft: 4,
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
              router.push(`/(tabs)/archaeological-Pieces/View_piece?id=${p.id}`)
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
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.shadowOpacity = "0.16";
              e.currentTarget.style.borderColor = "#6B705C";
            }}
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
                    text={p.shelf || ""}
                    background={Colors.green}
                    textColor={Colors.cremit}
                  />
                  <Badge
                    text={p.levelLabel || ""}
                    background={Colors.brown}
                    textColor={Colors.cremit}
                  />
                  <Badge
                    text={p.columnLabel || ""}
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
              >
                <TouchableOpacity
                  onPress={(e) => {
                    // @ts-ignore RN synthetic event
                    e.stopPropagation?.();
                    if (p.id) {
                      setMenuVisible(
                        menuVisible === String(p.id) ? null : String(p.id)
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
                  <Ionicons name="ellipsis-vertical" size={18} color={Colors.black} />
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
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 10,
                      zIndex: 1000,
                      width: 120,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleEdit(p.id!)}
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
                      <Text style={{ fontSize: 16, color: Colors.brown }}>
                        Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(p.id!)}
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
                      <Text style={{ fontSize: 16, color: Colors.brown }}>
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
          onPress={() => router.push("/(tabs)/archaeological-Pieces/New_piece")}
        />

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#6B705C",
              marginBottom: 12,
            }}
          >
            FILTROS DE BÚSQUEDA
          </Text>

          <View style={{ gap: 12 }}>
            <TextInput
              placeholder="Filtrar por nombre"
              value={rawQuery}
              onChangeText={setRawQuery}
              style={{
                backgroundColor: "#F7F5F2",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E8DFD0",
              }}
            />
            <TextInput
              placeholder="Filtrar por material"
              value={filterMaterial}
              onChangeText={setFilterMaterial}
              style={{
                backgroundColor: "#F7F5F2",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E8DFD0",
              }}
            />
            <TextInput
              placeholder="Filtrar por colección"
              value={filterCollection}
              onChangeText={setFilterCollection}
              style={{
                backgroundColor: "#F7F5F2",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E8DFD0",
              }}
            />
            <TextInput
              placeholder="Filtrar por sitio arqueológico"
              value={filterSite}
              onChangeText={setFilterSite}
              style={{
                backgroundColor: "#F7F5F2",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E8DFD0",
              }}
            />
            <TextInput
              placeholder="Filtrar por numero de estante"
              value={filterShelf}
              onChangeText={(text) => setFilterShelf(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              style={{
                backgroundColor: "#F7F5F2",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E8DFD0",
              }}
            />

            {filterShelf !== "" && (
              <>
                <TextInput
                  placeholder="Filtrar por nivel (1-4)"
                  value={filterShelfLevel}
                  onChangeText={(text) =>
                    setFilterShelfLevel(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: "#E8DFD0",
                  }}
                />
                <TextInput
                  placeholder="Filtrar por columna (A-D)"
                  value={filterShelfColumn}
                  onChangeText={(text) =>
                    setFilterShelfColumn(
                      text.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 1)
                    )
                  }
                  autoCapitalize="characters"
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: "#E8DFD0",
                  }}
                />
              </>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
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
              router.push(`/(tabs)/archaeological-Pieces/View_piece?id=${p.id}`)
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
                    text={p.shelf || ""}
                    background={Colors.green}
                    textColor={Colors.cremit}
                  />
                  <Badge
                    text={p.levelLabel || ""}
                    background={Colors.brown}
                    textColor={Colors.cremit}
                  />
                  <Badge
                    text={p.columnLabel || ""}
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
                onPress={(e) => {
                  // @ts-ignore RN synthetic event
                  e.stopPropagation?.();
                  if (p.id) {
                    setMenuVisible(
                      menuVisible === String(p.id) ? null : String(p.id)
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
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.black} />
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
                }}
              >
                <TouchableOpacity
                  onPress={() => handleEdit(p.id!)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.lightbrown,
                  }}
                >
                  <Ionicons name="pencil" size={20} color={Colors.green} />
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
                  }}
                >
                  <Ionicons name="trash" size={20} color={Colors.brown} />
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
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Piezas arqueologicas"
        showBackArrow
        redirectTo={backRoute}
      />

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
