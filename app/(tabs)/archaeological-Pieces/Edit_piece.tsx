// app/(tabs)/archaeological-Pieces/Edit_piece.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Navbar from "../Navbar";
import Button from "../../../components/ui/Button";
import Colors from "../../../constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import {
  INPLRepository,
  INPLClassifierDTO,
} from "@/repositories/inplClassifierRepository";
import { useCollections } from "../../../hooks/useCollections";
import { useArchaeologists } from "../../../hooks/useArchaeologist";
import { useShelves } from "../../../hooks/useShelf";
import { useMentionsByArtefactId } from "@/hooks/useMentions";
import {
  usePhysicalLocations,
  useCreatePhysicalLocation,
  indexToLevel,
  indexToColumn,
} from "../../../hooks/usePhysicalLocation";

import SimplePickerModal, {
  SimplePickerItem,
} from "../../../components/ui/SimpleModal";

import { ArtefactRepository } from "@/repositories/artefactRepository";
import {
  useUploadArtefactHistoricalRecord,
  useUploadArtefactPicture,
} from "@/hooks/useArtefact";

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

  // -------- pickers (modales) ----------
  const [archPickerOpen, setArchPickerOpen] = useState(false);
  const [collPickerOpen, setCollPickerOpen] = useState(false);
  const [shelfPickerOpen, setShelfPickerOpen] = useState(false);

  // -------- relaciones (IDs) ----------
  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [archaeologistId, setArchaeologistId] = useState<number | null>(null);
  const [shelfCode, setShelfCode] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(2);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(2);

  // INPL
  const [inplClassifierId, setInplClassifierId] = useState<number | null>(null);
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
        label: `Estantería ${s.code}`,
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
    const normalized: MentionUI[] = (mentionsData as any[]).map((m, idx) => ({
      localId: Date.now() + idx, // key local
      id: m.id ? Number(m.id) : undefined,
      title: m.title ?? "",
      link: m.url ?? m.link ?? "",
      description: m.description ?? "",
    }));
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
    setColor(a?.internalClassifier?.color ?? "");

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
      arch?.name ?? [arch?.firstname, arch?.lastname].filter(Boolean).join(" ")
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
    setShelf(shelfCodeVal != null ? String(shelfCodeVal).padStart(2, "0") : "");
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
        : null;
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
              : null;
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
      Alert.alert("Error", "No se pudo eliminar la ficha histórica INPL.");
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
        if (!clsId) throw new Error("No se pudo crear el clasificador INPL.");

        // Enlazar el artefacto con este clasificador
        if (artefactId) {
          await ArtefactRepository.update(artefactId, {
            name: name,
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
      Alert.alert("Error", "No se pudieron cargar las fichas históricas INPL.");
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
      const uri = result?.assets?.[0]?.uri ?? (result as any)?.uri ?? null;
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
        shelfIdFromCode && selectedLevel != null && selectedColumn != null;

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

      const payload: any = {
        name: name.trim(),
        material: material.trim(), // Ya no permitimos null porque es obligatorio
        observation: observation.trim() || null,
        available,
        description: description.trim() || null,
        collectionId: collectionId ?? null,
        archaeologistId: archaeologistId ?? null,
        physicalLocationId: finalPhysicalLocationId, // <- garantizado o null si no hay selección
        archaeologicalSiteId: null,
        // ⚠️ NO forzamos a null el INPL acá, se mantiene lo que ya tenga la pieza.
        // inplClassifierId: null,
      };

      await ArtefactRepository.update(artefactId, payload);

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
      router.push("/(tabs)/archaeological-Pieces/View_pieces");
    } catch (e: any) {
      console.warn(e);

      // Manejar errores específicos del backend
      if (e?.response?.data?.error) {
        const errorMessage = e.response.data.error;

        // Verificar si es un error de validación específico
        if (errorMessage.includes("nombre") || errorMessage.includes("Name")) {
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

        // Mostrar otros errores del servidor
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", e?.message ?? "No se pudo actualizar la pieza.");
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
        backgroundColor: subdued ? "#f3f3f3" : "#fff",
        borderRadius: 6,
        padding: 8,
        borderWidth: 1,
        borderColor: "#E6DAC4",
      }}
    >
      <Text style={{ fontFamily: "CrimsonText-Regular", color: Colors.black }}>
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
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontWeight: "700",
            marginBottom: 8,
            fontFamily: "MateSC-Regular",
            color: Colors.black,
          }}
        >
          Edite los datos de la pieza arqueológica
        </Text>

        {/* nombre / material */}
        <View
          style={{
            flexDirection: windowWidth < 520 ? "column" : "row",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                marginBottom: 6,
                fontFamily: "MateSC-Regular",
                color: Colors.black,
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
              placeholder="Nombre"
              style={{
                backgroundColor: "#fff",
                borderRadius: 6,
                padding: 8,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
                borderWidth: nameError ? 1 : 0,
                borderColor: nameError ? "#ff4444" : "transparent",
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

          <View
            style={{ flex: 1, width: windowWidth < 520 ? "100%" : undefined }}
          >
            <Text
              style={{
                fontWeight: "700",
                marginBottom: 6,
                fontFamily: "MateSC-Regular",
                color: Colors.black,
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
              placeholder="Material"
              style={{
                backgroundColor: "#fff",
                borderRadius: 6,
                padding: 8,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
                borderWidth: materialError ? 1 : 0,
                borderColor: materialError ? "#ff4444" : "transparent",
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
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Observación
          </Text>
          <TextInput
            multiline
            value={observation}
            onChangeText={setObservation}
            placeholder="Observación de la pieza"
            style={{
              backgroundColor: "#fff",
              borderRadius: 6,
              padding: 8,
              minHeight: 80,
              fontFamily: "CrimsonText-Regular",
              color: Colors.black,
            }}
          />
        </View>

        {/* disponible */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Disponible
          </Text>
          <Switch value={available} onValueChange={setAvailable} />
        </View>

        {/* Colección (modal) */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Asociar pieza a una colección
          </Text>
          <SimpleSelectRow
            label="Sin colección"
            value={
              collectionId
                ? (collections.find((c) => c.id === collectionId)?.name ??
                  "Sin colección")
                : "Sin colección"
            }
            onPress={() => setCollPickerOpen(true)}
          />
        </View>

        {/* Arqueólogo (modal) */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Asociar pieza a un arqueólogo
          </Text>
          <SimpleSelectRow
            label="Seleccionar arqueólogo"
            value={
              archaeologistId
                ? (() => {
                    const a = archaeologists.find(
                      (x) => x.id === archaeologistId
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

        {/* Sitio (placeholder) + Estantería (modal) */}
        <View
          style={{
            flexDirection: windowWidth < 520 ? "column" : "row",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                marginBottom: 6,
                fontFamily: "MateSC-Regular",
                color: Colors.black,
              }}
            >
              Asociar pieza a un sitio arqueológico
            </Text>
            <SimpleSelectRow label="Seleccionar sitio" subdued />
          </View>

          <View style={{ width: windowWidth < 520 ? "100%" : 140 }}>
            <Text
              style={{
                fontWeight: "700",
                marginBottom: 6,
                fontFamily: "MateSC-Regular",
                color: Colors.black,
              }}
            >
              Estantería
            </Text>

            {/* Selector (abre modal reutilizable) */}
            <SimpleSelectRow
              label="Seleccionar estantería"
              value={shelfCode ? `Estantería ${shelfCode}` : undefined}
              onPress={() => setShelfPickerOpen(true)}
            />

            {/* Link: Crear nueva Estantería */}
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
              onPress={() =>
                router.push("/(tabs)/archaeological-Pieces/New_shelf")
              }
              accessibilityRole="button"
              accessibilityLabel="Crear nueva Estantería"
            >
              <Text
                style={{
                  color: "#A68B5B",
                  marginRight: 6,
                  fontFamily: "MateSC-Regular",
                }}
              >
                Crear nueva Estantería
              </Text>
              <Feather name="arrow-up-right" size={16} color="#A68B5B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Foto y Ficha */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Foto
          </Text>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                width: 96,
                height: 96,
                backgroundColor: "#FFF",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#DDD",
              }}
            >
              {(() => {
                if (photoUri) {
                  console.log(
                    "🔍 DEBUG - Renderizando imagen con URI:",
                    photoUri
                  );
                  return (
                    <Image
                      source={{ uri: photoUri }}
                      style={{ width: 92, height: 92, borderRadius: 6 }}
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
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: Colors.green,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ color: "#fff", fontFamily: "CrimsonText-Regular" }}
              >
                {hasExistingImage || photoUri
                  ? "REEMPLAZAR IMAGEN"
                  : "SUBIR IMAGEN"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickFile}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: Colors.brown,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ color: "#fff", fontFamily: "CrimsonText-Regular" }}
              >
                SUBIR FICHA HISTÓRICA
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
                color: Colors.black,
              }}
            >
              Archivo: {fileName}
            </Text>
          ) : null}
        </View>

        {/* INPL */}
        <View
          style={{
            marginTop: 16,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 8,
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
            FICHA INPL
          </Text>

          {/* Grid de fichas existentes (thumbnails con blob) */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {inplThumbs.length === 0 ? (
              <Text style={{ fontFamily: "CrimsonText-Regular" }}>
                No hay fichas INPL.
              </Text>
            ) : (
              inplThumbs.map((f) => (
                <View key={f.id} style={{ width: 160 }}>
                  <Image
                    source={{ uri: f.blobUrl }}
                    style={{
                      width: 160,
                      height: 120,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#E6DAC4",
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    {f.filename}
                  </Text>

                  <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setReplaceTargetId(f.id);
                        if (Platform.OS === "web")
                          inplReplaceInputRef.current?.click?.(); // en nativo: abrir DocumentPicker
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        backgroundColor: "#D7E3FC",
                        borderRadius: 6,
                      }}
                    >
                      <Text>Reemplazar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        await handleDeleteInplFicha(f.id);
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        backgroundColor: "#F3D6C1",
                        borderRadius: 6,
                      }}
                    >
                      <Text>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Botón Agregar fichas */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "web") inplAddInputRef.current?.click?.(); // en nativo abrir selector múltiple
            }}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: Colors.green,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff" }}>
              {inplClassifierId
                ? "AGREGAR FICHAS INPL"
                : "CREAR CLASIFICADOR + AGREGAR FICHAS"}
            </Text>
          </TouchableOpacity>

          {/* Inputs ocultos web */}
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

        {/* Descripción */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Descripción
          </Text>
          <TextInput
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción detallada de la pieza"
            style={{
              backgroundColor: "#fff",
              borderRadius: 6,
              padding: 8,
              minHeight: 100,
              fontFamily: "CrimsonText-Regular",
              color: Colors.black,
            }}
          />
        </View>

        {/* Ubicación física de la pieza */}
        <View
          style={{
            marginBottom: 8,
            backgroundColor: "#fff",
            padding: 8,
            borderRadius: 6,
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
                <Text
                  style={{
                    color: Colors.cremit,
                    fontFamily: "CrimsonText-Regular",
                  }}
                >
                  ESTANTERIA {shelfCode || "--"}
                </Text>
              </View>
            </View>
          </View>

          {/* encabezado columnas */}
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
                        COLUMNA {c}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* filas niveles */}
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
                <View
                  style={{
                    width: leftLabelWidth,
                    height: cellSize,
                    justifyContent: "center",
                  }}
                >
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
                      NIVEL {lvl}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row" }}>
                  {columns.map((c, ci) => {
                    const isSelected =
                      selectedLevel === li && selectedColumn === ci;
                    return (
                      <View
                        key={c}
                        style={{
                          width: cellSize,
                          paddingHorizontal: gap / 2,
                          marginRight: ci < columns.length - 1 ? gap : 0,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedLevel(li);
                            setSelectedColumn(ci);
                          }}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            borderRadius: 6,
                            backgroundColor: isSelected
                              ? Colors.brown
                              : "#EADFCB",
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <Text
            style={{
              marginTop: 8,
              fontFamily: "CrimsonText-Regular",
              color: Colors.black,
            }}
          >
            Ubicación física ID seleccionado: {physicalLocationId ?? "—"}
          </Text>
        </View>

        {/* Menciones: formulario para agregar + lista */}
        <View
          style={{
            marginTop: 16,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 8,
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
            MENCIONES DE LA PIEZA ARQUEOLÓGICA (OPCIONAL)
          </Text>

          {/* inputs: nombre + enlace */}
          <View
            style={{
              flexDirection: windowWidth < 520 ? "column" : "row",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: Colors.black,
                  marginBottom: 6,
                }}
              >
                NOMBRE
              </Text>
              <TextInput
                value={mentionTitle}
                onChangeText={setMentionTitle}
                placeholder="Nombre"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "#E6DAC4",
                }}
              />
            </View>
            <View style={{ width: windowWidth < 520 ? "100%" : 200 }}>
              <Text
                style={{
                  fontFamily: "MateSC-Regular",
                  color: Colors.black,
                  marginBottom: 6,
                }}
              >
                ENLACE
              </Text>
              <TextInput
                value={mentionLink}
                onChangeText={setMentionLink}
                placeholder="Enlace"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "#E6DAC4",
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                color: Colors.black,
                marginBottom: 6,
              }}
            >
              DESCRIPCIÓN
            </Text>
            <TextInput
              multiline
              value={mentionDescription}
              onChangeText={setMentionDescription}
              placeholder="Descripción"
              style={{
                backgroundColor: "#fff",
                borderRadius: 6,
                padding: 8,
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#E6DAC4",
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {editingLocalId == null ? (
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.green,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
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
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={commitEditMention}
                >
                  <Text
                    style={{
                      color: Colors.cremit,
                      fontFamily: "CrimsonText-Regular",
                    }}
                  >
                    ACTUALIZAR MENCIÓN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ccc",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={cancelEditMention}
                >
                  <Text
                    style={{
                      color: Colors.black,
                      fontFamily: "CrimsonText-Regular",
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
              borderColor: "#E6DAC4",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#EADFCB",
                padding: 8,
              }}
            >
              <Text style={{ flex: 2, fontFamily: "MateSC-Regular" }}>
                NOMBRE
              </Text>
              <Text style={{ flex: 2, fontFamily: "MateSC-Regular" }}>
                ENLACE
              </Text>
              <Text style={{ flex: 3, fontFamily: "MateSC-Regular" }}>
                DESCRIPCIÓN
              </Text>
              <Text
                style={{
                  width: 80,
                  textAlign: "center",
                  fontFamily: "MateSC-Regular",
                }}
              >
                ACCIONES
              </Text>
            </View>
            {mentions.length === 0 ? (
              <View style={{ padding: 12 }}>
                <Text
                  style={{
                    fontFamily: "CrimsonText-Regular",
                    color: Colors.black,
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
                    padding: 8,
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: "#F0E6DB",
                  }}
                >
                  <Text style={{ flex: 2, fontFamily: "CrimsonText-Regular" }}>
                    {m.title}
                  </Text>
                  <Text
                    style={{
                      flex: 2,
                      fontFamily: "CrimsonText-Regular",
                      color: "#2B6CB0",
                    }}
                  >
                    {m.link}
                  </Text>
                  <Text style={{ flex: 3, fontFamily: "CrimsonText-Regular" }}>
                    {m.description}
                  </Text>

                  <View
                    style={{
                      width: 140,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => startEditMention(m)}
                      style={{
                        padding: 6,
                        backgroundColor: "#D7E3FC",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontFamily: "CrimsonText-Regular" }}>
                        Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => removeMentionLocal(m.localId)}
                      style={{
                        padding: 6,
                        backgroundColor: "#F3D6C1",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontFamily: "CrimsonText-Regular" }}>
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
        <View style={{ marginTop: 12 }}>
          <Button
            title="Guardar cambios"
            onPress={handleSave}
            className="bg-[#6B705C] rounded-lg py-3 items-center"
            textClassName="text-white"
          />
        </View>
      </ScrollView>

      {/* Modal Estantería */}
      <SimplePickerModal
        visible={shelfPickerOpen}
        title="Seleccionar estantería"
        items={shelfItems}
        selectedValue={shelfIdFromCode ?? null}
        onSelect={(value) => {
          const selectedShelf = shelfs.find((s) => s.id === Number(value));
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

      {/* Inputs ocultos web (foto/ficha general) */}
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
