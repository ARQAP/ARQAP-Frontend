import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Svg, {
    ClipPath,
    Defs,
    G,
    Rect,
    Text as SvgText,
} from "react-native-svg";
import Button from "../../../components/ui/Button";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

import { useMentionsByArtefactId } from "@/hooks/useMentions";
import { INPLRepository } from "@/repositories/inplClassifierRepository";
import { useArchaeologists } from "../../../hooks/useArchaeologist";
import { useCollections } from "../../../hooks/useCollections";
import {
    indexToColumn,
    indexToLevel,
    useCreatePhysicalLocation,
    usePhysicalLocations,
} from "../../../hooks/usePhysicalLocation";
import { useShelves } from "../../../hooks/useShelf";

import SimplePickerModal, {
    SimplePickerItem,
} from "../../../components/ui/SimpleModal";

import { useAllArchaeologicalSites } from "@/hooks/useArchaeologicalsite";
import {
    useUploadArtefactHistoricalRecord,
    useUploadArtefactPicture,
} from "@/hooks/useArtefact";
import {
    useInternalClassifierNames,
    useInternalClassifiers,
} from "@/hooks/useInternalClassifier";
import { ArtefactRepository } from "@/repositories/artefactRepository";
import { getShelfLabel } from "@/utils/shelfLabels";
import { Ionicons } from "@expo/vector-icons";

// ---- Tipos locales ----
type MentionUI = {
    localId: number; // id para la UI
    id?: number; // id del backend (opcional)
    title: string;
    link: string;
    description: string;
};

// Thumbnails seguros con blob:
type InplThumb = { id: number; filename?: string; blobUrl: string };

// Reemplazá tu helper por este:
function getUpdatedId(updated: unknown, fallbackId: number): number {
    if (updated && typeof updated === "object" && "id" in updated) {
        const id = Number((updated as any).id);
        if (!Number.isNaN(id)) return id;
    }
    // si el backend no devuelve id, usamos el que ya tenemos
    return fallbackId;
}

