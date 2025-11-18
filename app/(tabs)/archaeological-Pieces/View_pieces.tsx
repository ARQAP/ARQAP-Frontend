// app/(tabs)/archaeological-Pieces/View_pieces.tsx
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
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

import { useArtefacts, useDeleteArtefact } from "../../../hooks/useArtefact";
import type { Artefact } from "@/repositories/artefactRepository";

// Tipo extendido para incluir campos adicionales que se usan en la UI
type Piece = Artefact & {
  site?: string;
  archaeologist?: string;
  collection?: string;
  shelf?: string;
  level?: string;
  column?: string;
};

export default function ViewPieces() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useArtefacts();
  const deleteMutation = useDeleteArtefact();

  const [query, setQuery] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [filterShelf, setFilterShelf] = useState("");
  const [filterShelfLevel, setFilterShelfLevel] = useState("");
  const [filterShelfColumn, setFilterShelfColumn] = useState("");

  // Estado para el menú desplegable
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

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
      deleteMutation.mutate(id, {
        onSuccess: () => {
          Alert.alert("Éxito", "Pieza eliminada correctamente.");
        },
        onError: (error) => {
          const errorMessage =
            (error as Error).message || "Error al eliminar la pieza.";
          Alert.alert("Error", errorMessage);
        },
      });
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `¿Eliminar ${pieceName}? Esta acción es irreversible.`
      );
      if (confirmed) doDelete();
      return;
    }

    try {
      Alert.alert(
        "Eliminar",
        `¿Eliminar ${pieceName}? Esta acción es irreversible.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: doDelete },
        ]
      );
    } catch {
      const confirmed = confirm(
        `¿Eliminar ${pieceName}? Esta acción es irreversible.`
      );
      if (confirmed) doDelete();
    }
  };

  const pieces: Piece[] = useMemo(() => {
    const list = (data ?? []) as Artefact[];

    return list.map((a) => {
      const siteName = (a as any)?.archaeologicalSite?.Name ?? undefined;

      const arch = (a as any)?.archaeologist;
      const archaeologistName =
        arch?.name ??
        ([arch?.firstname, arch?.lastname].filter(Boolean).join(" ") ||
          undefined);

      const collectionName = (a as any)?.collection?.name ?? undefined;

      const shelfRaw = (a as any)?.physicalLocation?.shelf?.code ?? undefined;
      const levelRaw = (a as any)?.physicalLocation?.level ?? undefined;
      const columnRaw = (a as any)?.physicalLocation?.column ?? undefined;

      const shelf =
        shelfRaw == null
          ? undefined
          : typeof shelfRaw === "object"
            ? shelfRaw.code != null
              ? `Estantería ${String(shelfRaw.code)}`
              : undefined
            : `Estantería ${String(shelfRaw)}`;

      const level = levelRaw == null ? undefined : `Nivel ${String(levelRaw)}`;

      const column =
        columnRaw == null ? undefined : `Columna ${String(columnRaw)}`;

      return {
        ...a,
        id: Number(a.id!),
        name: a.name,
        material: a.material,
        site: siteName,
        archaeologist: archaeologistName,
        collection: collectionName,
        shelf,
        level,
        column,
      };
    });
  }, [data]);

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

      // Estante (texto completo: "Estantería 1", etc.)
      if (
        filterShelf &&
        !(p.shelf || "").toLowerCase().includes(filterShelf.toLowerCase())
      )
        return false;

      // ----- Filtro por nivel (ej: "1" o "Nivel 1") -----
      if (filterShelfLevel.trim() !== "") {
        const nivelFiltro =
          filterShelfLevel.match(/\d+/)?.[0] ?? filterShelfLevel.trim();

        const nivelPieza =
          (p.level || "").match(/\d+/)?.[0] ?? (p.level || "").trim();

        if (!nivelPieza || nivelPieza !== nivelFiltro) return false;
      }

      // ----- Filtro por columna (ej: "A" o "Columna A") -----
      if (filterShelfColumn.trim() !== "") {
        // Normalizo el filtro: saco "columna", espacios y me quedo con la letra
        const colFiltro = filterShelfColumn
          .toUpperCase()
          .replace(/COLUMNA/i, "")
          .trim(); // A / B / C / D

        // Normalizo el valor de la pieza igual
        const colPieza = (p.column || "")
          .toUpperCase()
          .replace(/COLUMNA/i, "")
          .trim(); // A / B / C / D

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

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Piezas arqueologicas"
        showBackArrow
        redirectTo="/(tabs)/home"
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
      ) : (
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        >
          <View style={{ width: "90%", maxWidth: 700, padding: 16 }}>
            <Button
              title="REGISTRAR PIEZA ARQUEOLÓGICA"
              className="bg-[#6B705C] rounded-lg py-3 items-center mb-4"
              textClassName="text-white"
              onPress={() =>
                router.push("/(tabs)/archaeological-Pieces/New_piece")
              }
            />

            {/* Filtros principales */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <TextInput
                placeholder="Filtrar por nombre"
                value={query}
                onChangeText={setQuery}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <TextInput
                placeholder="Filtrar por material"
                value={filterMaterial}
                onChangeText={setFilterMaterial}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <TextInput
                placeholder="Filtrar por colección"
                value={filterCollection}
                onChangeText={setFilterCollection}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <TextInput
                placeholder="Filtrar por sitio arqueológico"
                value={filterSite}
                onChangeText={setFilterSite}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <TextInput
                placeholder="Filtrar por estante"
                value={filterShelf}
                onChangeText={setFilterShelf}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>

            {/* Filtros dependientes del estante, DEBAJO */}
            {filterShelf.trim() !== "" && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <TextInput
                  placeholder="Filtrar por nivel (ej: 1, Nivel 1)"
                  value={filterShelfLevel}
                  onChangeText={setFilterShelfLevel}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    backgroundColor: "#F7F5F2",
                    borderRadius: 8,
                    padding: 10,
                  }}
                />
                <TextInput
                  placeholder="Filtrar por columna (ej: A, Columna A)"
                  value={filterShelfColumn}
                  onChangeText={setFilterShelfColumn}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    backgroundColor: "#F7F5F2",
                    borderRadius: 8,
                    padding: 10,
                  }}
                />
              </View>
            )}

            <Text style={{ marginBottom: 8, color: "#222", fontWeight: "700" }}>
              {filtered.length} PIEZAS ENCONTRADAS
            </Text>

            <Pressable
              style={{ display: "flex", gap: 12 }}
              onPress={() => menuVisible && setMenuVisible(null)}
            >
              {filtered.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() =>
                    router.push(
                      `/(tabs)/archaeological-Pieces/View_piece?id=${p.id}`
                    )
                  }
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#e6dac4",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge
                          text={p.shelf || ""}
                          background={Colors.green}
                          textColor={Colors.cremit}
                        />
                        <Badge
                          text={p.level || ""}
                          background={Colors.brown}
                          textColor={Colors.cremit}
                        />
                        <Badge
                          text={p.column || ""}
                          background={Colors.black}
                          textColor={Colors.cremit}
                        />
                      </View>

                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          marginBottom: 8,
                          fontFamily: "CrimsonText-Regular",
                        }}
                      >
                        {p.name}
                      </Text>

                      <View style={{ marginBottom: 6 }}>
                        <InfoRow
                          icon="cube"
                          label="MATERIAL"
                          value={p.material || ""}
                        />
                        <InfoRow
                          icon="map-marker"
                          label="SITIO ARQUEOLOGICO"
                          value={p.site || ""}
                        />
                        <InfoRow
                          icon="user"
                          label="ARQUEOLOGO"
                          value={p.archaeologist || ""}
                        />
                        <InfoRow
                          icon="archive"
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
                          // evitar que dispare el onPress del card
                          // @ts-ignore RN synthetic event
                          e.stopPropagation?.();
                          if (p.id) {
                            setMenuVisible(
                              menuVisible === String(p.id) ? null : String(p.id)
                            );
                          }
                        }}
                        style={{ padding: 8 }}
                        accessibilityLabel={`Opciones para pieza ${p.name}`}
                      >
                        <FontAwesome
                          name="ellipsis-v"
                          size={18}
                          color={Colors.black}
                        />
                      </TouchableOpacity>

                      {/* Menú desplegable */}
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
                            <FontAwesome
                              name="edit"
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
                            <FontAwesome
                              name="trash"
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
              ))}
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
