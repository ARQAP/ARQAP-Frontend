// app/(tabs)/archaeological-Pieces/View_piece.tsx
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Navbar from "../Navbar";
import Colors from "../../../constants/Colors";
import Badge from "../../../components/ui/Badge";
import InfoRow from "../../../components/ui/InfoRow";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArtefactRepository } from "@/repositories/artefactRepository";
import type { Artefact } from "@/repositories/artefactRepository";

type Piece = {
  id: number;
  name: string;
  material?: string;
  site?: string;
  archaeologist?: string;
  collection?: string;
  shelf?: string;
  level?: string;
  column?: string;
  description?: string;
  observation?: string;
  images?: string[];
  fichaHistorica?: { id: number; title: string; url?: string }[];
  mentions?: { id: number; title: string; url?: string }[];
  selectedLevel?: number;   // índice 0..3
  selectedColumn?: number;  // índice 0..3
};

export default function ViewPiece() {
  const params = useLocalSearchParams();
  const id = (params as any)?.id ? Number((params as any).id) : null;

  const { width: windowWidth } = useWindowDimensions();

  // grilla ubicación
  const columns = ["COLUMNA A", "COLUMNA B", "COLUMNA C", "COLUMNA D"];
  const levels = ["NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4"];
  const containerMaxWidth = 720;
  const leftLabelWidth = 52; // slightly smaller to avoid overflow
  const gap = 8;
  // Compute container width based on the parent (92% width) minus parent paddings (16px each side)
  const parentWidth = Math.min(windowWidth * 0.92, containerMaxWidth);
  const containerWidth = Math.max(0, parentWidth - 32);
  const availableWidthForCells = Math.max(
    0,
    containerWidth - leftLabelWidth - gap * (columns.length - 1)
  );
  const rawCellSize = Math.floor(availableWidthForCells / columns.length);
  const cellSize = Math.max(48, Math.min(rawCellSize, 110));

  // -------- fetch pieza específica ----------
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["artefact", id],
    queryFn: () => ArtefactRepository.getById(id as number),
    enabled: Number.isFinite(id as number),
  });

  // -------- normalización a tu shape Piece ----------
  const piece: Piece | null = useMemo(() => {
    const a = (data ?? null) as Artefact | null;
    if (!a) return null;

    // sitio, arqueólogo, colección (tolerante a variantes de DTO)
    const arch = (a as any)?.archaeologist;
    const archaeologicalSite = (a as any)?.archaeologicalSite;
    const collection = (a as any)?.collection;

    const siteName =
      archaeologicalSite?.name ??
      archaeologicalSite?.Nombre ??
      undefined;

    const archaeologistName =
      arch?.name ??
      ([arch?.firstname, arch?.lastname].filter(Boolean).join(" ") || undefined);

    const collectionName =
      collection?.name ?? collection?.Nombre ?? undefined;

    // ubicación física: puede venir como objeto o campos planos
    const phys = (a as any)?.physicalLocation ?? {};
    const shelfObj =
      phys?.shelf ?? phys?.estanteria ?? (a as any)?.shelf ?? null;

    const shelfCode =
      typeof shelfObj === "object"
        ? shelfObj?.code ?? shelfObj?.codigo
        : shelfObj;

    const levelRaw =
      phys?.level ?? phys?.nivel ?? (a as any)?.level ?? null;
    const columnRaw =
      phys?.column ?? phys?.columna ?? (a as any)?.column ?? null;

    // strings para badges
    const shelfStr =
      shelfCode != null ? `ESTANTERIA ${String(shelfCode).padStart(2, "0")}` : undefined;
    const levelStr =
      levelRaw != null ? `NIVEL ${String(levelRaw).padStart(2, "0")}` : undefined;

    let columnStr: string | undefined;
    if (columnRaw != null) {
      const col = String(columnRaw).toUpperCase();
      // normalizar a A/B/C/D
      const onlyLetter = col.replace(/[^A-D]/g, "").charAt(0) || col.charAt(0);
      columnStr = `COLUMNA ${onlyLetter}`;
    }

    // índices para pintar la grilla
    const selectedLevel =
      levelRaw != null && !Number.isNaN(Number(levelRaw))
        ? Math.max(0, Math.min(3, Number(levelRaw) - 1))
        : undefined;

    const colLetter =
      (columnStr || "").replace("COLUMNA ", "").trim(); // A..D
    const columnIndex =
      colLetter === "A"
        ? 0
        : colLetter === "B"
        ? 1
        : colLetter === "C"
        ? 2
        : colLetter === "D"
        ? 3
        : undefined;

    // imágenes (si existen)
    const pictures = (a as any)?.picture ?? (a as any)?.pictures ?? [];
    const images =
      Array.isArray(pictures)
        ? pictures
            .map((p: any) => p?.url ?? p?.uri ?? p?.path)
            .filter(Boolean)
        : [];

    // ficha histórica / registros (si existen)
    const records = (a as any)?.historicalRecord ?? (a as any)?.records ?? [];
    const fichaHistorica =
      Array.isArray(records)
        ? records.map((r: any, idx: number) => ({
            id: Number(r?.id ?? idx + 1),
            title: r?.filename ?? r?.name ?? "Documento",
            url: r?.url ?? r?.uri ?? r?.path,
          }))
        : [];

    // menciones (si todavía no hay backend, dejamos vacío)
    const mentions: Piece["mentions"] =
      (a as any)?.mentions && Array.isArray((a as any)?.mentions)
        ? (a as any)?.mentions.map((m: any, idx: number) => ({
            id: Number(m?.id ?? idx + 1),
            title: m?.title ?? m?.name ?? "Mención",
            url: m?.url,
          }))
        : [];

    return {
      id: Number(a.id!),
      name: a.name,
      material: a.material ?? undefined,
      site: siteName,
      archaeologist: archaeologistName,
      collection: collectionName,
      shelf: shelfStr,
      level: levelStr,
      column: columnStr,
      description: a.description ?? undefined,
      observation: a.observation ?? undefined,
      images,
      fichaHistorica,
      mentions,
      selectedLevel,
      selectedColumn: columnIndex,
    };
  }, [data]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !piece) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar title="Ficha de la pieza" showBackArrow backToHome />
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#b00020", marginBottom: 8 }}>
            No se pudo cargar la pieza.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              backgroundColor: Colors.green,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: Colors.cremit }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Ficha de la pieza" showBackArrow backToHome />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
        <View style={{ width: "92%", maxWidth: 840, padding: 16 }}>
          {/* main content now sits on page background (no white card) */}
          <View style={{ backgroundColor: "transparent", borderRadius: 0, padding: 12, borderWidth: 0 }}>
            <View style={{ marginBottom: 8, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Badge text={piece.shelf || ""} background={Colors.green} textColor={Colors.cremit} />
              <Badge text={piece.level || ""} background={Colors.brown} textColor={Colors.cremit} />
              <Badge text={piece.column || ""} background={Colors.black} textColor={Colors.cremit} />
            </View>

            <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8, fontFamily: "CrimsonText-Regular" }}>
              {piece.name}
            </Text>

            <Text style={{ fontFamily: "MateSC-Regular", color: "#333", marginBottom: 8 }}>
              DESCRIPCIÓN
            </Text>
            <Text style={{ fontFamily: "CrimsonText-Regular", marginBottom: 12 }}>
              {piece.description || "—"}
            </Text>

            <View style={{ marginBottom: 8 }}>
              <InfoRow icon="cube" label="MATERIAL" value={piece.material} />
              <InfoRow icon="map-marker" label="SITIO ARQUEOLOGICO" value={piece.site} />
              <InfoRow icon="user" label="ARQUEOLOGO" value={piece.archaeologist} />
              <InfoRow icon="archive" label="COLECCION" value={piece.collection} />
            </View>

            <Text style={{ fontFamily: "MateSC-Regular", color: "#333", marginTop: 8, marginBottom: 6 }}>
              OBSERVACIÓN
            </Text>
            <Text style={{ fontFamily: "CrimsonText-Regular", marginBottom: 12 }}>
              {piece.observation || "—"}
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              {/* Si quisieras mostrar miniaturas reales: reemplazá por <Image> y usá piece.images */}
              <View
                style={{
                  width: 120,
                  height: 100,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#E6DAC4",
                }}
              >
                <Text style={{ fontFamily: "CrimsonText-Regular" }}>IMAGEN</Text>
              </View>
              <View
                style={{
                  width: 120,
                  height: 100,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#E6DAC4",
                }}
              >
                <Text style={{ fontFamily: "CrimsonText-Regular" }}>FICHA HISTÓRICA</Text>
              </View>
            </View>

            {/* ficha histórica list */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontFamily: "MateSC-Regular", color: "#333", marginBottom: 6 }}>
                FICHA HISTÓRICA
              </Text>
              {piece.fichaHistorica && piece.fichaHistorica.length > 0 ? (
                piece.fichaHistorica.map((f) => (
                  <View
                    key={f.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#F7F5F2",
                      padding: 8,
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontFamily: "CrimsonText-Regular" }}>{f.title}</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.green,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        // abrir URL si existe; si no, log
                        if (f.url) {
                          // Linking.openURL(f.url) // si quisieras abrir
                          console.log("Abrir URL", f.url);
                        } else {
                          console.log("Ver ficha", f.id);
                        }
                      }}
                    >
                      <Text style={{ color: Colors.cremit, fontFamily: "CrimsonText-Regular" }}>
                        VER
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={{ fontFamily: "CrimsonText-Regular", color: Colors.black }}>—</Text>
              )}
            </View>

            {/* Ubicación física */}
            <View style={{ marginTop: 8, backgroundColor: "transparent", padding: 0, borderRadius: 0 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 8,
                  color: Colors.black,
                }}
              >
                UBICACIÓN FÍSICA DE LA PIEZA
              </Text>

              <View style={{ marginBottom: 8, alignItems: "center" }}>
                <View style={{ width: containerWidth, alignItems: "flex-start" }}>
                  <View
                    style={{
                      backgroundColor: Colors.green,
                      alignSelf: "flex-start",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: Colors.cremit, fontFamily: "CrimsonText-Regular" }}>
                      {piece.shelf || "—"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ width: containerWidth, marginBottom: 6, alignSelf: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
                  <View style={{ width: leftLabelWidth }} />
                  <View style={{ flexDirection: "row" }}>
                    {columns.map((c, ci) => (
                      <View
                        key={c}
                        style={{
                          width: cellSize,
                          paddingHorizontal: gap / 2,
                          alignItems: "center",
                          marginRight: ci < columns.length - 1 ? gap : 0,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#2F2F2F",
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.cremit,
                              fontFamily: "CrimsonText-Regular",
                              fontSize: 11,
                            }}
                          >
                            {c}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View>
                {levels.map((lvl, li) => (
                  <View
                    key={lvl}
                    style={{
                      width: containerWidth,
                      alignSelf: "center",
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <View style={{ width: leftLabelWidth, height: cellSize, justifyContent: "center" }}>
                      <View
                        style={{
                          backgroundColor: Colors.brown,
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            color: Colors.cremit,
                            fontFamily: "CrimsonText-Regular",
                            fontSize: 12,
                          }}
                        >
                          {lvl}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      {columns.map((c, ci) => {
                        const isSelected = piece.selectedLevel === li && piece.selectedColumn === ci;
                        return (
                          <View
                            key={c}
                            style={{
                              width: cellSize,
                              paddingHorizontal: gap / 2,
                              marginRight: ci < columns.length - 1 ? gap : 0,
                            }}
                          >
                            <View
                              style={{
                                width: cellSize,
                                height: cellSize,
                                borderRadius: 6,
                                backgroundColor: isSelected ? Colors.brown : "#EADFCB",
                              }}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Menciones */}
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontWeight: "700",
                  marginBottom: 8,
                  color: Colors.black,
                }}
              >
                MENCIONES DE LA PIEZA ARQUEOLÓGICA
              </Text>
              {piece.mentions && piece.mentions.length > 0 ? (
                piece.mentions.map((m) => (
                  <View
                    key={m.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#F7F5F2",
                      padding: 8,
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontFamily: "CrimsonText-Regular" }}>{m.title}</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.green,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        if (m.url) {
                          console.log("Abrir mención", m.url);
                        } else {
                          console.log("Ver mención", m.id);
                        }
                      }}
                    >
                      <Text style={{ color: Colors.cremit, fontFamily: "CrimsonText-Regular" }}>
                        VER
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={{ fontFamily: "CrimsonText-Regular", color: Colors.black }}>—</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
