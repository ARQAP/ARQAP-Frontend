// app/(tabs)/archaeological-Pieces/New_piece.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  useWindowDimensions,
} from "react-native";
import Navbar from "../Navbar";
import Button from "../../../components/ui/Button";
import Colors from "../../../constants/Colors";

import { useRouter } from "expo-router";
import { ArtefactRepository } from "@/repositories/artefactRepository";
import { INPLRepository } from "@/repositories/inplClassifierRepository";
import {
  useCreateArtefact,
  useUploadArtefactHistoricalRecord,
  useUploadArtefactPicture,
} from "@/hooks/useArtefact";
import { useCollections } from "../../../hooks/useCollections";
import { useArchaeologists } from "@/hooks/useArchaeologist";
import { useShelf, useShelves } from "../../../hooks/useShelf";
import {
  usePhysicalLocations,
  useCreatePhysicalLocation,
} from "@/hooks/usePhysicalLocation";
import { useInternalClassifiers } from "@/hooks/useInternalClassifier";
import { useAllArchaeologicalSites } from "@/hooks/useArchaeologicalsite";

import { Feather } from "@expo/vector-icons";

import SimplePickerModal, {
  SimplePickerItem,
} from "../../../components/ui/SimpleModal";

export default function NewPiece() {
  const router = useRouter();

  // -------- form fields (básicos) ----------
  const [name, setName] = useState("");
  const [material, setMaterial] = useState("");
  const [observation, setObservation] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);

  // -------- modales pickers ----------
  const [archPickerOpen, setArchPickerOpen] = useState(false);
  const [collPickerOpen, setCollPickerOpen] = useState(false);
  const [intClsPickerOpen, setIntClsPickerOpen] = useState(false);
  const [shelfPickerOpen, setShelfPickerOpen] = useState(false);
  const [archaeologicalSitePickerOpen, setArchaeologicalSitePickerOpen] =
    useState(false);

  // -------- relaciones (IDs) ----------
  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [archaeologistId, setArchaeologistId] = useState<number | null>(null);
  const [internalClassifierId, setInternalClassifierId] = useState<
    number | null
  >(null);
  const [shelfCode, setShelfCode] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number>(2); // 0..3 → NIVEL 3 por defecto
  const [selectedColumn, setSelectedColumn] = useState<number>(2); // 0..3 → C por defecto
  const [archaeologicalSiteId, setArchaeologicalSiteId] = useState<
    number | null
  >(null);

  // --------    menciones     ----------
  const [mentionTitle, setMentionTitle] = useState("");
  const [mentionLink, setMentionLink] = useState("");
  const [mentionDescription, setMentionDescription] = useState("");
  const [mentions, setMentions] = useState<
    Array<{ id: number; title: string; link: string; description: string }>
  >([]);

  // -------- data remota ----------
  const { data: collections = [] } = useCollections();
  const { data: archaeologists = [] } = useArchaeologists();
  const { data: shelfs = [] } = useShelves();
  const { data: locations = [] } = usePhysicalLocations();
  const { data: internalClassifiers = [] } = useInternalClassifiers();
  const { data: archaeologicalSites = [] } = useAllArchaeologicalSites();

  // -------- uploads ----------
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);

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

  // -------- uploads INPL ----------
  const [inplDocName, setInplDocName] = useState<string | null>(null);

  const inplFilesRef = useRef<File[] | null>(null); // web - múltiples
  const nativeINPLRefs = useRef<
    { uri: string; name: string; type: string }[] | null
  >(null); // nativo - múltiples

  // -------- hooks de mutación ----------
  const createArtefact = useCreateArtefact();
  const uploadPicture = useUploadArtefactPicture();
  const uploadRecord = useUploadArtefactHistoricalRecord();
  const createPhysicalLocation = useCreatePhysicalLocation(); // <-- crear ubicación física on-the-fly

  // -------- layout ----------
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
    const levelNumber = levels[selectedLevel]; // 1..4
    const columnLetter = columns[selectedColumn]; // "A".."D"
    const found = locations.find(
      (l) =>
        Number(l.shelfId) === shelfIdFromCode &&
        Number(l.level) === levelNumber &&
        String(l.column) === columnLetter
    );
    return found?.id ?? null;
  }, [locations, shelfIdFromCode, selectedLevel, selectedColumn]);

  // -------- mapeos a items para los modales (reutilizable) ----------
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

  const intClsItems: SimplePickerItem<(typeof internalClassifiers)[number]>[] =
    useMemo(
      () =>
        internalClassifiers.map((ic) => ({
          value: ic.id!,
          label: `#${ic.number} (${ic.color})`,
          raw: ic,
        })),
      [internalClassifiers]
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

  const archaeologicalSiteItems: SimplePickerItem<
    (typeof archaeologicalSites)[number]
  >[] = useMemo(
    () =>
      archaeologicalSites.map((s) => ({
        value: s.id!,
        label: s.Name,
        raw: s,
      })),
    [archaeologicalSites]
  );

  // -------- pickers / uploads ----------
  async function pickImage() {
    try {
      if (Platform.OS === "web") {
        // disparar input hidden
        (document.getElementById("file-image") as HTMLInputElement)?.click();
        return;
      }
      // nativo
      let ImagePicker: any;
      try {
        ImagePicker = await import("expo-image-picker");
      } catch {
        Alert.alert(
          "Falta dependencia",
          "Instalá expo-image-picker para elegir imágenes."
        );
        return;
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permiso para acceder a la galería."
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      const uri = res?.assets?.[0]?.uri as string | undefined;
      if (uri) {
        setPhotoUri(uri);
        nativePictureRef.current = {
          uri,
          name: "picture.jpg",
          type: "image/jpeg",
        };
      }
    } catch (e) {
      console.warn("pickImage error", e);
    }
  }

  function onWebImageChange(e: any) {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;
    pictureFileRef.current = file;
    const url = URL.createObjectURL(file);
    setPhotoUri(url);
  }

  async function pickFile() {
    try {
      if (Platform.OS === "web") {
        (document.getElementById("file-doc") as HTMLInputElement)?.click();
        return;
      }
      let DocumentPicker: any;
      try {
        DocumentPicker = await import("expo-document-picker");
      } catch {
        Alert.alert(
          "Falta dependencia",
          "Instalá expo-document-picker para elegir archivos."
        );
        return;
      }
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });
      if (res.type === "success") {
        setDocName(res.name || "archivo");
        nativeRecordRef.current = {
          uri: res.uri,
          name: res.name || "document.pdf",
          // tipo aproximado
          type:
            res.mimeType ||
            (res.name?.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg"),
        };
      }
    } catch (e) {
      console.warn("pickFile error", e);
    }
  }

  async function pickFileINPL() {
    try {
      if (Platform.OS === "web") {
        // ⬅️ ahora dispara el input exclusivo de INPL
        (document.getElementById("file-inpl") as HTMLInputElement)?.click();
        return;
      }
      let DocumentPicker: any;
      try {
        DocumentPicker = await import("expo-document-picker");
      } catch {
        Alert.alert(
          "Falta dependencia",
          "Instalá expo-document-picker para elegir archivos."
        );
        return;
      }

      // ⬅️ permite múltiples en nativo
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
      });

      // En SDKs recientes viene en res.assets, en otros puede venir como array
      const assets = (res?.assets ?? (Array.isArray(res) ? res : [])) as any[];

      if (assets?.length) {
        nativeINPLRefs.current = assets.map((a) => ({
          uri: a.uri,
          name: a.name || "inpl.pdf",
          type:
            a.mimeType ||
            (a.name?.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg"),
        }));
        setInplDocName(
          assets.length === 1
            ? assets[0].name || "archivo"
            : `${assets.length} archivos`
        );
      }
    } catch (e) {
      console.warn("pickFileINPL error", e);
    }
  }

  function onWebInplChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files: File[] = Array.from(input?.files ?? []);
    if (!files.length) {
      input.value = "";
      return;
    }

    inplFilesRef.current = files;
    setInplDocName(
      files.length === 1
        ? files[0].name
        : `${files.length} archivos seleccionados`
    );

    // permite volver a elegir los mismos archivos
    input.value = "";
  }

  function onWebDocChange(e: any) {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;
    recordFileRef.current = file;
    setDocName(file.name || "archivo");
  }

  // -------- guardar ----------
  async function handleSave() {
    try {
      if (!name.trim()) {
        Alert.alert("Falta nombre", "El nombre es obligatorio.");
        return;
      }

      // 1) asegurar ubicación física como ya lo hacías ...
      let ensuredPhysicalLocationId = physicalLocationId ?? null;
      if (!ensuredPhysicalLocationId) {
        if (!shelfIdFromCode) {
          Alert.alert(
            "Estantería inválida",
            "Ingresá un código de estantería válido o seleccioná una de la lista."
          );
          return;
        }
        const levelNumber = levels[selectedLevel] as 1 | 2 | 3 | 4;
        const columnLetter = columns[selectedColumn] as "A" | "B" | "C" | "D";
        const createdLoc = await createPhysicalLocation.mutateAsync({
          level: levelNumber,
          column: columnLetter,
          shelfId: shelfIdFromCode,
        });
        ensuredPhysicalLocationId = createdLoc.id!;
      }

      // 2) si hay archivos INPL seleccionados, crear el INPL Classifier ya mismo
      let inplClassifierIdToUse: number | null = null;
      try {
        if (Platform.OS === "web" && inplFilesRef.current?.length) {
          const createdINPL = await INPLRepository.create(
            inplFilesRef.current as any
          );
          inplClassifierIdToUse = createdINPL.id;
        } else if (Platform.OS !== "web" && nativeINPLRefs.current?.length) {
          const createdINPL = await INPLRepository.create(
            nativeINPLRefs.current as any
          );
          inplClassifierIdToUse = createdINPL.id;
        }
      } catch (err) {
        console.warn(
          "[INPL] no se pudo crear el classifier, sigo sin INPL:",
          err
        );
      }

      // web
      if (Platform.OS === "web" && inplFilesRef.current?.length) {
        const createdINPL = await INPLRepository.create(inplFilesRef.current);
        inplClassifierIdToUse = createdINPL.id;
      }

      // nativo
      if (Platform.OS !== "web" && nativeINPLRefs.current?.length) {
        // RN FormData acepta objetos { uri, name, type }, el repo hace append("fichas[]", f)
        const createdINPL = await INPLRepository.create(
          nativeINPLRefs.current as any
        );
        inplClassifierIdToUse = createdINPL.id;
      }

      // 3) crear la pieza con el inplClassifierId si lo tenemos
      const payload = {
        name: name.trim(),
        material: material.trim() || null,
        observation: observation.trim() || null,
        available,
        description: description.trim() || null,

        collectionId: collectionId ?? null,
        archaeologistId: archaeologistId ?? null,
        internalClassifierId: internalClassifierId ?? null,
        physicalLocationId: ensuredPhysicalLocationId ?? null,

        archaeologicalSiteId,
        inplClassifierId: inplClassifierIdToUse, // ⬅️ ahora sí
      };

      const created = await createArtefact.mutateAsync(payload);

      setPhotoUri(null);
      setDocName(null);
      pictureFileRef.current = null;
      nativePictureRef.current = null;

      // 4) subir imagen y ficha histórica (igual que antes)
      if (Platform.OS === "web" && pictureFileRef.current) {
        await uploadPicture.mutateAsync({
          id: created.id!,
          file: pictureFileRef.current,
        });
      } else if (Platform.OS !== "web" && nativePictureRef.current) {
        const fd = new FormData();
        fd.append("picture", nativePictureRef.current as any);
        await ArtefactRepository.uploadPicture(
          created.id!,
          (fd as any).get("picture") as any
        );
      }

      if (Platform.OS === "web" && recordFileRef.current) {
        await uploadRecord.mutateAsync({
          id: created.id!,
          file: recordFileRef.current,
        });
      } else if (Platform.OS !== "web" && nativeRecordRef.current) {
        const fd = new FormData();
        fd.append("document", nativeRecordRef.current as any);
        await ArtefactRepository.uploadHistoricalRecord(
          created.id!,
          (fd as any).get("document") as any
        );
      }

      // 5) menciones (sin cambios)
      const norm = (s: string) =>
        !s ? null : /^https?:\/\//i.test(s) ? s : `https://${s}`;

      if (mentions?.length) {
        console.log("Creating mentions", mentions);
        await Promise.all(
          mentions.map((m) => {
            const payload = {
              localId: null,
              artefactId: created.id!,
              title: (m.title ?? "").trim(),
              link: norm(m.link),
              description: (m.description ?? "").trim() || null,
            };

            return ArtefactRepository.createMention(payload).then((res) => {
              console.log("Created mention", payload, res);
              return res;
            });
          })
        );
      }

      Alert.alert("OK", "Pieza creada correctamente.");
      router.push("/(tabs)/archaeological-Pieces/View_pieces");
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Error", e?.message ?? "No se pudo crear la pieza.");
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
      <Navbar title="Nueva pieza arqueologica" showBackArrow backToHome />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text
          style={{
            fontWeight: "700",
            marginBottom: 8,
            fontFamily: "MateSC-Regular",
            color: Colors.black,
          }}
        >
          Ingrese los datos de la nueva pieza arqueológica
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
              onChangeText={setName}
              placeholder="Nombre"
              style={{
                backgroundColor: "#fff",
                borderRadius: 6,
                padding: 8,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
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
              onChangeText={setMaterial}
              placeholder="Material"
              style={{
                backgroundColor: "#fff",
                borderRadius: 6,
                padding: 8,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
              }}
            />
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

        {/* clasificador interno (select simple) */}
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
              Clasificador interno
            </Text>
            <SimpleSelectRow
              label="Seleccionar clasificador"
              value={
                internalClassifierId
                  ? (() => {
                      const ic = internalClassifiers.find(
                        (x) => x.id === internalClassifierId
                      );
                      return ic
                        ? `#${ic.number} (${ic.color})`
                        : "Seleccionar clasificador";
                    })()
                  : "Seleccionar clasificador"
              }
              onPress={() => setIntClsPickerOpen(true)} // abrir modal reutilizable
            />
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
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
                  color: "#A68B5B",
                  marginRight: 6,
                  fontFamily: "MateSC-Regular",
                }}
              >
                Crear nuevo Clasificador Interno
              </Text>
              <Feather name="arrow-up-right" size={16} color="#A68B5B" />
            </TouchableOpacity>
          </View>

          {/* descripción */}
          <View style={{ flex: 1 }}>
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
                minHeight: 56,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
              }}
            />
          </View>
        </View>

        {/* Imagen + Ficha */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
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
            }}
          >
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
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 92, height: 92, borderRadius: 6 }}
                />
              ) : null}
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
                SUBIR IMAGEN
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
                SUBIR FICHA HISTORICA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFileINPL}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: Colors.lightBrown,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ color: "#fff", fontFamily: "CrimsonText-Regular" }}
              >
                SUBIR FICHA INPL
              </Text>
            </TouchableOpacity>

            {Platform.OS === "web" ? (
              <>
                <input
                  id="file-image"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onWebImageChange}
                />
                <input
                  id="file-doc"
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={onWebDocChange}
                />
                <input
                  id="file-inpl"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={onWebInplChange}
                />
              </>
            ) : null}
          </View>
          {docName ? (
            <Text
              style={{
                marginTop: 8,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
              }}
            >
              Archivo: {docName}
            </Text>
          ) : null}

          {inplDocName ? (
            <Text
              style={{
                marginTop: 4,
                fontFamily: "CrimsonText-Regular",
                color: Colors.black,
              }}
            >
              INPL: {inplDocName}
            </Text>
          ) : null}
        </View>

        {/* Colección */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
            }}
          >
            Colección
          </Text>
          <SimpleSelectRow
            label="Sin colección"
            value={
              collectionId
                ? (collections.find((c) => c.id === collectionId)?.name ??
                  "Sin colección")
                : "Sin colección"
            }
            onPress={() => setCollPickerOpen(true)} // abrir modal reutilizable
          />
        </View>

        {/* Arqueólogo */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
              fontFamily: "MateSC-Regular",
              color: Colors.black,
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
                      (x) => x.id === archaeologistId
                    );
                    return a
                      ? `${a.firstname} ${a.lastname}`
                      : "Seleccionar arqueólogo";
                  })()
                : "Seleccionar arqueólogo"
            }
            onPress={() => setArchPickerOpen(true)} // abrir modal reutilizable
          />
        </View>

        {/* Sitio (placeholder) + Estantería */}
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
              Sitio arqueológico
            </Text>
            <SimpleSelectRow
              label="Seleccionar sitio arqueológico"
              value={
                archaeologicalSiteId
                  ? (archaeologicalSites.find(
                      (s) => s.id === archaeologicalSiteId
                    )?.Name ?? "Seleccionar sitio arqueológico")
                  : "Seleccionar sitio arqueológico"
              }
              onPress={() => setArchaeologicalSitePickerOpen(true)}
            />
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

            <SimpleSelectRow
              label="Seleccionar estantería"
              value={shelfIdFromCode ? `Estantería ${shelfCode}` : undefined}
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
              onPress={() => {
                router.push("/(tabs)/archaeological-Pieces/New_shelf");
              }}
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

        {/* Ubicación física (grid) */}
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
          {/* Stack vertically on small screens to avoid layout breakage */}
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

          <View style={{ alignItems: "flex-end", marginBottom: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.green,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                // add mention
                const title = mentionTitle.trim();
                const link = mentionLink.trim();
                const desc = mentionDescription.trim();
                if (!title && !link) {
                  // require at least a name or link
                  return;
                }
                const m = { id: Date.now(), title, link, description: desc };
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
                  key={m.id}
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
                  <View style={{ width: 80, alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() =>
                        setMentions((prev) => prev.filter((x) => x.id !== m.id))
                      }
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

        {/* Guardar */}
        <View style={{ marginTop: 12 }}>
          <Button
            title="Crear pieza"
            onPress={handleSave}
            className="bg-[#6B705C] rounded-lg py-3 items-center"
            textClassName="text-white"
          />
        </View>
      </ScrollView>

      <SimplePickerModal
        visible={shelfPickerOpen}
        title="Seleccionar estantería"
        items={shelfItems}
        selectedValue={shelfIdFromCode ?? null}
        onSelect={(value) => {
          const selectedShelf = shelfs.find((s) => s.id === Number(value));
          if (selectedShelf) {
            setShelfCode(String(selectedShelf.code));
          }
          setShelfPickerOpen(false);
        }}
        onClose={() => setShelfPickerOpen(false)}
      />

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

      {/* Modal Clasificador Interno */}
      <SimplePickerModal
        visible={intClsPickerOpen}
        title="Seleccionar clasificador interno"
        items={intClsItems}
        selectedValue={internalClassifierId ?? null}
        onSelect={(value) => {
          setInternalClassifierId(Number(value));
          setIntClsPickerOpen(false);
        }}
        onClose={() => setIntClsPickerOpen(false)}
      />

      <SimplePickerModal
        visible={archaeologicalSitePickerOpen}
        title="Seleccionar sitio arqueológico"
        items={archaeologicalSiteItems}
        selectedValue={archaeologicalSiteId ?? null}
        onSelect={(value) => {
          setArchaeologicalSiteId(Number(value));
          setArchaeologicalSitePickerOpen(false);
        }}
        onClose={() => setArchaeologicalSitePickerOpen(false)}
      />
    </View>
  );
}
