// app/(tabs)/archaeological-Pieces/View_piece.tsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Linking,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import Navbar from "../Navbar";
import Colors from "../../../constants/Colors";
import Badge from "../../../components/ui/Badge";
import InfoRow from "../../../components/ui/InfoRow";
import { useLocalSearchParams } from "expo-router";
import { useArtefact } from "@/hooks/useArtefact";
import type { Artefact } from "@/repositories/artefactRepository";
import { apiClient } from "@/lib/api";

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
  images?: string[]; // URLs absolutas
  fichaHistorica?: { id: number; title: string; url?: string }[]; // URLs absolutas
  mentions?: { id: number; title: string; url?: string }[];
  selectedLevel?: number; // índice 0..3
  selectedColumn?: number; // índice 0..3
};

export default function ViewPiece() {
  const params = useLocalSearchParams();
  const id = (params as any)?.id ? Number((params as any).id) : null;

  const { width: windowWidth } = useWindowDimensions();

  const [previewUri, setPreviewUri] = useState<string | null>(null);

  // grilla ubicación
  const columns = ["COLUMNA A", "COLUMNA B", "COLUMNA C", "COLUMNA D"];
  const levels = ["NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4"];
  const containerMaxWidth = 720;
  const leftLabelWidth = 52;
  const gap = 8;
  const parentWidth = Math.min(windowWidth * 0.92, containerMaxWidth);
  const containerWidth = Math.max(0, parentWidth - 32);
  const availableWidthForCells = Math.max(
    0,
    containerWidth - leftLabelWidth - gap * (columns.length - 1)
  );
  const rawCellSize = Math.floor(availableWidthForCells / columns.length);
  const cellSize = Math.max(48, Math.min(rawCellSize, 110));

  // -------- fetch pieza específica con TU hook ----------
  const { data, isLoading, isError, refetch } = useArtefact(id ?? undefined);

  // util: hace absoluta una ruta si vino relativa
  const base = (apiClient.defaults.baseURL || "").replace(/\/+$/, "");
  const abs = (u?: string) => {
    if (!u) return "";
    if (u.startsWith("http")) return u;

    const clean = u.replace(/^\/+/, ""); // saca / inicial
    const parts = clean.split("/");
    const last = parts.pop()!;
    const encodedLast = encodeURIComponent(last); // maneja espacios
    return `${base}/${[...parts, encodedLast].join("/")}`;
  };

  // -------- normalización a tu shape Piece ----------
  const piece: Piece | null = useMemo(() => {
    const a = (data ?? null) as Artefact | null;
    if (!a) return null;

    console.log("Artefact raw data:", a);

    const arch = (a as any)?.archaeologist;
    const archaeologicalSite = (a as any)?.archaeologicalSite;
    const collection = (a as any)?.collection;

    const siteName =
      archaeologicalSite?.name ?? archaeologicalSite?.Nombre ?? undefined;

    const archaeologistName =
      arch?.name ??
      ([arch?.firstname, arch?.lastname].filter(Boolean).join(" ") ||
        undefined);

    const collectionName = collection?.name ?? collection?.Nombre ?? undefined;

    const phys = (a as any)?.physicalLocation ?? {};
    const shelfObj =
      phys?.shelf ?? phys?.estanteria ?? (a as any)?.shelf ?? null;

    const shelfCode =
      typeof shelfObj === "object"
        ? (shelfObj?.code ?? shelfObj?.codigo)
        : shelfObj;

    const levelRaw = phys?.level ?? phys?.nivel ?? (a as any)?.level ?? null;
    const columnRaw =
      phys?.column ?? phys?.columna ?? (a as any)?.column ?? null;

    const shelfStr =
      shelfCode != null
        ? `ESTANTERIA ${String(shelfCode).padStart(2, "0")}`
        : undefined;
    const levelStr =
      levelRaw != null
        ? `NIVEL ${String(levelRaw).padStart(2, "0")}`
        : undefined;

    let columnStr: string | undefined;
    if (columnRaw != null) {
      const col = String(columnRaw).toUpperCase();
      const onlyLetter = col.replace(/[^A-D]/g, "").charAt(0) || col.charAt(0);
      columnStr = `COLUMNA ${onlyLetter}`;
    }

    const selectedLevel =
      levelRaw != null && !Number.isNaN(Number(levelRaw))
        ? Math.max(0, Math.min(3, Number(levelRaw) - 1))
        : undefined;

    const colLetter = (columnStr || "").replace("COLUMNA ", "").trim(); // A..D
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

    const pictures = (a as any)?.picture ?? [];
    const images = Array.isArray(pictures)
      ? pictures
          .map((p: any) => p?.filePath)
          .filter(Boolean)
          .map((u: string) => abs(u))
      : [];

    console.log("Artefact images:", images);
    const records = (a as any)?.historicalRecord ?? (a as any)?.records ?? [];
    const fichaHistorica = Array.isArray(records)
      ? records.map((r: any, idx: number) => ({
          id: Number(r?.id ?? idx + 1),
          title: r?.filename ?? r?.name ?? "Documento",
          url: abs(r?.filePath ?? r?.url ?? r?.uri ?? r?.path),
        }))
      : [];

    // menciones (si tuvieras)
    const mentions: Piece["mentions"] =
      (a as any)?.mentions && Array.isArray((a as any)?.mentions)
        ? (a as any)?.mentions.map((m: any, idx: number) => ({
            id: Number(m?.id ?? idx + 1),
            title: m?.title ?? m?.name ?? "Mención",
            url: m?.url ? abs(m?.url) : undefined,
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
  }, [data, base]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3E9DD",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        <View style={{ width: "92%", maxWidth: 840, padding: 16 }}>
          <View
            style={{
              backgroundColor: "transparent",
              borderRadius: 0,
              padding: 12,
              borderWidth: 0,
            }}
          >
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Badge
                text={piece.shelf || ""}
                background={Colors.green}
                textColor={Colors.cremit}
              />
              <Badge
                text={piece.level || ""}
                background={Colors.brown}
                textColor={Colors.cremit}
              />
              <Badge
                text={piece.column || ""}
                background={Colors.black}
                textColor={Colors.cremit}
              />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 8,
                fontFamily: "CrimsonText-Regular",
              }}
            >
              {piece.name}
            </Text>
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: "#333",
                marginBottom: 8,
              }}
            >
              DESCRIPCIÓN
            </Text>
            <Text
              style={{ fontFamily: "CrimsonText-Regular", marginBottom: 12 }}
            >
              {piece.description || "—"}
            </Text>
            <View style={{ marginBottom: 8 }}>
              <InfoRow icon="cube" label="MATERIAL" value={piece.material} />
              <InfoRow
                icon="map-marker"
                label="SITIO ARQUEOLOGICO"
                value={piece.site}
              />
              <InfoRow
                icon="user"
                label="ARQUEOLOGO"
                value={piece.archaeologist}
              />
              <InfoRow
                icon="archive"
                label="COLECCION"
                value={piece.collection}
              />
            </View>
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: "#333",
                marginTop: 8,
                marginBottom: 6,
              }}
            >
              OBSERVACIÓN
            </Text>
            <Text
              style={{ fontFamily: "CrimsonText-Regular", marginBottom: 12 }}
            >
              {piece.observation || "—"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {piece.images && piece.images.length > 0 ? (
                piece.images.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setPreviewUri(uri)}
                    style={{ borderRadius: 6 }}
                  >
                    <Image
                      source={{ uri }}
                      style={{
                        width: 140,
                        height: 110,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: "#E6DAC4",
                        ...(Platform.OS === "web"
                          ? { cursor: "zoom-in" as any }
                          : {}),
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={{
                    width: 140,
                    height: 110,
                    backgroundColor: "#F7F5F2",
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#E6DAC4",
                  }}
                >
                  <Text style={{ fontFamily: "CrimsonText-Regular" }}>
                    SIN IMÁGENES
                  </Text>
                </View>
              )}
            </View>
            {/* ficha histórica list */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: "#333",
                  marginBottom: 6,
                }}
              >
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
                    <Text style={{ fontFamily: "CrimsonText-Regular" }}>
                      {f.title}
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.green,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        if (f.url) {
                          Linking.openURL(f.url).catch((err) =>
                            console.warn("No se pudo abrir la URL", err)
                          );
                        }
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.cremit,
                          fontFamily: "CrimsonText-Regular",
                        }}
                      >
                        {Platform.OS === "web" ? "ABRIR" : "VER"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    fontFamily: "CrimsonText-Regular",
                    color: Colors.black,
                  }}
                >
                  —
                </Text>
              )}
            </View>
            {/* Ubicación física */}
            <View
              style={{
                marginTop: 8,
                backgroundColor: "transparent",
                padding: 0,
                borderRadius: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 8,
                  color: Colors.black,
                }}
              >
                UBICACIÓN FÍSICA DE LA PIEZA{" "}
              </Text>
              <View style={{ marginBottom: 8, alignItems: "center" }}>
                <View
                  style={{ width: containerWidth, alignItems: "flex-start" }}
                >
                  <View
                    style={{
                      backgroundColor: Colors.green,
                      alignSelf: "flex-start",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.cremit,
                        fontFamily: "CrimsonText-Regular",
                      }}
                    >
                      {" "}
                      {piece.shelf || "—"}{" "}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  width: containerWidth,
                  marginBottom: 6,
                  alignSelf: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <View style={{ width: leftLabelWidth }} />
                  <View style={{ flexDirection: "row" }}>
                    {" "}
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
                            {" "}
                            {c}{" "}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <View>
                {" "}
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
                    {" "}
                    <View
                      style={{
                        width: leftLabelWidth,
                        height: cellSize,
                        justifyContent: "center",
                      }}
                    >
                      {" "}
                      <View
                        style={{
                          backgroundColor: Colors.brown,
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                          alignSelf: "flex-start",
                        }}
                      >
                        {" "}
                        <Text
                          style={{
                            color: Colors.cremit,
                            fontFamily: "CrimsonText-Regular",
                            fontSize: 12,
                          }}
                        >
                          {" "}
                          {lvl}{" "}
                        </Text>{" "}
                      </View>{" "}
                    </View>{" "}
                    <View style={{ flexDirection: "row" }}>
                      {" "}
                      {columns.map((c, ci) => {
                        const isSelected =
                          piece.selectedLevel === li &&
                          piece.selectedColumn === ci;
                        return (
                          <View
                            key={c}
                            style={{
                              width: cellSize,
                              paddingHorizontal: gap / 2,
                              marginRight: ci < columns.length - 1 ? gap : 0,
                            }}
                          >
                            {" "}
                            <View
                              style={{
                                width: cellSize,
                                height: cellSize,
                                borderRadius: 6,
                                backgroundColor: isSelected
                                  ? Colors.brown
                                  : "#EADFCB",
                              }}
                            />{" "}
                          </View>
                        );
                      })}{" "}
                    </View>{" "}
                  </View>
                ))}{" "}
              </View>{" "}
            </View>{" "}
            {/* Menciones */}{" "}
            <View style={{ marginTop: 16 }}>
              {" "}
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  fontWeight: "700",
                  marginBottom: 8,
                  color: Colors.black,
                }}
              >
                {" "}
                MENCIONES DE LA PIEZA ARQUEOLÓGICA{" "}
              </Text>{" "}
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
                    {" "}
                    <Text style={{ fontFamily: "CrimsonText-Regular" }}>
                      {m.title}
                    </Text>{" "}
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
                      {" "}
                      <Text
                        style={{
                          color: Colors.cremit,
                          fontFamily: "CrimsonText-Regular",
                        }}
                      >
                        {" "}
                        VER{" "}
                      </Text>{" "}
                    </TouchableOpacity>{" "}
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    fontFamily: "CrimsonText-Regular",
                    color: Colors.black,
                  }}
                >
                  —
                </Text>
              )}{" "}
            </View>{" "}
          </View>{" "}
        </View>{" "}
      </ScrollView>{" "}
      {/* Modal de previsualización */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          }}
          onPress={() => setPreviewUri(null)} // tap afuera para cerrar
        >
          {/* Botón cerrar (esquina sup. der.) */}
          <TouchableOpacity
            onPress={() => setPreviewUri(null)}
            style={{ position: "absolute", top: 24, right: 24, padding: 8 }}
            hitSlop={8}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          {/* Imagen grande */}
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{
                width: Math.min(windowWidth * 0.95, 1000),
                height: undefined,
                aspectRatio: 1, // o quitá esto si querés tamaño “natural”
                maxHeight:
                  0.9 * (Platform.OS === "web" ? window.innerHeight : 800),
              }}
              resizeMode="contain"
            />
          ) : null}

          {/* Abrir original en pestaña nueva (solo web, opcional) */}
          {Platform.OS === "web" && previewUri ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                window.open(previewUri, "_blank");
              }}
              style={{
                marginTop: 12,
                padding: 8,
                backgroundColor: "#ffffff20",
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff" }}>Abrir en nueva pestaña</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}
