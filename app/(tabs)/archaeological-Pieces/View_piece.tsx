import { useArtefact } from "@/hooks/useArtefact";
import { useMentionsByArtefactId } from "@/hooks/useMentions";
import { useInternalMovementsByArtefactId } from "@/hooks/useInternalMovement";
import { apiClient } from "@/lib/api";
import type { Artefact } from "@/repositories/artefactRepository";
import {
    INPLClassifierDTO,
    INPLRepository,
} from "@/repositories/inplClassifierRepository";
import { getToken } from "@/services/authStorage";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
import Svg, { ClipPath, Defs, G, Rect, Text as SvgText } from 'react-native-svg';
import { Dimensions } from 'react-native';
import { getShelfLabel } from "@/utils/shelfLabels";
import { Ionicons } from "@expo/vector-icons";

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
    shelfId?: number;
    shelfCode?: number;
    slotId?: string;
};

type InplFichaView = { id: number; url: string; filename?: string };

export default function ViewPiece() {
    const params = useLocalSearchParams();
    const id = (params as any)?.id ? Number((params as any).id) : null;

    const { width: windowWidth } = useWindowDimensions();

    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [inplFichas, setInplFichas] = useState<InplFichaView[]>([]);

    // fetch pieza
    const { data, isLoading, isError, refetch } = useArtefact(id ?? undefined);
    const { data: mentionsData = [] } = useMentionsByArtefactId(
        id ?? undefined
    );
    const { data: movementsData = [] } = useInternalMovementsByArtefactId(
        id ?? undefined
    );

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

        const collectionName =
            collection?.name ?? collection?.Nombre ?? undefined;

        const phys = (a as any)?.physicalLocation ?? {};
        const shelfObj =
            phys?.shelf ?? phys?.estanteria ?? (a as any)?.shelf ?? null;

        const shelfCode =
            typeof shelfObj === "object"
                ? (shelfObj?.code ?? shelfObj?.codigo)
                : shelfObj;
        
        const shelfId =
            typeof shelfObj === "object" && shelfObj
                ? (shelfObj?.id ?? shelfObj?.ID ?? phys?.shelfId ?? null)
                : (phys?.shelfId ?? null);

        const levelRaw =
            phys?.level ?? phys?.nivel ?? (a as any)?.level ?? null;
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
            const onlyLetter =
                col.replace(/[^A-D]/g, "").charAt(0) || col.charAt(0);
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

        // Calcular slotId para ShelfDetailView (formato: L{nivel}-C{columna})
        let slotId: string | undefined = undefined;
        if (levelRaw != null && columnRaw != null) {
            const levelNum = Number(levelRaw);
            const colStr = String(columnRaw).toUpperCase();
            const colLetterOnly = colStr.replace(/[^A-Z]/g, "").charAt(0) || colStr.charAt(0);
            if (!Number.isNaN(levelNum) && colLetterOnly) {
                slotId = `L${levelNum}-C${colLetterOnly}`;
            }
        }

        const pictures = (a as any)?.picture ?? [];
        const images = Array.isArray(pictures)
            ? pictures
                  .map((p: any) => p?.filePath)
                  .filter(Boolean)
                  .map((u: string) => abs(u))
            : [];

        const records =
            (a as any)?.historicalRecord ?? (a as any)?.records ?? [];
        const fichaHistorica = Array.isArray(records)
            ? records
                  .map((r: any, idx: number) => ({
                      id: Number(r?.id ?? idx + 1),
                      title: r?.filename ?? r?.name ?? "Documento",
                      // Usar filePath directamente, igual que las imágenes
                      url: abs(r?.filePath ?? r?.url ?? r?.uri ?? r?.path),
                  }))
                  .filter((f) => f.url) // Solo incluir si tiene URL válida
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
                  url: m?.url
                      ? abs(m?.url)
                      : m?.link
                        ? abs(m?.link)
                        : undefined,
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
            shelfId: shelfId != null ? Number(shelfId) : undefined,
            shelfCode: shelfCode != null ? Number(shelfCode) : undefined,
            slotId,
        };
    }, [data, base, mentionsData]);

    async function buildViewableInplFichas(
        dtoFichas: { id: number; filename: string; url: string }[]
    ): Promise<InplFichaView[]> {
        const out: InplFichaView[] = [];

        for (const f of dtoFichas) {
            try {
                if (Platform.OS === "web") {
                    // En web, crear blob con Content-Type correcto
                    const blob = await INPLRepository.fetchFichaBlob(f.id);
                    // Asegurar que el blob tenga el Content-Type correcto
                    const typedBlob = new Blob([blob], {
                        type: "application/pdf",
                    });
                    const objUrl = URL.createObjectURL(typedBlob);
                    out.push({
                        id: Number(f.id),
                        url: objUrl,
                        filename: f.filename,
                    });
                } else {
                    // En mobile, guardar la URL del servidor con token para abrir directamente
                    const token = await getToken();
                    const baseUrl = apiClient.defaults.baseURL || "";
                    
                    if (!token) {
                        console.warn(
                            `No token available for INPL ficha ${f.id}`
                        );
                        out.push({
                            id: Number(f.id),
                            url: f.url,
                            filename: f.filename,
                        });
                    } else {
                        // Guardar la URL del servidor con token en query parameter
                        // Esta URL se usará directamente con Linking.openURL o expo-web-browser
                        const fullUrl = `${baseUrl}/inplFichas/${f.id}/download?token=${encodeURIComponent(token)}`;
                        out.push({
                            id: Number(f.id),
                            url: fullUrl,
                            filename: f.filename,
                        });
                    }
                }
            } catch (e) {
                console.warn("Error loading INPL ficha", f.id, e);
                out.push({
                    id: Number(f.id),
                    url: f.url,
                    filename: f.filename,
                });
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
                (typeof a.inplClassifier === "number"
                    ? a.inplClassifier
                    : null);

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

    // Función para renderizar el SVG de la estantería
    const renderShelfSvg = (selectedSlotId: string | null | undefined) => {
        const levels = 4;
        const columns = 4;
        const windowWidth = Dimensions.get('window').width;
        const isLargeScreen = windowWidth >= 768;

        // Lógica matemática del SVG
        const svgWidth = 360;
        const svgHeight = 230;
        const padding = 20;
        const usableWidth = svgWidth - padding * 2;
        const usableHeight = svgHeight - padding * 2;
        const headerHeight = 24;
        const sideLabelWidth = 26;
        const gridWidth = usableWidth - sideLabelWidth - 8;
        const gridHeight = usableHeight - headerHeight - 8;
        const safeLevels = Math.max(levels, 1);
        const safeColumns = Math.max(columns, 1);
        const levelHeight = gridHeight / safeLevels;
        const slotWidth = gridWidth / safeColumns;
        const gridOriginX = padding + sideLabelWidth + 4;
        const gridOriginY = padding + headerHeight + 4;
        const colLabelFontSize = isLargeScreen ? 11 : 12;
        const rowLabelFontSize = isLargeScreen ? 11 : 12;
        const headerTagFontSize = isLargeScreen ? 9 : 10;
        const outerStroke = 1.2;

        // Calcular slots
        const slots = Array.from({ length: levels }).flatMap((_, levelIndex) =>
            Array.from({ length: columns }).map((_, colIndex) => {
                const uiLevel = levelIndex + 1;
                const uiCol = colIndex + 1;
                const colLetter = String.fromCharCode(64 + uiCol);
                const id = `L${uiLevel}-C${colLetter}`;
                const x = gridOriginX + colIndex * slotWidth;
                const y = gridOriginY + levelIndex * levelHeight;
                return { id, uiLevel, uiCol, x, y };
            })
        );

        return (
            <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <Defs>
                    <ClipPath id="gridRoundedClip">
                        <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} rx={12} />
                    </ClipPath>
                </Defs>

                {/* Fondo general */}
                <Rect
                    x={outerStroke / 2} y={outerStroke / 2}
                    width={svgWidth - outerStroke} height={svgHeight - outerStroke}
                    fill={Colors.cream} rx={24} stroke={Colors.cremit} strokeWidth={outerStroke}
                />

                {/* Contenedor principal */}
                <Rect
                    x={padding - 6} y={padding - 4}
                    width={usableWidth + 12} height={usableHeight + 8}
                    fill="#ffffff" rx={18} stroke={Colors.cremit} strokeWidth={1}
                />

                {/* Cabecera de columnas (A, B, C ...) */}
                {Array.from({ length: columns }).map((_, colIndex) => {
                    const colNumber = colIndex + 1;
                    const colLetter = String.fromCharCode(64 + colNumber);
                    const colCenterX = gridOriginX + colIndex * slotWidth + slotWidth / 2;
                    return (
                        <SvgText key={`col-label-${colLetter}`} x={colCenterX} y={padding + headerHeight - 6} textAnchor="middle" fontSize={colLabelFontSize} fontWeight="600" fill={Colors.brown}>
                            {colLetter}
                        </SvgText>
                    );
                })}

                <SvgText x={padding + sideLabelWidth / 2} y={padding + headerHeight - 6} textAnchor="middle" fontSize={headerTagFontSize} fontWeight="600" fill={Colors.brown}>N</SvgText>

                {/* Labels de niveles */}
                {Array.from({ length: levels }).map((_, levelIndex) => {
                    const levelNumber = levelIndex + 1;
                    const rowCenterY = gridOriginY + levelIndex * levelHeight + levelHeight / 2;
                    return (
                        <SvgText key={`row-label-${levelNumber}`} x={padding + sideLabelWidth / 2} y={rowCenterY + 3} textAnchor="middle" fontSize={rowLabelFontSize} fontWeight="600" fill={Colors.brown}>
                            {levelNumber}
                        </SvgText>
                    );
                })}

                <G clipPath="url(#gridRoundedClip)">
                    <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} fill={Colors.cream} opacity={0.65} />
                    
                    {/* Grilla */}
                    {Array.from({ length: levels }).map((_, levelIndex) =>
                        Array.from({ length: columns }).map((_, colIndex) => (
                            <Rect key={`cell-${levelIndex}-${colIndex}`} x={gridOriginX + colIndex * slotWidth} y={gridOriginY + levelIndex * levelHeight} width={slotWidth} height={levelHeight} fill="transparent" stroke={Colors.cremit} strokeWidth={0.9} />
                        ))
                    )}

                    {/* Slots */}
                    {slots.map(({ id, uiLevel, uiCol, x, y }) => {
                        const selected = selectedSlotId === id;
                        const fill = selected ? Colors.darkgreen : '#ffffff';
                        const stroke = selected ? Colors.green : Colors.cremit;
                        const labelColor = selected ? '#ffffff' : Colors.brown;
                        
                        const gapX = slotWidth * 0.12;
                        const gapY = levelHeight * 0.18;
                        const slotX = x + gapX;
                        const slotY = y + gapY;
                        const slotW = slotWidth - gapX * 2;
                        const slotH = levelHeight - gapY * 2;

                        const slotLabelFontSize = selected
                            ? isLargeScreen ? 13 : 14
                            : isLargeScreen ? 11.5 : 12.5;

                        const textX = !isLargeScreen ? slotX + slotW / 2.5 : slotX + slotW / 2;
                        const textOffsetY = Platform.OS === 'ios' ? 5 : (!isLargeScreen ? 3.5 : slotLabelFontSize * 0.35);
                        const textY = slotY + slotH / 2 + textOffsetY;
                        const colLetter = String.fromCharCode(64 + uiCol);

                        return (
                            <G key={id}>
                                <Rect x={slotX + 1.2} y={slotY + 1.6} width={slotW} height={slotH} fill="#000" opacity={0.05} rx={10} />
                                <Rect x={slotX} y={slotY} width={slotW} height={slotH} fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1.4} rx={10} />
                                <SvgText x={textX} y={textY} textAnchor="middle" fontSize={slotLabelFontSize} fontWeight={selected ? '700' : '600'} fill={labelColor}>
                                    {uiLevel}-{colLetter}
                                </SvgText>
                            </G>
                        );
                    })}
                </G>
                <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} rx={12} fill="none" stroke={Colors.cremit} strokeWidth={1.2} pointerEvents="none" />
            </Svg>
        );
    };

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
            <Navbar title="Ficha de la pieza" showBackArrow />
            <ScrollView
                contentContainerStyle={{
                    alignItems: "center",
                    paddingBottom: 40,
                }}
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

                        <InfoRow
                            icon="cube-outline"
                            label="MATERIAL"
                            value={piece.material}
                        />
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
                            icon={
                                piece.available
                                    ? "checkmark-circle-outline"
                                    : "close-circle-outline"
                            }
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
                            style={{
                                fontFamily: "CrimsonText-Regular",
                                color: Colors.black,
                            }}
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
                                                    ? {
                                                          cursor: "zoom-in" as any,
                                                      }
                                                    : {}),
                                            }}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    color: "#666",
                                }}
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
                                marginBottom: 8,
                            }}
                        >
                            FICHA HISTÓRICA
                        </Text>
                        {piece.fichaHistorica &&
                        piece.fichaHistorica.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12 }}
                            >
                                {piece.fichaHistorica.map((f) => (
                                    <TouchableOpacity
                                        key={f.id}
                                        onPress={() =>
                                            setPreviewUri(f.url || null)
                                        }
                                        style={{ borderRadius: 6 }}
                                    >
                                        <Image
                                            source={{ uri: f.url }}
                                            style={{
                                                width: 150,
                                                height: 120,
                                                borderRadius: 6,
                                                borderWidth: 1,
                                                borderColor: "#E6DAC4",
                                                ...(Platform.OS === "web"
                                                    ? {
                                                          cursor: "zoom-in" as any,
                                                      }
                                                    : {}),
                                            }}
                                            resizeMode="cover"
                                        />
                                        {f.title && (
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    maxWidth: 150,
                                                    marginTop: 4,
                                                    fontSize: 12,
                                                    fontFamily:
                                                        "CrimsonText-Regular",
                                                    color: Colors.black,
                                                }}
                                            >
                                                {f.title}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
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
                            inplFichas.map((f) => {
                                return (
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
                                        <Text
                                            style={{
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                            }}
                                        >
                                            {f.filename || "Ficha INPL"}
                                        </Text>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: Colors.green,
                                                paddingHorizontal: 10,
                                                paddingVertical: 6,
                                                borderRadius: 6,
                                            }}
                                            onPress={async () => {
                                                try {
                                                    if (Platform.OS === "web") {
                                                        // En web, abrir directamente en nueva pestaña
                                                        const token =
                                                            await getToken();
                                                        const baseUrl =
                                                            apiClient.defaults
                                                                .baseURL || "";
                                                        const downloadUrl = `${baseUrl}/inplFichas/${f.id}/download`;

                                                        // Usar la URL del servidor con token en query string
                                                        const urlWithAuth =
                                                            token
                                                                ? `${downloadUrl}?token=${encodeURIComponent(token)}`
                                                                : downloadUrl;

                                                        // Abrir directamente en nueva pestaña
                                                        if (
                                                            typeof window !==
                                                            "undefined"
                                                        ) {
                                                            window.open(
                                                                urlWithAuth,
                                                                "_blank"
                                                            );
                                                        }
                                                    } else {
                                                        // En móvil, abrir la URL del servidor con token usando expo-web-browser
                                                        if (f.url) {
                                                            try {
                                                                await WebBrowser.openBrowserAsync(
                                                                    f.url,
                                                                    {
                                                                        enableBarCollapsing: true,
                                                                        showInRecents: true,
                                                                    }
                                                                );
                                                            } catch (err) {
                                                                console.warn(
                                                                    "No se pudo abrir el PDF con WebBrowser, intentando con Linking",
                                                                    err
                                                                );
                                                                // Fallback a Linking si WebBrowser falla
                                                                Linking.openURL(
                                                                    f.url
                                                                ).catch(
                                                                    (linkErr) =>
                                                                        console.warn(
                                                                            "No se pudo abrir el PDF",
                                                                            linkErr
                                                                        )
                                                                );
                                                            }
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.warn(
                                                        "Error abriendo PDF",
                                                        err
                                                    );
                                                }
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: Colors.cremit,
                                                    fontFamily:
                                                        "CrimsonText-Regular",
                                                }}
                                            >
                                                {Platform.OS === "web"
                                                    ? "ABRIR PDF"
                                                    : "VER PDF"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
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
                            {piece.shelfCode 
                                ? `Mapa del ${getShelfLabel(piece.shelfCode)}`
                                : "Ubicación Física de la Pieza"}
                        </Text>

                        {!piece.shelf || !piece.shelfId ? (
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
                            <View
                                style={{
                                    width: "100%",
                                    height: 300,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {renderShelfSvg(piece.slotId ?? null)}
                            </View>
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
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                color: Colors.black,
                                                flexShrink: 1,
                                                ...(Platform.OS === "web"
                                                    ? ({
                                                          wordBreak:
                                                              "break-all",
                                                      } as any)
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
                                                Linking.openURL(m.url!).catch(
                                                    (err) =>
                                                        console.warn(
                                                            "No se pudo abrir la URL",
                                                            err
                                                        )
                                                );
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: Colors.cremit,
                                                    fontFamily:
                                                        "CrimsonText-Regular",
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

                    {/* MOVIMIENTOS INTERNOS */}
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
                            HISTORIAL DE MOVIMIENTOS INTERNOS
                        </Text>

                        {movementsData && movementsData.length > 0 ? (
                            movementsData.map((movement) => {
                                const formatDateTime = (dateTimeString: string | undefined) => {
                                    if (!dateTimeString) return "No definida";
                                    try {
                                        const date = new Date(dateTimeString);
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, "0");
                                        const day = String(date.getDate()).padStart(2, "0");
                                        const hours = String(date.getHours()).padStart(2, "0");
                                        const minutes = String(date.getMinutes()).padStart(2, "0");
                                        return `${day}/${month}/${year} ${hours}:${minutes}`;
                                    } catch (error) {
                                        return "Fecha inválida";
                                    }
                                };

                                const formatLocation = (location: any) => {
                                    if (!location) return "No especificada";
                                    const shelfLabel = location.shelf ? getShelfLabel(location.shelf.code) : "Estantería";
                                    return `${shelfLabel} - Nivel ${location.level}, Columna ${location.column}`;
                                };

                                const isActive = !movement.returnTime;
                                
                                return (
                                    <View
                                        key={movement.id}
                                        style={{
                                            backgroundColor: isActive ? "#F7F5F2" : "#E8E8E8",
                                            padding: 12,
                                            borderRadius: 6,
                                            marginBottom: 8,
                                            borderLeftWidth: 4,
                                            borderLeftColor: isActive ? Colors.brown : Colors.green,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                                            <Ionicons 
                                                name={isActive ? "move-outline" : "checkmark-circle-outline"} 
                                                size={16} 
                                                color={isActive ? Colors.brown : Colors.green} 
                                                style={{ marginRight: 6 }} 
                                            />
                                            <Text
                                                style={{
                                                    fontFamily: "CrimsonText-Regular",
                                                    fontWeight: "600",
                                                    color: isActive ? Colors.brown : Colors.green,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {formatDateTime(movement.movementTime)} {isActive ? "(Activo)" : "(Finalizado)"}
                                            </Text>
                                        </View>
                                        <Text
                                            style={{
                                                fontFamily: "CrimsonText-Regular",
                                                color: Colors.black,
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "600" }}>Desde: </Text>
                                            {formatLocation(movement.fromPhysicalLocation)}
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: "CrimsonText-Regular",
                                                color: Colors.black,
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "600" }}>Hacia: </Text>
                                            {formatLocation(movement.toPhysicalLocation)}
                                        </Text>
                                        {movement.returnTime && (
                                            <Text
                                                style={{
                                                    fontFamily: "CrimsonText-Regular",
                                                    color: Colors.black,
                                                    fontSize: 12,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <Text style={{ fontWeight: "600" }}>Finalizado: </Text>
                                                {formatDateTime(movement.returnTime)}
                                            </Text>
                                        )}
                                        {movement.reason && (
                                            <Text
                                                style={{
                                                    fontFamily: "CrimsonText-Regular",
                                                    color: Colors.black,
                                                    fontSize: 12,
                                                    fontStyle: "italic",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Motivo: {movement.reason}
                                            </Text>
                                        )}
                                        {movement.observations && (
                                            <Text
                                                style={{
                                                    fontFamily: "CrimsonText-Regular",
                                                    color: Colors.black,
                                                    fontSize: 12,
                                                    fontStyle: "italic",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Observaciones: {movement.observations}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    color: Colors.black,
                                }}
                            >
                                No hay movimientos registrados para esta pieza.
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
                        style={{
                            position: "absolute",
                            top: 24,
                            right: 24,
                            padding: 8,
                        }}
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
                                    0.9 *
                                    (Platform.OS === "web"
                                        ? window.innerHeight
                                        : 800),
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
                            <Text style={{ color: "#fff" }}>
                                Abrir en nueva pestaña
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </Pressable>
            </Modal>
        </View>
    );
}