export default function EditPiece() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const artefactId = (params as any)?.id ? Number((params as any).id) : null;

    // -------- form state (mismo concepto que New_piece) ----------
    const [name, setName] = useState("");
    const [material, setMaterial] = useState("");
    const [observation, setObservation] = useState("");
    const [description, setDescription] = useState("");
    const [available, setAvailable] = useState(true);
    const [classifier, setClassifier] = useState("INAPL");
    const [color, setColor] = useState("");
    const [collection, setCollection] = useState("");
    const [archaeologist, setArchaeologist] = useState("");
    const [site, setSite] = useState("");

    const [shelf, setShelf] = useState(""); // string con el code (p.ej. "07")

    // Estados para validaciones
    const [nameError, setNameError] = useState("");
    const [materialError, setMaterialError] = useState("");
    const [internalClassifierError, setInternalClassifierError] = useState("");

    // -------- pickers (modales) ----------
    const [archPickerOpen, setArchPickerOpen] = useState(false);
    const [collPickerOpen, setCollPickerOpen] = useState(false);
    const [shelfPickerOpen, setShelfPickerOpen] = useState(false);
    const [archaeologicalSitePickerOpen, setArchaeologicalSitePickerOpen] =
        useState(false);
    const [internalClassifierPickerOpen, setInternalClassifierPickerOpen] =
        useState(false);
    // -------- relaciones (IDs) ----------
    const [collectionId, setCollectionId] = useState<number | null>(null);
    const [archaeologistId, setArchaeologistId] = useState<number | null>(null);
    const [shelfCode, setShelfCode] = useState<string>("");
    const [archaeologicalSiteId, setArchaeologicalSiteId] = useState<
        number | null
    >(null);
    const [internalClassifierId, setInternalClassifierId] = useState<
        number | null
    >(null);
    const [selectedInternalClassifierName, setSelectedInternalClassifierName] =
        useState<string | null>(null);
    const [
        selectedInternalClassifierNumber,
        setSelectedInternalClassifierNumber,
    ] = useState<number | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(0); // 0..3 → NIVEL 1 por defecto
    const [selectedColumn, setSelectedColumn] = useState<number | null>(0); // 0..3 → A por defecto

    // INPL
    const [inplClassifierId, setInplClassifierId] = useState<number | null>(
        null
    );
    const [inplThumbs, setInplThumbs] = useState<InplThumb[]>([]);
    const inplAddInputRef = useRef<HTMLInputElement | null>(null);
    const inplReplaceInputRef = useRef<HTMLInputElement | null>(null);
    const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);

    // -------- menciones ----------
    const [mentionTitle, setMentionTitle] = useState("");
    const [mentionLink, setMentionLink] = useState("");
    const [mentionDescription, setMentionDescription] = useState("");
    const [mentions, setMentions] = useState<MentionUI[]>([]);
    const [editingLocalId, setEditingLocalId] = useState<number | null>(null);

    // -------- data remota ----------
    const { data: collections = [] } = useCollections();
    const { data: archaeologists = [] } = useArchaeologists();
    const { data: shelfs = [] } = useShelves();
    const { data: locations = [] } = usePhysicalLocations();
    const { data: archaeologicalSites = [] } = useAllArchaeologicalSites();
    const { data: internalClassifiers = [] } = useInternalClassifiers();

    // Etiqueta del clasificador interno seleccionado
    const selectedInternalClassifierLabel = selectedInternalClassifierName
        ? `${selectedInternalClassifierName}${selectedInternalClassifierNumber ? ` - ${selectedInternalClassifierNumber}` : ""}`
        : internalClassifierId
          ? (() => {
                const c = internalClassifiers.find(
                    (s) => s.id === internalClassifierId
                );
                if (!c) return "Seleccionar clasificador";
                return `${c.number}${c.name ? ` - ${c.name}` : ""}`;
            })()
          : "Seleccionar clasificador";

    // -------- uploads (opcional como New_piece) ----------
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [hasExistingImage, setHasExistingImage] = useState<boolean>(false);
    const fileInputRef = useRef<any>(null);
    const fileInputRef2 = useRef<any>(null);
    const [fileUri, setFileUri] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    // refs y hooks de upload (si corresponde)
    const pictureFileRef = useRef<File | null>(null); // web
    const recordFileRef = useRef<File | null>(null); // web
    const nativePictureRef = useRef<{
        uri: string;
        name: string;
        type: string;
    } | null>(null);
    const nativeRecordRef = useRef<{
        uri: string;
        name: string;
        type: string;
    } | null>(null);
    const uploadPicture = useUploadArtefactPicture();
    const uploadRecord = useUploadArtefactHistoricalRecord();

    // -------- layout (misma lógica que New_piece) ----------
    const { width: windowWidth } = useWindowDimensions();
    const columns = ["A", "B", "C", "D"];
    const levels = [1, 2, 3, 4];
    const horizontalPadding = 48;
    const containerMaxWidth = 720;
    const leftLabelWidth = 64;
    const gap = 8;
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

    // -------- helpers selección ----------
    const shelfIdFromCode: number | null = useMemo(() => {
        const codeNum = Number(shelfCode);
        const found = shelfs.find((s) => Number(s.code) === codeNum);
        return found?.id ?? null;
    }, [shelfs, shelfCode]);

    const physicalLocationId: number | null = useMemo(() => {
        if (!shelfIdFromCode) return null;
        if (selectedLevel == null || selectedColumn == null) return null;
        const levelNumber = levels[selectedLevel]; // 1..4
        const columnLetter = columns[selectedColumn]; // "A".."D"
        const found = locations.find(
            (l) =>
                Number(l.shelfId) === shelfIdFromCode &&
                Number(l.level) === levelNumber &&
                String(l.column) === columnLetter
        );
        return found?.id ?? null;
    }, [
        locations,
        shelfIdFromCode,
        selectedLevel,
        selectedColumn,
        levels,
        columns,
    ]);

    // Función para renderizar el SVG de la estantería (interactivo)
    const renderShelfSvg = () => {
        const windowWidth = Dimensions.get("window").width;
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
        const safeLevels = Math.max(levels.length, 1);
        const safeColumns = Math.max(columns.length, 1);
        const levelHeight = gridHeight / safeLevels;
        const slotWidth = gridWidth / safeColumns;
        const gridOriginX = padding + sideLabelWidth + 4;
        const gridOriginY = padding + headerHeight + 4;
        const colLabelFontSize = isLargeScreen ? 11 : 12;
        const rowLabelFontSize = isLargeScreen ? 11 : 12;
        const headerTagFontSize = isLargeScreen ? 9 : 10;
        const outerStroke = 1.2;

        // Calcular slots
        const slots = Array.from({ length: levels.length }).flatMap(
            (_, levelIndex) =>
                Array.from({ length: columns.length }).map((_, colIndex) => {
                    const uiLevel = levelIndex + 1;
                    const uiCol = colIndex + 1;
                    const colLetter = String.fromCharCode(64 + uiCol);
                    const id = `L${uiLevel}-C${colLetter}`;
                    const x = gridOriginX + colIndex * slotWidth;
                    const y = gridOriginY + levelIndex * levelHeight;
                    const gapX = slotWidth * 0.12;
                    const gapY = levelHeight * 0.18;
                    const slotX = x + gapX;
                    const slotY = y + gapY;
                    const slotW = slotWidth - gapX * 2;
                    const slotH = levelHeight - gapY * 2;
                    return {
                        id,
                        uiLevel,
                        uiCol,
                        x,
                        y,
                        levelIndex,
                        colIndex,
                        slotX,
                        slotY,
                        slotW,
                        slotH,
                    };
                })
        );

        // Calcular slotId seleccionado
        const selectedSlotId =
            shelfIdFromCode && selectedLevel != null && selectedColumn != null
                ? `L${levels[selectedLevel]}-C${columns[selectedColumn]}`
                : null;

        // Handler para clic en slot
        const handleSlotClick = (levelIdx: number, colIdx: number) => {
            if (shelfIdFromCode) {
                setSelectedLevel(levelIdx);
                setSelectedColumn(colIdx);
            }
        };

        // Calcular posiciones absolutas para el overlay (relativas al SVG centrado)
        const getSlotPosition = (slot: (typeof slots)[0]) => {
            // El SVG está centrado, así que calculamos posiciones absolutas
            // que luego se ajustarán con el contenedor centrado
            return {
                left: slot.slotX,
                top: slot.slotY,
                width: slot.slotW,
                height: slot.slotH,
            };
        };

        return (
            <View
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <View
                    style={{
                        width: svgWidth,
                        height: svgHeight,
                        position: "relative",
                    }}
                >
                    <Svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <Defs>
                            <ClipPath id="gridRoundedClipEditPiece">
                                <Rect
                                    x={gridOriginX}
                                    y={gridOriginY}
                                    width={gridWidth}
                                    height={gridHeight}
                                    rx={12}
                                />
                            </ClipPath>
                        </Defs>

                        {/* Fondo general */}
                        <Rect
                            x={outerStroke / 2}
                            y={outerStroke / 2}
                            width={svgWidth - outerStroke}
                            height={svgHeight - outerStroke}
                            fill={Colors.cream}
                            rx={24}
                            stroke={Colors.cremit}
                            strokeWidth={outerStroke}
                        />

                        {/* Contenedor principal */}
                        <Rect
                            x={padding - 6}
                            y={padding - 4}
                            width={usableWidth + 12}
                            height={usableHeight + 8}
                            fill="#ffffff"
                            rx={18}
                            stroke={Colors.cremit}
                            strokeWidth={1}
                        />

                        {/* Cabecera de columnas (A, B, C ...) */}
                        {Array.from({ length: columns.length }).map(
                            (_, colIndex) => {
                                const colNumber = colIndex + 1;
                                const colLetter = String.fromCharCode(
                                    64 + colNumber
                                );
                                const colCenterX =
                                    gridOriginX +
                                    colIndex * slotWidth +
                                    slotWidth / 2;
                                return (
                                    <SvgText
                                        key={`col-label-${colLetter}`}
                                        x={colCenterX}
                                        y={padding + headerHeight - 6}
                                        textAnchor="middle"
                                        fontSize={colLabelFontSize}
                                        fontWeight="600"
                                        fill={Colors.brown}
                                    >
                                        {colLetter}
                                    </SvgText>
                                );
                            }
                        )}

                        <SvgText
                            x={padding + sideLabelWidth / 2}
                            y={padding + headerHeight - 6}
                            textAnchor="middle"
                            fontSize={headerTagFontSize}
                            fontWeight="600"
                            fill={Colors.brown}
                        >
                            N
                        </SvgText>

                        {/* Labels de niveles */}
                        {Array.from({ length: levels.length }).map(
                            (_, levelIndex) => {
                                const levelNumber = levelIndex + 1;
                                const rowCenterY =
                                    gridOriginY +
                                    levelIndex * levelHeight +
                                    levelHeight / 2;
                                return (
                                    <SvgText
                                        key={`row-label-${levelNumber}`}
                                        x={padding + sideLabelWidth / 2}
                                        y={rowCenterY + 3}
                                        textAnchor="middle"
                                        fontSize={rowLabelFontSize}
                                        fontWeight="600"
                                        fill={Colors.brown}
                                    >
                                        {levelNumber}
                                    </SvgText>
                                );
                            }
                        )}

                        <G clipPath="url(#gridRoundedClipEditPiece)">
                            <Rect
                                x={gridOriginX}
                                y={gridOriginY}
                                width={gridWidth}
                                height={gridHeight}
                                fill={Colors.cream}
                                opacity={0.65}
                            />

                            {/* Grilla */}
                            {Array.from({ length: levels.length }).map(
                                (_, levelIndex) =>
                                    Array.from({ length: columns.length }).map(
                                        (_, colIndex) => (
                                            <Rect
                                                key={`cell-${levelIndex}-${colIndex}`}
                                                x={
                                                    gridOriginX +
                                                    colIndex * slotWidth
                                                }
                                                y={
                                                    gridOriginY +
                                                    levelIndex * levelHeight
                                                }
                                                width={slotWidth}
                                                height={levelHeight}
                                                fill="transparent"
                                                stroke={Colors.cremit}
                                                strokeWidth={0.9}
                                            />
                                        )
                                    )
                            )}

                            {/* Slots */}
                            {slots.map((slot) => {
                                const {
                                    id,
                                    uiLevel,
                                    uiCol,
                                    levelIndex,
                                    colIndex,
                                    slotX,
                                    slotY,
                                    slotW,
                                    slotH,
                                } = slot;
                                const selected =
                                    selectedSlotId === id &&
                                    shelfIdFromCode !== null;
                                const fill = selected
                                    ? Colors.darkgreen
                                    : "#ffffff";
                                const stroke = selected
                                    ? Colors.green
                                    : Colors.cremit;
                                const labelColor = selected
                                    ? "#ffffff"
                                    : Colors.brown;

                                const slotLabelFontSize = selected
                                    ? isLargeScreen
                                        ? 13
                                        : 14
                                    : isLargeScreen
                                      ? 11.5
                                      : 12.5;

                                const textX = !isLargeScreen
                                    ? slotX + slotW / 2.5
                                    : slotX + slotW / 2;
                                const textOffsetY =
                                    Platform.OS === "ios"
                                        ? 5
                                        : !isLargeScreen
                                          ? 3.5
                                          : slotLabelFontSize * 0.35;
                                const textY = slotY + slotH / 2 + textOffsetY;
                                const colLetter = String.fromCharCode(
                                    64 + uiCol
                                );

                                return (
                                    <G key={id}>
                                        <Rect
                                            x={slotX + 1.2}
                                            y={slotY + 1.6}
                                            width={slotW}
                                            height={slotH}
                                            fill="#000"
                                            opacity={0.05}
                                            rx={10}
                                        />
                                        <Rect
                                            x={slotX}
                                            y={slotY}
                                            width={slotW}
                                            height={slotH}
                                            fill={fill}
                                            stroke={stroke}
                                            strokeWidth={selected ? 2 : 1.4}
                                            rx={10}
                                        />
                                        <SvgText
                                            x={textX}
                                            y={textY}
                                            textAnchor="middle"
                                            fontSize={slotLabelFontSize}
                                            fontWeight={
                                                selected ? "700" : "600"
                                            }
                                            fill={labelColor}
                                        >
                                            {uiLevel}-{colLetter}
                                        </SvgText>
                                    </G>
                                );
                            })}
                        </G>
                        <Rect
                            x={gridOriginX}
                            y={gridOriginY}
                            width={gridWidth}
                            height={gridHeight}
                            rx={12}
                            fill="none"
                            stroke={Colors.cremit}
                            strokeWidth={1.2}
                            pointerEvents="none"
                        />
                    </Svg>

                    {/* Overlay con botones táctiles para móvil */}
                    {slots.map((slot) => {
                        const { id, levelIndex, colIndex } = slot;
                        const position = getSlotPosition(slot);
                        // Ajuste fino para nivel 4 (compensar desalineación)
                        const topAdjustment =
                            levelIndex === 3
                                ? Platform.OS === "ios"
                                    ? -1
                                    : -1.5
                                : 0;
                        return (
                            <Pressable
                                key={`overlay-${id}`}
                                onPress={() =>
                                    handleSlotClick(levelIndex, colIndex)
                                }
                                disabled={!shelfIdFromCode}
                                style={{
                                    position: "absolute",
                                    left: position.left,
                                    top: position.top + topAdjustment,
                                    width: position.width,
                                    height: position.height,
                                }}
                            />
                        );
                    })}
                </View>
            </View>
        );
    };

    const createPhysicalLocation = useCreatePhysicalLocation();

    // -------- items para modales ----------
    const archItems: SimplePickerItem<(typeof archaeologists)[number]>[] =
        useMemo(
            () =>
                archaeologists.map((a) => ({
                    value: a.id!,
                    label: `${a.firstname} ${a.lastname}`,
                    raw: a,
                })),
            [archaeologists]
        );

    const archSiteItems: SimplePickerItem<
        (typeof archaeologicalSites)[number]
    >[] = useMemo(
        () =>
            archaeologicalSites.map((a) => ({
                value: a.id!,
                label: a.Name,
                raw: a,
            })),
        [archaeologicalSites]
    );

    const { data: internalClassifierNames = [] } = useInternalClassifierNames();

    const internalClassifierNameItems: SimplePickerItem<string>[] = useMemo(
        () =>
            (internalClassifierNames || []).map((name) => ({
                value: name,
                label: name,
                raw: name,
            })),
        [internalClassifierNames]
    );

    const collItems: SimplePickerItem<(typeof collections)[number]>[] = useMemo(
        () =>
            collections.map((c) => ({
                value: c.id!,
                label: c.name,
                raw: c,
            })),
        [collections]
    );

    const shelfItems: SimplePickerItem<(typeof shelfs)[number]>[] = useMemo(
        () =>
            shelfs.map((s) => ({
                value: s.id!,
                label: getShelfLabel(s.code),
                raw: s,
            })),
        [shelfs]
    );

    // -------- obtener menciones existentes ----------
    const {
        data: mentionsData = [],
        isLoading: mentionsLoading,
        refetch: refetchMentions,
    } = useMentionsByArtefactId(artefactId ?? undefined);

    const originalMentionsRef = useRef<
        Array<{ id: number; title: string; link: string; description: string }>
    >([]);

    useEffect(() => {
        if (!mentionsData) return;
        // map a tu shape local, con localId para keys de UI
        const normalized: MentionUI[] = (mentionsData as any[]).map(
            (m, idx) => ({
                localId: Date.now() + idx, // key local
                id: m.id ? Number(m.id) : undefined,
                title: m.title ?? "",
                link: m.url ?? m.link ?? "",
                description: m.description ?? "",
            })
        );
        setMentions(normalized);
        // snapshot original sólo con los que tienen id
        originalMentionsRef.current = normalized
            .filter((m) => m.id != null)
            .map((m) => ({
                id: m.id!, // seguro por el filtro
                title: m.title,
                link: m.link,
                description: m.description,
            }));
    }, [mentionsData]);

    const addMention = (title: string, link: string, description: string) => {
        if (!title && !link) return;
        setMentions((prev) => [
            {
                localId: Date.now(),
                title: title.trim(),
                link: link.trim(),
                description: description.trim(),
            },
            ...prev,
        ]);
    };

    const removeMentionLocal = (localId: number) => {
        setMentions((prev) => prev.filter((m) => m.localId !== localId));
    };

    function startEditMention(m: MentionUI) {
        setEditingLocalId(m.localId);
        setMentionTitle(m.title);
        setMentionLink(m.link);
        setMentionDescription(m.description);
    }

    function cancelEditMention() {
        setEditingLocalId(null);
        setMentionTitle("");
        setMentionLink("");
        setMentionDescription("");
    }

    function commitEditMention() {
        if (!editingLocalId) return;
        const title = mentionTitle.trim();
        const link = mentionLink.trim();
        const desc = mentionDescription.trim();
        if (!title && !link) return;

        setMentions((prev) =>
            prev.map((x) =>
                x.localId === editingLocalId
                    ? { ...x, title, link, description: desc }
                    : x
            )
        );
        cancelEditMention(); // limpia y sale de modo edición
    }

    // -------- artefacto por id ----------
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["artefact", artefactId],
        queryFn: () => ArtefactRepository.getById(artefactId as number),
        enabled: Number.isFinite(artefactId as number),
    });

    // -------- INPL: carga inicial y refresco de thumbnails --------
    // Utilidad para revocar blob urls
    function revokeAll(urls: string[]) {
        urls.forEach((u) => {
            try {
                URL.revokeObjectURL(u);
            } catch {}
        });
    }

    // Refresca thumbs desde el clasificador
    const refreshInplThumbs = async (clsId: number) => {
        const fichas = await INPLRepository.listFichasByClassifier(clsId);
        // revocar los anteriores
        const prevUrls = inplThumbs.map((t) => t.blobUrl);
        revokeAll(prevUrls);

        const out: InplThumb[] = [];
        for (const f of fichas) {
            const blob = await INPLRepository.fetchFichaBlob(f.id);
            const blobUrl = URL.createObjectURL(blob);
            out.push({ id: f.id, filename: f.filename, blobUrl });
        }
        setInplThumbs(out);
    };

    // Cargar datos del artefacto y su INPL
    useEffect(() => {
        if (!data) return;
        const a = data as any;

        // ----- Campos base del artefacto -----
        setName(a?.name ?? "");
        setMaterial(a?.material ?? "");
        setObservation(a?.observation ?? "");
        setDescription(a?.description ?? "");
        setAvailable(!!a?.available);
        setClassifier("INAPL");
        // internal classifier in backend now has `name` and `number`
        setSelectedInternalClassifierName(a?.internalClassifier?.name ?? null);
        setSelectedInternalClassifierNumber(
            a?.internalClassifier?.number ?? null
        );
        // legacy `color` state used in UI elsewhere — keep it populated for compatibility
        setColor(a?.internalClassifier?.name ?? "");

        // Imagen existente
        if (a?.picture && a.picture.length > 0) {
            const existingPicture = a.picture[0];
            const imageUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.82:8080"}/uploads/pictures/${existingPicture.filename}`;
            setPhotoUri(imageUrl);
            setHasExistingImage(true);
        } else {
            setPhotoUri(null);
            setHasExistingImage(false);
        }

        // Colección
        setCollection(a?.collection?.name ?? a?.collection?.Nombre ?? "");
        setCollectionId(a?.collection?.id ?? null);

        // Arqueólogo
        const arch = a?.archaeologist;
        setArchaeologist(
            arch?.name ??
                [arch?.firstname, arch?.lastname].filter(Boolean).join(" ")
        );
        setArchaeologistId(arch?.id ?? null);

        // Sitio (placeholder)
        const siteObj = a?.archaeologicalSite;
        setSite(siteObj?.name ?? siteObj?.Nombre ?? "");

        // Estantería: guardamos el code
        const shelfObj =
            a?.physicalLocation?.shelf ??
            a?.physicalLocation?.estanteria ??
            a?.shelf ??
            null;
        const shelfCodeVal =
            typeof shelfObj === "object"
                ? (shelfObj?.id ?? shelfObj?.code)
                : shelfObj;
        setShelf(
            shelfCodeVal != null ? String(shelfCodeVal).padStart(2, "0") : ""
        );
        setShelfCode(
            shelfCodeVal != null ? String(shelfCodeVal).padStart(2, "0") : ""
        );

        // level/column a índices (0..3)
        const levelRaw =
            a?.physicalLocation?.level ?? a?.physicalLocation?.nivel ?? null;
        const columnRaw =
            a?.physicalLocation?.column ?? a?.physicalLocation?.columna ?? null;

        const levelIndex =
            levelRaw != null && !Number.isNaN(Number(levelRaw))
                ? Math.max(0, Math.min(3, Number(levelRaw) - 1))
                : 0; // Por defecto: nivel 1 (índice 0)
        setSelectedLevel(levelIndex);

        const colLetter = String(columnRaw ?? "")
            .toUpperCase()
            .replace(/[^A-D]/g, "")
            .charAt(0);
        const colIndex =
            colLetter === "A"
                ? 0
                : colLetter === "B"
                  ? 1
                  : colLetter === "C"
                    ? 2
                    : colLetter === "D"
                      ? 3
                      : 0; // Por defecto: columna A (índice 0)
        setSelectedColumn(colIndex);

        // ----- INPL: detectar clasificador y armar thumbs -----
        const clsId =
            a?.inplClassifierId ??
            a?.inplclassifierId ??
            (typeof a?.inplClassifier === "number"
                ? a.inplClassifier
                : a?.inplClassifier?.id) ??
            null;

        setInplClassifierId(clsId ?? null);

        let cancelled = false;
        let createdUrls: string[] = [];

        const loadThumbs = async () => {
            if (!clsId) {
                setInplThumbs([]);
                return;
            }
            try {
                const fichas = await INPLRepository.listFichasByClassifier(
                    Number(clsId)
                );
                const out: InplThumb[] = [];
                for (const f of fichas) {
                    const blob = await INPLRepository.fetchFichaBlob(f.id);
                    const blobUrl = URL.createObjectURL(blob);
                    createdUrls.push(blobUrl);
                    out.push({ id: f.id, filename: f.filename, blobUrl });
                }
                if (!cancelled) setInplThumbs(out);
            } catch {
                if (!cancelled) setInplThumbs([]);
            }
        };

        loadThumbs();

        return () => {
            cancelled = true;
            revokeAll(createdUrls);
        };
    }, [data]);

    // -------- Handlers INPL (web) --------
    async function handleDeleteInplFicha(fichaId: number) {
        if (!inplClassifierId) return;
        try {
            await INPLRepository.deleteFicha(fichaId);
            await refreshInplThumbs(inplClassifierId);
        } catch (e) {
            Alert.alert(
                "Error",
                "No se pudo eliminar la ficha histórica INPL."
            );
        }
    }

    async function handleWebAddInplFiles(e: any) {
        const files: File[] = Array.from(e?.target?.files ?? []);
        e.target.value = "";
        if (files.length === 0) return;

        try {
            let clsId = inplClassifierId;

            // Si no hay clasificador: crearlo con las fichas históricas
            if (!clsId) {
                const created = await INPLRepository.create(files); // <<-- tu método
                clsId = Number((created as any)?.id);
                if (!clsId)
                    throw new Error("No se pudo crear el clasificador INPL.");

                // Enlazar el artefacto con este clasificador
                if (artefactId) {
                    await ArtefactRepository.update(artefactId, {
                        name: name,
                        material: material,
                        available: available,
                        inplClassifierId: clsId,
                    });
                }
                setInplClassifierId(clsId);
            } else {
                // Ya existe: agregar fichas históricas
                await INPLRepository.addFichas(clsId, files);
            }

            // Refrescar thumbnails
            await refreshInplThumbs(clsId!);
        } catch (err) {
            console.warn(err);
            Alert.alert(
                "Error",
                "No se pudieron cargar las fichas históricas INPL."
            );
        }
    }

    async function handleWebReplaceInplFile(e: any) {
        const file: File | undefined = e?.target?.files?.[0];
        e.target.value = "";
        const fichaId = replaceTargetId;
        setReplaceTargetId(null);
        if (!file || !fichaId) return;

        try {
            await INPLRepository.replaceFicha(fichaId, file);
            if (inplClassifierId) {
                await refreshInplThumbs(inplClassifierId);
            }
        } catch (err) {
            console.warn(err);
            Alert.alert("Error", "No se pudo reemplazar la ficha INPL.");
        }
    }

    // -------- pickers / uploads ----------
    async function pickImage() {
        try {
            if (Platform.OS === "web") {
                fileInputRef.current?.click?.();
                return;
            }
            let ImagePicker: any;
            try {
                // @ts-ignore
                ImagePicker = await import("expo-image-picker");
            } catch (e) {
                Alert.alert(
                    "Dependencia faltante",
                    "Instale `expo-image-picker` para seleccionar imágenes en el dispositivo móvil"
                );
                return;
            }
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== "granted") {
                Alert.alert(
                    "Permiso denegado",
                    "Necesitamos permiso para acceder a las fotos"
                );
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });
            // @ts-ignore
            const uri =
                result?.assets?.[0]?.uri ?? (result as any)?.uri ?? null;
            if (uri) {
                setPhotoUri(uri);
                // Ya no es una imagen existente si el usuario selecciona una nueva
                setHasExistingImage(false);
                // en nativo guardamos el file-like
                nativePictureRef.current = {
                    uri,
                    name: "picture.jpg",
                    type: "image/jpeg",
                };
            }
        } catch (err) {
            console.warn("Error picking image", err);
        }
    }

    function handleWebFile(e: any) {
        const file = e?.target?.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPhotoUri(url);
        // Ya no es una imagen existente si el usuario selecciona una nueva
        setHasExistingImage(false);
        pictureFileRef.current = file;
        e.target.value = "";
    }

    async function pickFile() {
        try {
            if (Platform.OS === "web") {
                fileInputRef2.current?.click?.();
                return;
            }
            let DocumentPicker: any;
            try {
                // @ts-ignore
                DocumentPicker = await import("expo-document-picker");
            } catch (e) {
                console.warn(
                    "expo-document-picker no está instalado, abriendo selector de imagen"
                );
                await pickImage();
                return;
            }
            const res = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
            });
            if (res.type === "success") {
                setFileUri(res.uri);
                setFileName(res.name || null);
                nativeRecordRef.current = {
                    uri: res.uri,
                    name: res.name || "document.pdf",
                    type:
                        res.mimeType ||
                        (res.name?.toLowerCase().endsWith(".pdf")
                            ? "application/pdf"
                            : "image/jpeg"),
                };
            }
        } catch (err) {
            console.warn("Error picking file", err);
        }
    }

    function handleWebFile2(e: any) {
        const file = e?.target?.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setFileUri(url);
        setFileName(file.name || "archivo");
        recordFileRef.current = file;
        e.target.value = "";
    }

    // -------- guardar ----------
    async function handleSave() {
        try {
            if (!artefactId) {
                Alert.alert("Error", "ID de pieza inválido.");
                return;
            }

            // Limpiar errores previos
            setNameError("");
            setMaterialError("");

            // Validar campos obligatorios
            let hasErrors = false;

            if (!name.trim()) {
                setNameError("Debe colocar un nombre");
                hasErrors = true;
            }

            if (!material.trim()) {
                setMaterialError("Debe colocar un material");
                hasErrors = true;
            }

            if (hasErrors) {
                return;
            }

            // ---- Resolver physicalLocationId (find-or-create con TUS hooks) ----
            let finalPhysicalLocationId: number | null = null;

            const hasGridSelection =
                shelfIdFromCode &&
                selectedLevel != null &&
                selectedColumn != null;

            if (hasGridSelection) {
                const levelNumber = indexToLevel(selectedLevel!); // 1..4 (enum)
                const columnLetter = indexToColumn(selectedColumn!); // "A".."D" (enum)

                // 1) Buscar en cache local de usePhysicalLocations()
                const existing = locations.find(
                    (l) =>
                        Number(l.shelfId) === shelfIdFromCode &&
                        Number(l.level) === Number(levelNumber) &&
                        String(l.column) === String(columnLetter)
                );

                if (existing?.id) {
                    finalPhysicalLocationId = Number(existing.id);
                } else {
                    // 2) Crear con tu mutation y usar el id devuelto
                    const created = await createPhysicalLocation.mutateAsync({
                        shelfId: shelfIdFromCode!,
                        level: levelNumber,
                        column: columnLetter,
                    });
                    // tu repo debe devolver el objeto creado con id
                    const newId = Number((created as any)?.id);
                    if (!newId)
                        throw new Error(
                            "No se pudo obtener el id de la nueva ubicación física."
                        );
                    finalPhysicalLocationId = newId;
                }
            }

            // Resolver internalClassifierId desde nombre+numero (si corresponde)
            let internalClassifierPayload: {
                name: string;
                number?: number | null;
            } | null = null;
            if (selectedInternalClassifierName) {
                internalClassifierPayload = {
                    name: selectedInternalClassifierName,
                    number: selectedInternalClassifierNumber ?? null,
                };
            }

            const artefactPayload: any = {
                name: name.trim(),
                material: material.trim(), // Ya no permitimos null porque es obligatorio
                observation: observation.trim() || null,
                available,
                description: description.trim() || null,
                collectionId: collectionId ?? null,
                archaeologistId: archaeologistId ?? null,
                physicalLocationId: finalPhysicalLocationId, // <- garantizado o null si no hay selección
                archaeologicalSiteId: archaeologicalSiteId ?? null,
                // ⚠️ NO incluir internalClassifierId cuando se usa el endpoint transaccional
                // El servicio se encarga de asignarlo basándose en internalClassifier
                ...(!internalClassifierPayload && {
                    internalClassifierId: internalClassifierId ?? null,
                }),
                // ⚠️ NO forzamos a null el INPL acá, se mantiene lo que ya tenga la pieza.
                // inplClassifierId: null,
            };

            // Usar el endpoint transaccional si hay clasificador interno
            if (internalClassifierPayload) {
                await ArtefactRepository.updateWithInternalClassifier(
                    artefactId,
                    {
                        artefact: artefactPayload,
                        internalClassifier: internalClassifierPayload,
                    }
                );
            } else {
                await ArtefactRepository.update(artefactId, artefactPayload);
            }

            if (Platform.OS === "web" && pictureFileRef.current) {
                await uploadPicture.mutateAsync({
                    id: artefactId,
                    file: pictureFileRef.current,
                });
            } else if (Platform.OS !== "web" && nativePictureRef.current) {
                const fd = new FormData();
                // @ts-ignore RN FormData shape
                fd.append("picture", nativePictureRef.current as any);
                await ArtefactRepository.uploadPicture(
                    artefactId,
                    // @ts-ignore
                    (fd as any).get("picture")
                );
            }

            // subir ficha histórica/documento si corresponde
            if (Platform.OS === "web" && recordFileRef.current) {
                await uploadRecord.mutateAsync({
                    id: artefactId,
                    file: recordFileRef.current,
                });
            } else if (Platform.OS !== "web" && nativeRecordRef.current) {
                const fd = new FormData();
                // @ts-ignore RN FormData shape
                fd.append("document", nativeRecordRef.current as any);
                await ArtefactRepository.uploadHistoricalRecord(
                    artefactId,
                    // @ts-ignore
                    (fd as any).get("document")
                );
            }

            const originals = originalMentionsRef.current;
            const current = mentions;

            // nuevas (sin id)
            const toCreate = current.filter(
                (m) => m.id == null && (m.title || m.link)
            );

            // eliminadas (id estaba y desapareció)
            const toDelete = originals.filter(
                (om) => !current.some((cm) => cm.id === om.id)
            );

            // posibles updates (compara por id)
            const toMaybeUpdate = current.filter((cm) => cm.id != null);
            const toUpdate = toMaybeUpdate.filter((cm) => {
                const orig = originals.find((o) => o.id === cm.id);
                if (!orig) return false;
                return (
                    (orig.title ?? "") !== (cm.title ?? "") ||
                    (orig.link ?? "") !== (cm.link ?? "") ||
                    (orig.description ?? "") !== (cm.description ?? "")
                );
            });

            // persistir
            for (const m of toCreate) {
                await ArtefactRepository.createMention({
                    title: m.title,
                    link: m.link,
                    description: m.description,
                    artefactId: artefactId,
                });
            }

            for (const m of toUpdate) {
                await ArtefactRepository.updateMention(artefactId, m.id!, {
                    title: m.title,
                    url: m.link,
                    link: m.link,
                    description: m.description,
                });
            }

            for (const m of toDelete) {
                await ArtefactRepository.deleteMention(artefactId, m.id);
            }

            Alert.alert("OK", "Pieza actualizada correctamente.");
            router.replace("/(tabs)/archaeological-Pieces/View_pieces");
        } catch (e: any) {
            console.warn(e);

            // Manejar errores específicos del backend
            if (e?.response?.data?.error) {
                const errorMessage = e.response.data.error;

                // Verificar si es un error de validación específico
                if (
                    errorMessage.includes("nombre") ||
                    errorMessage.includes("Name")
                ) {
                    setNameError(errorMessage);
                    return;
                }

                if (
                    errorMessage.includes("material") ||
                    errorMessage.includes("Material")
                ) {
                    setMaterialError(errorMessage);
                    return;
                }

                // Validar errores del clasificador interno
                if (
                    errorMessage.includes("clasificador interno") ||
                    errorMessage.includes("internal classifier")
                ) {
                    setInternalClassifierError(errorMessage);
                    Alert.alert("Error de Clasificador Interno", errorMessage);
                    return;
                }

                // Mostrar otros errores del servidor
                Alert.alert("Error", errorMessage);
            } else {
                Alert.alert(
                    "Error",
                    e?.message ?? "No se pudo actualizar la pieza."
                );
            }
        }
    }

    // -------- UI helpers de selección simple ----------
    const SimpleSelectRow = ({
        label,
        value,
        onPress,
        subdued,
    }: {
        label: string;
        value?: string | null;
        onPress?: () => void;
        subdued?: boolean;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            style={{
                backgroundColor: subdued ? "#f3f3f3" : "#F7F5F2",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#E5D4C1",
            }}
        >
            <Text
                style={{
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                }}
            >
                {value || label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
            <Navbar
                title="Editar pieza arqueologica"
                showBackArrow
                redirectTo="/(tabs)/archaeological-Pieces/View_pieces"
            />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Platform.OS === "web" ? 32 : 20,
                    paddingTop: Platform.OS === "web" ? 40 : 20,
                    paddingBottom: Platform.OS === "web" ? 32 : 20,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        maxWidth: 800,
                        alignSelf: "center",
                    }}
                >
                    {/* Encabezado */}
                    <View
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 16,
                            padding: 28,
                            marginBottom: 32,
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
                                fontSize: 28,
                                color: "#8B5E3C",
                                marginBottom: 8,
                                fontWeight: "600",
                            }}
                        >
                            Editar Pieza Arqueológica
                        </Text>
                        <Text
                            style={{
                                fontFamily: "CrimsonText-Regular",
                                fontSize: 16,
                                color: "#A0785D",
                            }}
                        >
                            Edite los datos de la pieza arqueológica
                        </Text>
                    </View>

                    {/* Formulario - Información Básica */}
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
                        {/* nombre / material */}
                        <View
                            style={{
                                flexDirection:
                                    windowWidth < 520 ? "column" : "row",
                                gap: 16,
                                marginBottom: 24,
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Nombre
                                </Text>
                                <TextInput
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (nameError) setNameError("");
                                    }}
                                    placeholder="Ingrese el nombre"
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: nameError ? 2 : 1,
                                        borderColor: nameError
                                            ? "#ff4444"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />
                                {nameError ? (
                                    <Text
                                        style={{
                                            color: "#ff4444",
                                            fontSize: 12,
                                            marginTop: 4,
                                            fontFamily: "CrimsonText-Regular",
                                        }}
                                    >
                                        {nameError}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Material
                                </Text>
                                <TextInput
                                    value={material}
                                    onChangeText={(text) => {
                                        setMaterial(text);
                                        if (materialError) setMaterialError("");
                                    }}
                                    placeholder="Ingrese el material"
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: materialError ? 2 : 1,
                                        borderColor: materialError
                                            ? "#ff4444"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />
                                {materialError ? (
                                    <Text
                                        style={{
                                            color: "#ff4444",
                                            fontSize: 12,
                                            marginTop: 4,
                                            fontFamily: "CrimsonText-Regular",
                                        }}
                                    >
                                        {materialError}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* observación */}
                        <View style={{ marginBottom: 24 }}>
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Observación
                            </Text>
                            <TextInput
                                multiline
                                value={observation}
                                onChangeText={setObservation}
                                placeholder="Observación de la pieza"
                                placeholderTextColor="#B8967D"
                                selectionColor="#8B5E3C"
                                style={{
                                    backgroundColor: "#F7F5F2",
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    minHeight: 100,
                                    borderWidth: 1,
                                    borderColor: "#E5D4C1",
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: "#4A3725",
                                }}
                            />
                        </View>

                        {/* disponible */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    fontWeight: "600",
                                }}
                            >
                                Disponible
                            </Text>
                            <Switch
                                value={available}
                                onValueChange={setAvailable}
                            />
                        </View>
                    </View>

                    {/* Clasificador Interno */}
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
                                fontSize: 15,
                                color: "#8B5E3C",
                                marginBottom: 8,
                                fontWeight: "600",
                            }}
                        >
                            Clasificador interno
                        </Text>
                        <SimpleSelectRow
                            label="Seleccionar clasificador (por nombre)"
                            value={
                                selectedInternalClassifierName ??
                                "Seleccionar clasificador"
                            }
                            onPress={() =>
                                setInternalClassifierPickerOpen(true)
                            }
                        />
                        <Text
                            style={{
                                marginTop: 16,
                                fontFamily: "MateSC-Regular",
                                fontSize: 15,
                                color: "#8B5E3C",
                                marginBottom: 8,
                                fontWeight: "600",
                            }}
                        >
                            Número
                        </Text>

                        <TextInput
                            keyboardType="numeric"
                            value={
                                selectedInternalClassifierNumber == null
                                    ? ""
                                    : String(selectedInternalClassifierNumber)
                            }
                            onChangeText={(v) => {
                                setSelectedInternalClassifierNumber(
                                    v === "" ? null : Number(v)
                                );
                                if (internalClassifierError)
                                    setInternalClassifierError("");
                            }}
                            placeholder="1"
                            placeholderTextColor="#B8967D"
                            style={{
                                backgroundColor: "#F7F5F2",
                                borderRadius: 8,
                                padding: 8,
                                borderWidth: 1,
                                borderColor: internalClassifierError
                                    ? "#ff4444"
                                    : "#E5D4C1",
                            }}
                        />
                        {internalClassifierError ? (
                            <Text
                                style={{
                                    color: "#ff4444",
                                    fontSize: 12,
                                    marginTop: 6,
                                    fontFamily: "CrimsonText-Regular",
                                }}
                            >
                                {internalClassifierError}
                            </Text>
                        ) : null}
                        <TouchableOpacity
                            style={{
                                paddingVertical: 8,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                marginTop: 8,
                            }}
                            onPress={() => {
                                router.push(
                                    "/(tabs)/archaeological-Pieces/New_internal-classifier"
                                );
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Crear nuevo Clasificador Interno"
                        >
                            <Text
                                style={{
                                    color: "#8B5E3C",
                                    marginRight: 6,
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 14,
                                }}
                            >
                                Crear nuevo Clasificador Interno
                            </Text>
                            <Ionicons
                                name="arrow-forward-outline"
                                size={16}
                                color="#8B5E3C"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Archivos */}
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
                                fontSize: 15,
                                color: "#8B5E3C",
                                marginBottom: 16,
                                fontWeight: "600",
                            }}
                        >
                            Archivos
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 12,
                                alignItems: "center",
                                flexWrap: "wrap",
                                marginBottom: 12,
                            }}
                        >
                            <TouchableOpacity
                                onPress={pickImage}
                                style={{
                                    width: 96,
                                    height: 96,
                                    backgroundColor: "#F7F5F2",
                                    borderRadius: 12,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: "#E5D4C1",
                                }}
                            >
                                {(() => {
                                    if (photoUri) {
                                        return (
                                            <Image
                                                source={{ uri: photoUri }}
                                                style={{
                                                    width: 92,
                                                    height: 92,
                                                    borderRadius: 12,
                                                }}
                                            />
                                        );
                                    } else {
                                        return null;
                                    }
                                })()}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={pickImage}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    backgroundColor: Colors.green,
                                    borderRadius: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 14,
                                    }}
                                >
                                    {hasExistingImage || photoUri
                                        ? "REEMPLAZAR IMAGEN"
                                        : "SUBIR IMAGEN"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={pickFile}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    backgroundColor: Colors.brown,
                                    borderRadius: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 14,
                                    }}
                                >
                                    SUBIR FICHA HISTÓRICA
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (Platform.OS === "web")
                                        inplAddInputRef.current?.click?.();
                                }}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    backgroundColor: "#8B6C42",
                                    borderRadius: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 14,
                                    }}
                                >
                                    AGREGAR FICHAS INPL
                                </Text>
                            </TouchableOpacity>

                            {Platform.OS === "web" && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleWebFile}
                                    />
                                    <input
                                        ref={fileInputRef2}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        style={{ display: "none" }}
                                        onChange={handleWebFile2}
                                    />
                                </>
                            )}
                        </View>
                        {fileName ? (
                            <Text
                                style={{
                                    marginTop: 8,
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 14,
                                    color: "#4A3725",
                                }}
                            >
                                Archivo: {fileName}
                            </Text>
                        ) : null}
                    </View>

                    {/* Relaciones */}
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
                        {/* Colección */}
                        <View style={{ marginBottom: 24 }}>
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Colección
                            </Text>
                            <SimpleSelectRow
                                label="Sin colección"
                                value={
                                    collectionId
                                        ? (collections.find(
                                              (c) => c.id === collectionId
                                          )?.name ?? "Sin colección")
                                        : "Sin colección"
                                }
                                onPress={() => setCollPickerOpen(true)}
                            />
                        </View>

                        {/* Arqueólogo */}
                        <View style={{ marginBottom: 24 }}>
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Arqueólogo
                            </Text>
                            <SimpleSelectRow
                                label="Seleccionar arqueólogo"
                                value={
                                    archaeologistId
                                        ? (() => {
                                              const a = archaeologists.find(
                                                  (x) =>
                                                      x.id === archaeologistId
                                              );
                                              return a
                                                  ? `${a.firstname} ${a.lastname}`
                                                  : "Seleccionar arqueólogo";
                                          })()
                                        : "Seleccionar arqueólogo"
                                }
                                onPress={() => setArchPickerOpen(true)}
                            />
                        </View>

                        {/* Sitio arqueológico */}
                        <View style={{ marginBottom: 16 }}>
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Sitio arqueológico
                            </Text>
                            <SimpleSelectRow
                                label="Seleccionar Sitio arqueológico"
                                value={
                                    archaeologicalSiteId
                                        ? (archaeologicalSites.find(
                                              (s) =>
                                                  s.id === archaeologicalSiteId
                                          )?.Name ?? "Seleccionar sitio")
                                        : "Seleccionar sitio"
                                }
                                onPress={() =>
                                    setArchaeologicalSitePickerOpen(true)
                                }
                            />
                        </View>
                    </View>

                    {/* Descripción */}
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
                                fontSize: 15,
                                color: "#8B5E3C",
                                marginBottom: 8,
                                fontWeight: "600",
                            }}
                        >
                            Descripción
                        </Text>
                        <TextInput
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descripción detallada de la pieza"
                            placeholderTextColor="#B8967D"
                            selectionColor="#8B5E3C"
                            style={{
                                backgroundColor: "#F7F5F2",
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                minHeight: 120,
                                borderWidth: 1,
                                borderColor: "#E5D4C1",
                                fontFamily: "CrimsonText-Regular",
                                fontSize: 16,
                                color: "#4A3725",
                            }}
                        />
                    </View>

                    {/* Visualización de INPL (solo mostrar las fichas existentes) */}
                    {inplThumbs.length > 0 && (
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
                                    marginBottom: 16,
                                    color: "#8B5E3C",
                                }}
                            >
                                Fichas INPL
                            </Text>

                            {/* Grid de fichas existentes (thumbnails con blob) */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 16,
                                    flexWrap: "wrap",
                                    marginBottom: 16,
                                }}
                            >
                                {inplThumbs.map((f) => (
                                    <View key={f.id} style={{ width: 160 }}>
                                        <Image
                                            source={{ uri: f.blobUrl }}
                                            style={{
                                                width: 160,
                                                height: 120,
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: "#E5D4C1",
                                            }}
                                        />
                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                fontSize: 12,
                                                marginTop: 6,
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                color: "#4A3725",
                                            }}
                                        >
                                            {f.filename}
                                        </Text>

                                        <View
                                            style={{
                                                flexDirection: "row",
                                                gap: 8,
                                                marginTop: 8,
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setReplaceTargetId(f.id);
                                                    if (Platform.OS === "web")
                                                        inplReplaceInputRef.current?.click?.();
                                                }}
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    backgroundColor: "#D7E3FC",
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily:
                                                            "CrimsonText-Regular",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Reemplazar
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={async () => {
                                                    await handleDeleteInplFicha(
                                                        f.id
                                                    );
                                                }}
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    backgroundColor: "#F3D6C1",
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily:
                                                            "CrimsonText-Regular",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Eliminar
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Ubicación física de la pieza */}
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
                        {/* Selector de Estantería */}
                        <View
                            style={{
                                width: "100%",
                                marginBottom: 24,
                                alignItems: "flex-start",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Estantería
                            </Text>
                            <View style={{ width: 200 }}>
                                <SimpleSelectRow
                                    label="Seleccionar estantería"
                                    value={
                                        shelfCode
                                            ? getShelfLabel(shelfCode)
                                            : undefined
                                    }
                                    onPress={() => setShelfPickerOpen(true)}
                                />
                            </View>
                        </View>
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
                            {shelfIdFromCode
                                ? `Mapa del ${getShelfLabel(shelfCode)}`
                                : "Selecciona una estantería para ver su mapa"}
                        </Text>
                        {!shelfIdFromCode ? (
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 18,
                                    color: "#4A3725",
                                    textAlign: "center",
                                    marginTop: 20,
                                    marginBottom: 20,
                                }}
                            >
                                Selecciona una estantería para ver la ubicación
                                física.
                            </Text>
                        ) : (
                            <View
                                style={{
                                    width: "100%",
                                    height: Platform.OS === "web" ? 300 : 380,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {renderShelfSvg()}
                            </View>
                        )}
                    </View>

                    {/* Menciones: formulario para agregar + lista */}
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
                                marginBottom: 16,
                                color: "#8B5E3C",
                            }}
                        >
                            Menciones de la Pieza Arqueológica (Opcional)
                        </Text>

                        {/* inputs: nombre + enlace */}
                        <View
                            style={{
                                flexDirection:
                                    windowWidth < 520 ? "column" : "row",
                                gap: 16,
                                marginBottom: 16,
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Nombre
                                </Text>
                                <TextInput
                                    value={mentionTitle}
                                    onChangeText={setMentionTitle}
                                    placeholder="Ingrese el nombre"
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />
                            </View>
                            <View
                                style={{
                                    width: windowWidth < 520 ? "100%" : 200,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Enlace
                                </Text>
                                <TextInput
                                    value={mentionLink}
                                    onChangeText={setMentionLink}
                                    placeholder="Ingrese el enlace"
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Descripción
                            </Text>
                            <TextInput
                                multiline
                                value={mentionDescription}
                                onChangeText={setMentionDescription}
                                placeholder="Ingrese la descripción"
                                placeholderTextColor="#B8967D"
                                selectionColor="#8B5E3C"
                                style={{
                                    backgroundColor: "#F7F5F2",
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    minHeight: 100,
                                    borderWidth: 1,
                                    borderColor: "#E5D4C1",
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: "#4A3725",
                                }}
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                gap: 12,
                                marginBottom: 16,
                            }}
                        >
                            {editingLocalId == null ? (
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.green,
                                        paddingHorizontal: 20,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                    }}
                                    onPress={() => {
                                        const title = mentionTitle.trim();
                                        const link = mentionLink.trim();
                                        const desc = mentionDescription.trim();
                                        if (!title && !link) return;
                                        const m: MentionUI = {
                                            localId: Date.now(),
                                            title,
                                            link,
                                            description: desc,
                                        };
                                        setMentions((prev) => [m, ...prev]);
                                        setMentionTitle("");
                                        setMentionLink("");
                                        setMentionDescription("");
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.cremit,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        AGREGAR MENCIÓN
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: Colors.brown,
                                            paddingHorizontal: 20,
                                            paddingVertical: 12,
                                            borderRadius: 12,
                                        }}
                                        onPress={commitEditMention}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.cremit,
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                fontSize: 14,
                                            }}
                                        >
                                            ACTUALIZAR MENCIÓN
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: "#E5D4C1",
                                            paddingHorizontal: 20,
                                            paddingVertical: 12,
                                            borderRadius: 12,
                                        }}
                                        onPress={cancelEditMention}
                                    >
                                        <Text
                                            style={{
                                                color: "#8B5E3C",
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                fontSize: 14,
                                            }}
                                        >
                                            CANCELAR
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* tabla/lista de menciones */}
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: "#E5D4C1",
                                borderRadius: 12,
                                overflow: "hidden",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    backgroundColor: "#F7F5F2",
                                    padding: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        flex: 2,
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 14,
                                        color: "#8B5E3C",
                                    }}
                                >
                                    Nombre
                                </Text>
                                <Text
                                    style={{
                                        flex: 2,
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 14,
                                        color: "#8B5E3C",
                                    }}
                                >
                                    Enlace
                                </Text>
                                <Text
                                    style={{
                                        flex: 3,
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 14,
                                        color: "#8B5E3C",
                                    }}
                                >
                                    Descripción
                                </Text>
                                <Text
                                    style={{
                                        width: 140,
                                        textAlign: "center",
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 14,
                                        color: "#8B5E3C",
                                    }}
                                >
                                    Acciones
                                </Text>
                            </View>
                            {mentions.length === 0 ? (
                                <View style={{ padding: 16 }}>
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                            color: "#4A3725",
                                            textAlign: "center",
                                        }}
                                    >
                                        No hay menciones agregadas.
                                    </Text>
                                </View>
                            ) : (
                                mentions.map((m) => (
                                    <View
                                        key={m.localId}
                                        style={{
                                            flexDirection: "row",
                                            padding: 12,
                                            alignItems: "center",
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#E5D4C1",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                flex: 2,
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                fontSize: 14,
                                                color: "#4A3725",
                                            }}
                                        >
                                            {m.title}
                                        </Text>
                                        <Text
                                            style={{
                                                flex: 2,
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                fontSize: 14,
                                                color: "#2B6CB0",
                                            }}
                                        >
                                            {m.link}
                                        </Text>
                                        <Text
                                            style={{
                                                flex: 3,
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                                fontSize: 14,
                                                color: "#4A3725",
                                            }}
                                        >
                                            {m.description}
                                        </Text>

                                        <View
                                            style={{
                                                width: 140,
                                                alignItems: "center",
                                                flexDirection: "row",
                                                justifyContent: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() =>
                                                    startEditMention(m)
                                                }
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    backgroundColor: "#D7E3FC",
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily:
                                                            "CrimsonText-Regular",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Editar
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() =>
                                                    removeMentionLocal(
                                                        m.localId
                                                    )
                                                }
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    backgroundColor: "#F3D6C1",
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily:
                                                            "CrimsonText-Regular",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Eliminar
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    {/* botón Guardar */}
                    <View style={{ gap: 16 }}>
                        <Button
                            title="Guardar cambios"
                            onPress={handleSave}
                            style={{
                                backgroundColor: "#6B705C",
                                borderRadius: 12,
                                paddingVertical: 14,
                            }}
                            textStyle={{
                                fontFamily: "MateSC-Regular",
                                fontWeight: "bold",
                                fontSize: 16,
                                color: "#FFFFFF",
                            }}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Modal Estantería */}
            <SimplePickerModal
                visible={shelfPickerOpen}
                title="Seleccionar estantería"
                items={shelfItems}
                selectedValue={shelfIdFromCode ?? null}
                onSelect={(value) => {
                    const selectedShelf = shelfs.find(
                        (s) => s.id === Number(value)
                    );
                    if (selectedShelf) setShelfCode(String(selectedShelf.code));
                    setShelfPickerOpen(false);
                }}
                onClose={() => setShelfPickerOpen(false)}
            />

            {/* Modal Arqueólogo */}
            <SimplePickerModal
                visible={archPickerOpen}
                title="Seleccionar arqueólogo"
                items={archItems}
                selectedValue={archaeologistId ?? null}
                onSelect={(value) => {
                    setArchaeologistId(Number(value));
                    setArchPickerOpen(false);
                }}
                onClose={() => setArchPickerOpen(false)}
            />

            {/* Modal Sitio Arqueológico */}
            <SimplePickerModal
                visible={archaeologicalSitePickerOpen}
                title="Seleccionar sitio arqueológico"
                items={archSiteItems}
                selectedValue={archaeologicalSiteId ?? null}
                onSelect={(value) => {
                    setArchaeologicalSiteId(Number(value));
                    setArchaeologicalSitePickerOpen(false);
                }}
                onClose={() => setArchaeologicalSitePickerOpen(false)}
            />

            {/* Modal Clasificador Interno */}
            <SimplePickerModal
                visible={internalClassifierPickerOpen}
                title="Seleccionar clasificador interno"
                items={internalClassifierNameItems}
                selectedValue={selectedInternalClassifierName ?? null}
                onSelect={(value) => {
                    setSelectedInternalClassifierName(String(value));
                    setInternalClassifierPickerOpen(false);
                }}
                onClose={() => setInternalClassifierPickerOpen(false)}
            />

            {/* Modal Colección */}
            <SimplePickerModal
                visible={collPickerOpen}
                title="Seleccionar colección"
                items={collItems}
                selectedValue={collectionId ?? null}
                onSelect={(value) => {
                    setCollectionId(Number(value));
                    setCollPickerOpen(false);
                }}
                onClose={() => setCollPickerOpen(false)}
            />

            {/* Inputs ocultos web (INPL) */}
            {Platform.OS === "web" && (
                <>
                    <input
                        ref={inplAddInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleWebAddInplFiles}
                    />
                    <input
                        ref={inplReplaceInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleWebReplaceInplFile}
                    />
                </>
            )}
        </View>
    );
}
