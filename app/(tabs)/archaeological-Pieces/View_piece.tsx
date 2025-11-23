import { useArtefact } from "@/hooks/useArtefact";
import { useMentionsByArtefactId } from "@/hooks/useMentions";
import { apiClient } from "@/lib/api";
import type { Artefact } from "@/repositories/artefactRepository";
import {
  INPLClassifierDTO,
  INPLRepository,
} from "@/repositories/inplClassifierRepository";
import { getToken } from "@/services/authStorage";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Badge from "../../../components/ui/Badge";
import InfoRow from "../../../components/ui/InfoRow";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

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
  available: boolean;
  description?: string;
  observation?: string;
  internalClassifier?: string;
  images?: string[];
  fichaHistorica?: { id: number; title: string; url?: string }[];
  mentions?: { id: number; title: string; url?: string }[];
  selectedLevel?: number;
  selectedColumn?: number;
};

type InplFichaView = { id: number; url: string; filename?: string };

export default function ViewPiece() {
  const params = useLocalSearchParams();
  const id = (params as any)?.id ? Number((params as any).id) : null;

  const { width: windowWidth } = useWindowDimensions();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [inplFichas, setInplFichas] = useState<InplFichaView[]>([]);

  // grilla ubicación
  const columns = ["A", "B", "C", "D"];
  const levels = [1, 2, 3, 4];
  const containerMaxWidth = 720;
  const leftLabelWidth = 64;
  const gap = 8;
  const horizontalPadding = 48;
  const containerWidth = Math.min(
    windowWidth - horizontalPadding,
    containerMaxWidth
  );
  const availableWidthForCells = Math.max(
    0,
    containerWidth - leftLabelWidth - gap * (columns.length - 1)
  );
  const rawCellSize = Math.floor(availableWidthForCells / columns.length);
  const cellSize = Math.max(56, Math.min(rawCellSize, 110));

  // fetch pieza
  const { data, isLoading, isError, refetch } = useArtefact(id ?? undefined);
  const { data: mentionsData = [] } = useMentionsByArtefactId(id ?? undefined);

  // util ruta absoluta
  const base = (apiClient.defaults.baseURL || "").replace(/\/+$/, "");
  const abs = (u?: string) => {
    if (!u) return "";
    if (u.startsWith("http")) return u;
    const clean = u.replace(/^\/+/, "");
    const parts = clean.split("/");
    const last = parts.pop()!;
    const encodedLast = encodeURIComponent(last);
    return `${base}/${[...parts, encodedLast].join("/")}`;
  };

  // normalizar a Piece
  const piece: Piece | null = useMemo(() => {
    const a = (data ?? null) as Artefact | null;
    if (!a) return null;

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

    const colLetter = (columnStr || "").replace("COLUMNA ", "").trim();
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

    const records = (a as any)?.historicalRecord ?? (a as any)?.records ?? [];
    const fichaHistorica = Array.isArray(records)
      ? records.map((r: any, idx: number) => ({
          id: Number(r?.id ?? idx + 1),
          title: r?.filename ?? r?.name ?? "Documento",
          url: abs(r?.filePath ?? r?.url ?? r?.uri ?? r?.path),
        }))
      : [];

    const internal =
      (a as any)?.internalClassifier ?? (a as any)?.internalclassifier;
    let internalClassifierLabel: string | undefined = undefined;

    if (internal && (internal.number != null || internal.color != null)) {
      const num = internal.number != null ? `#${internal.number}` : "";
      const col = internal.color ? ` (${internal.color})` : "";
      internalClassifierLabel = `${num}${col}`.trim();
    } else if ((a as any)?.internalClassifierId != null) {
      internalClassifierLabel = `#${(a as any).internalClassifierId}`;
    }

    const mentions: Piece["mentions"] = Array.isArray(mentionsData)
      ? mentionsData.map((m: any, idx: number) => ({
          id: Number(m?.id ?? idx + 1),
          title: m?.title,
          url: m?.url ? abs(m?.url) : m?.link ? abs(m?.link) : undefined,
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
      available: a.available ?? false,
      images,
      fichaHistorica,
      mentions,
      selectedLevel,
      selectedColumn: columnIndex,
      internalClassifier: internalClassifierLabel,
    };
  }, [data, base, mentionsData]);

  async function buildViewableInplFichas(
    dtoFichas: { id: number; filename: string; url: string }[]
  ): Promise<InplFichaView[]> {
    const out: InplFichaView[] = [];

    for (const f of dtoFichas) {
      try {
        if (Platform.OS === "web") {
          const blob = await INPLRepository.fetchFichaBlob(f.id);
          const objUrl = URL.createObjectURL(blob);
          out.push({ id: Number(f.id), url: objUrl, filename: f.filename });
        } else {
          const token = await getToken();
          const baseUrl = apiClient.defaults.baseURL || "";
          const fullUrl = `${baseUrl}/inplFichas/${f.id}/download`;

          const response = await fetch(fullUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            out.push({ id: Number(f.id), url: url, filename: f.filename });
          } else {
            console.warn(
              `Failed to fetch INPL ficha ${f.id}:`,
              response.status
            );
            out.push({ id: Number(f.id), url: f.url, filename: f.filename });
          }
        }
      } catch (e) {
        console.warn("Error loading INPL ficha", f.id, e);
        out.push({ id: Number(f.id), url: f.url, filename: f.filename });
      }
    }

    return out;
  }

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const a = (data ?? null) as any;
      if (!a) {
        if (!cancelled) setInplFichas([]);
        return;
      }

      const classifierId =
        a.inplClassifierId ??
        a.inplclassifierId ??
        (typeof a.inplClassifier === "number" ? a.inplClassifier : null);

      if (!classifierId) {
        if (!cancelled) setInplFichas([]);
        return;
      }

      try {
        const dto: INPLClassifierDTO = await INPLRepository.getById(
          Number(classifierId)
        );

        const baseList = (dto?.inplFichas ?? []).map((f) => ({
          id: Number(f.id),
          url: f.url,
          filename: f.filename,
        }));

        const viewables = await buildViewableInplFichas(baseList);

        if (!cancelled) setInplFichas(viewables.filter((x) => !!x.url));
      } catch (err) {
        console.warn("INPL getById error", err);
        if (!cancelled) setInplFichas([]);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [data]);

  React.useEffect(() => {
    return () => {
      if (Platform.OS === "web") {
        inplFichas.forEach((f) => {
          if (f.url?.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(f.url);
            } catch {}
          }
        });
      }
    };
  }, [inplFichas]);

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
        <Navbar
          title="Ficha de la pieza"
          showBackArrow
          redirectTo="/(tabs)/archaeological-Pieces/View_pieces"
        />
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
      <Navbar
        title="Ficha de la pieza"
        showBackArrow
        redirectTo="/(tabs)/archaeological-Pieces/View_pieces"
      />
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        <View style={{ width: "92%", maxWidth: 840, padding: 16 }}>
          {/* CABECERA */}
          <View style={{ marginBottom: 12 }}>
            {/* Nombre */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 8,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
              }}
            >
              {piece.name}
            </Text>

            {/* Ubicación rápida */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <Badge
                text={piece.shelf || "SIN ESTANTERÍA"}
                background={Colors.green}
                textColor={Colors.cremit}
              />
              <Badge
                text={piece.level || "SIN NIVEL"}
                background={Colors.brown}
                textColor={Colors.cremit}
              />
              <Badge
                text={piece.column || "SIN COLUMNA"}
                background={Colors.black}
                textColor={Colors.cremit}
              />
            </View>

            {/* Descripción corta */}
            <View style={{ marginTop: 4 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: "#333",
                  marginBottom: 6,
                }}
              >
                DESCRIPCIÓN
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  marginBottom: 4,
                  color: Colors.black,
                }}
              >
                {piece.description || "—"}
              </Text>
            </View>
          </View>

          {/* FICHA TÉCNICA */}
          <View
            style={{
              marginTop: 4,
              marginBottom: 12,
              backgroundColor: "#FFF",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E6DAC4",
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: Colors.black,
                marginBottom: 8,
              }}
            >
              FICHA TÉCNICA
            </Text>

            <InfoRow icon="cube-outline" label="MATERIAL" value={piece.material} />
            <InfoRow
              icon="location-outline"
              label="SITIO ARQUEOLÓGICO"
              value={piece.site}
            />
            <InfoRow
              icon="person-outline"
              label="ARQUEÓLOGO"
              value={piece.archaeologist}
            />
            <InfoRow
              icon="archive-outline"
              label="COLECCIÓN"
              value={piece.collection}
            />
            <InfoRow
              icon="pricetags-outline"
              label="CLASIFICADOR INTERNO"
              value={piece.internalClassifier}
            />
            <InfoRow
              icon={piece.available ? "checkmark-circle-outline" : "close-circle-outline"}
              label="DISPONIBLE"
              value={piece.available ? "Sí" : "No"}
            />
          </View>

          {/* OBSERVACIÓN */}
          <View
            style={{
              marginBottom: 12,
              backgroundColor: "#FFF",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E6DAC4",
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: "#333",
                marginBottom: 6,
              }}
            >
              OBSERVACIÓN
            </Text>
            <Text
              style={{ fontFamily: "CrimsonText-Regular", color: Colors.black }}
            >
              {piece.observation || "—"}
            </Text>
          </View>

          {/* IMÁGENES */}
          <View
            style={{
              marginBottom: 12,
              backgroundColor: "#FFF",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E6DAC4",
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: "#333",
                marginBottom: 8,
              }}
            >
              IMÁGENES DE LA PIEZA
            </Text>

            {piece.images && piece.images.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {piece.images.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setPreviewUri(uri)}
                    style={{ borderRadius: 6 }}
                  >
                    <Image
                      source={{ uri }}
                      style={{
                        width: 150,
                        height: 120,
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
                ))}
              </ScrollView>
            ) : (
              <Text
                style={{ fontFamily: "CrimsonText-Regular", color: "#666" }}
              >
                Sin imágenes cargadas.
              </Text>
            )}
          </View>

          {/* FICHA HISTÓRICA */}
          <View
            style={{
              marginBottom: 12,
              backgroundColor: "#FFF",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E6DAC4",
            }}
          >
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

          {/* FICHA INPL */}
          <View
            style={{
              marginBottom: 12,
              backgroundColor: "#FFF",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E6DAC4",
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: "#333",
                marginBottom: 6,
              }}
            >
              FICHA INPL
            </Text>

            {inplFichas.length > 0 ? (
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                {inplFichas.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setPreviewUri(f.url)}
                    style={{ borderRadius: 6 }}
                  >
                    <Image
                      source={{ uri: f.url }}
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
                    {!!f.filename && (
                      <Text
                        numberOfLines={1}
                        style={{
                          maxWidth: 140,
                          marginTop: 4,
                          fontSize: 12,
                          fontFamily: "CrimsonText-Regular",
                          color: Colors.black,
                        }}
                      >
                        {f.filename}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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

          {/* UBICACIÓN FÍSICA */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: "#8B5E3C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 20,
                color: "#8B5E3C",
              }}
            >
              Ubicación Física de la Pieza
            </Text>

            {!piece.shelf ||
            piece.selectedLevel == null ||
            piece.selectedColumn == null ? (
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 14,
                  color: "#4A3725",
                  textAlign: "center",
                }}
              >
                Ubicación física no definida.
              </Text>
            ) : (
              <>
                <View style={{ marginBottom: 16, alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: Colors.green,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.cremit,
                        fontFamily: "CrimsonText-Regular",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {piece.shelf}
                    </Text>
                  </View>
                </View>

                {/* Labels superiores: Columna y Nivel */}
                <View
                  style={{
                    width: containerWidth * 0.85,
                    flexDirection: "row",
                    marginBottom: 12,
                    justifyContent: "space-between",
                    paddingHorizontal: leftLabelWidth * 0.9 + 8,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "MateSC-Regular",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#8B5E3C",
                      }}
                    >
                      Columna y Nivel:
                    </Text>
                  </View>
                </View>

                {/* Grid container con padding para no pegarse a los bordes */}
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  {/* encabezado columnas */}
                  <View
                    style={{
                      width: containerWidth * 0.85,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <View style={{ width: leftLabelWidth * 0.9 }} />
                      <View style={{ flexDirection: "row", flex: 1 }}>
                        {columns.map((c, ci) => (
                          <View
                            key={c}
                            style={{
                              flex: 1,
                              paddingHorizontal: 4,
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "#8B5E3C",
                                width: 50,
                                height: 50,
                                borderRadius: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                shadowColor: "#8B5E3C",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 2,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontFamily: "MateSC-Regular",
                                  fontSize: 18,
                                  fontWeight: "700",
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

                  {/* filas niveles */}
                  <View style={{ width: containerWidth * 0.85 }}>
                    {levels.map((lvl, li) => (
                      <View
                        key={lvl}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <View
                          style={{
                            width: leftLabelWidth * 0.9,
                            height: cellSize * 0.9,
                            justifyContent: "center",
                            paddingRight: 8,
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: Colors.brown,
                              width: 50,
                              height: 50,
                              borderRadius: 10,
                              justifyContent: "center",
                              alignItems: "center",
                              shadowColor: "#8B5E3C",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 2,
                            }}
                          >
                            <Text
                              style={{
                                color: Colors.cremit,
                                fontFamily: "MateSC-Regular",
                                fontSize: 18,
                                fontWeight: "700",
                              }}
                            >
                              {lvl}
                            </Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: "row", flex: 1, gap: 8 }}>
                          {columns.map((c, ci) => {
                            const isSelected =
                              piece.selectedLevel === li &&
                              piece.selectedColumn === ci;
                            return (
                              <View
                                key={c}
                                style={{
                                  flex: 1,
                                  paddingHorizontal: 2,
                                }}
                              >
                                <View
                                  style={{
                                    width: "100%",
                                    aspectRatio: 1,
                                    borderRadius: 10,
                                    backgroundColor: isSelected
                                      ? Colors.brown
                                      : "#F7F5F2",
                                    borderWidth: isSelected ? 3 : 2,
                                    borderColor: isSelected
                                      ? Colors.brown
                                      : "#E5D4C1",
                                    shadowColor: isSelected ? "#8B5E3C" : "transparent",
                                    shadowOffset: { width: 0, height: isSelected ? 3 : 0 },
                                    shadowOpacity: isSelected ? 0.3 : 0,
                                    shadowRadius: isSelected ? 6 : 0,
                                    elevation: isSelected ? 4 : 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  {isSelected && (
                                    <View
                                      style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 6,
                                        backgroundColor: Colors.cremit,
                                      }}
                                    />
                                  )}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* MENCIONES */}
          <View
            style={{
              marginTop: 4,
              marginBottom: 16,
              backgroundColor: "#FFF",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E6DAC4",
            }}
          >
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
                  {/* Columna de texto acotada */}
                  <View
                    style={{
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "CrimsonText-Regular",
                        color: Colors.black,
                        flexShrink: 1,
                        ...(Platform.OS === "web"
                          ? ({ wordBreak: "break-all" } as any)
                          : {}),
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {m.title}
                    </Text>

                    {/* Si algún día querés mostrar también la URL: */}
                    {/* {m.url && (
            <Text
              style={{
                fontFamily: "CrimsonText-Regular",
                fontSize: 11,
                color: "#555",
                marginTop: 2,
                flexShrink: 1,
                ...(Platform.OS === "web"
                  ? ({ wordBreak: "break-all" } as any)
                  : {}),
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {m.url}
            </Text>
          )} */}
                  </View>

                  {m.url ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.green,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        Linking.openURL(m.url!).catch((err) =>
                          console.warn("No se pudo abrir la URL", err)
                        );
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.cremit,
                          fontFamily: "CrimsonText-Regular",
                        }}
                      >
                        VER
                      </Text>
                    </TouchableOpacity>
                  ) : null}
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
        </View>
      </ScrollView>

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
          onPress={() => setPreviewUri(null)}
        >
          <TouchableOpacity
            onPress={() => setPreviewUri(null)}
            style={{ position: "absolute", top: 24, right: 24, padding: 8 }}
            hitSlop={8}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{
                width: Math.min(windowWidth * 0.95, 1000),
                height: undefined,
                aspectRatio: 1,
                maxHeight:
                  0.9 * (Platform.OS === "web" ? window.innerHeight : 800),
              }}
              resizeMode="contain"
            />
          ) : null}

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
