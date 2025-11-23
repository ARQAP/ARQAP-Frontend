import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

import { useAllArchaeologicalSites } from "@/hooks/useArchaeologicalsite";
import { useArchaeologists } from "@/hooks/useArchaeologist";
import {
  useCreateArtefact,
  useUploadArtefactHistoricalRecord,
  useUploadArtefactPicture,
} from "@/hooks/useArtefact";
import { useInternalClassifiers } from "@/hooks/useInternalClassifier";
import {
  useCreatePhysicalLocation,
  usePhysicalLocations,
} from "@/hooks/usePhysicalLocation";
import { ArtefactRepository } from "@/repositories/artefactRepository";
import { useRouter } from "expo-router";
import { useCollections } from "../../../hooks/useCollections";
import { useShelves } from "../../../hooks/useShelf";

import { Ionicons } from "@expo/vector-icons";

import { apiClient } from "@/lib/api";
import { INPLRepository } from "@/repositories/inplClassifierRepository";
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

  // Estados para validaciones
  const [nameError, setNameError] = useState("");
  const [materialError, setMaterialError] = useState("");

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
  const [selectedLevel, setSelectedLevel] = useState<number>(0); // 0..3 → NIVEL 1 por defecto
  const [selectedColumn, setSelectedColumn] = useState<number>(0); // 0..3 → A por defecto
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

  // WEB inputs refs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const inplInputRef = useRef<HTMLInputElement | null>(null);

  // -------- data remota ----------
  const { data: collections = [] } = useCollections();
  const { data: archaeologists = [] } = useArchaeologists();
  const { data: shelfs = [] } = useShelves();
  const { data: locations = [] } = usePhysicalLocations();
  const { data: internalClassifiers = [] } = useInternalClassifiers();
  const { data: archaeologicalSites = [] } = useAllArchaeologicalSites();

  // -------- INPL ficha (imagen) ----------
  const [inplModalOpen, setInplModalOpen] = useState(false);
  const [inplPreviewUri, setInplPreviewUri] = useState<string | null>(null);

  const inplFileWebRef = useRef<File | null>(null);
  const inplFileNativeRef = useRef<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

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
        imageInputRef.current?.click();
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
      Alert.alert("Error", "No se pudo abrir el selector de imágenes.");
    }
  }

  async function pickInplFicha() {
    try {
      if (Platform.OS === "web") {
        inplInputRef.current?.click();
        return;
      }
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
        quality: 0.9,
      });
      const uri = res?.assets?.[0]?.uri as string | undefined;
      if (uri) {
        setInplPreviewUri(uri);
        inplFileNativeRef.current = {
          uri,
          name: "ficha_inpl.jpg",
          type: "image/jpeg",
        };
      }
    } catch (e) {
      console.warn("pickInplFicha error", e);
      Alert.alert("Error", "No se pudo abrir el selector de imágenes (INPL).");
    }
  }

  function onWebInplChange(e: any) {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;
    inplFileWebRef.current = file;
    const url = URL.createObjectURL(file);
    setInplPreviewUri(url);
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
        docInputRef.current?.click();
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
          type:
            res.mimeType ||
            (res.name?.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg"),
        };
      }
    } catch (e) {
      console.warn("pickFile error", e);
      Alert.alert("Error", "No se pudo abrir el selector de archivos.");
    }
  }

  function onWebDocChange(e: any) {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;
    recordFileRef.current = file;
    setDocName(file.name || "archivo");
  }

  // -------- test de conectividad ----------
  async function testConnectivity() {
    try {
      console.log("Testing connectivity to backend...");
      // Usamos el endpoint raíz que no requiere autenticación
      const response = await apiClient.get("/", {
        timeout: 5000,
      });
      console.log("Connectivity test successful:", response.status);
      console.log("Server response:", response.data);
      return true;
    } catch (error: any) {
      console.error("Connectivity test failed:", error);
      if (
        error.code === "NETWORK_ERROR" ||
        error.message === "Network Error" ||
        error.name === "AxiosError" ||
        !error.response
      ) {
        Alert.alert(
          "Error de Conexión",
          "No se puede conectar al servidor. Verifica:\n\n" +
            "• Que el backend esté corriendo\n" +
            "• Que estés conectado a la misma red WiFi\n" +
            "• Que la IP del servidor sea correcta (10.10.20.236:8080)\n" +
            "• Que no haya firewall bloqueando la conexión"
        );
      }
      return false;
    }
  }

  // -------- guardar ----------
  async function handleSave() {
    try {
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

      // ---------- Ubicación física ----------
      let ensuredPhysicalLocationId = physicalLocationId ?? null;

      if (!ensuredPhysicalLocationId) {
        if (!shelfIdFromCode) {
          Alert.alert(
            "Estantería inválida",
            "Ingresá un código de estantería válido o seleccioná una de la lista."
          );
          return;
        }
        const levelNumber = levels[selectedLevel] as 1 | 2 | 3 | 4; // 1..4
        const columnLetter = columns[selectedColumn] as "A" | "B" | "C" | "D"; // "A".."D"

        const createdLoc = await createPhysicalLocation.mutateAsync({
          level: levelNumber,
          column: columnLetter,
          shelfId: shelfIdFromCode,
        });

        ensuredPhysicalLocationId = createdLoc.id!;
      }

      // ---------- INPL ----------
      let inplClassifierIdCreated: number | null = null;

      if (
        (Platform.OS === "web" && inplFileWebRef.current) ||
        (Platform.OS !== "web" && inplFileNativeRef.current)
      ) {
        // Test de conectividad antes de intentar subir archivos
        const isConnected = await testConnectivity();
        if (!isConnected) {
          return; // Salir si no hay conectividad
        }

        try {
          console.log("Platform:", Platform.OS);
          console.log(
            "INPL File Reference:",
            Platform.OS === "web"
              ? inplFileWebRef.current
              : inplFileNativeRef.current
          );

          const files =
            Platform.OS === "web"
              ? [inplFileWebRef.current as File]
              : [inplFileNativeRef.current as any];

          console.log("Files to send:", files);
          const dto = await INPLRepository.create(files);
          console.log("INPL Created:", dto);
          inplClassifierIdCreated = dto?.id ?? null;

          if (!inplClassifierIdCreated) {
            throw new Error("No se obtuvo el id del INPLClassifier");
          }
        } catch (err: any) {
          console.error("INPL Creation Error:", err);
          console.error("Error details:", err.message);
          if (err.response) {
            console.error("Server response:", err.response.data);
            console.error("Server status:", err.response.status);
          }
          Alert.alert(
            "Error",
            `No se pudo crear la Ficha INPL: ${err.message}`
          );
          return; // abortar el guardado si falla la creación del INPL
        }
      }

      // ---------- Normalizador de links ----------
      const norm = (s: string) =>
        !s ? null : /^https?:\/\//i.test(s) ? s : `https://${s}`;

      // ---------- Payload artefacto ----------
      const artefactPayload = {
        name: name.trim(),
        material: material.trim(),
        observation: observation.trim() || null,
        available,
        description: description.trim() || null,
        collectionId: collectionId ?? null,
        archaeologistId: archaeologistId ?? null,
        internalClassifierId: internalClassifierId ?? null,
        physicalLocationId: ensuredPhysicalLocationId ?? null,
        archaeologicalSiteId,
        inplClassifierId: inplClassifierIdCreated ?? null,
      };

      // ---------- Payload menciones ----------
      const mentionsPayload =
        mentions?.map((m) => ({
          title: (m.title ?? "").trim(),
          link: norm(m.link),
          description: (m.description ?? "").trim() || null,
        })) ?? [];

      // ---------- Crear artefacto + menciones en el backend ----------
      const created = await ArtefactRepository.createWithMentions({
        artefact: artefactPayload,
        mentions: mentionsPayload,
      });

      // ---------- Subir imagen ----------
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

      // ---------- Subir ficha histórica ----------
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

      // ---------- Limpiar estado ----------
      setPhotoUri(null);
      setDocName(null);
      pictureFileRef.current = null;
      nativePictureRef.current = null;
      setInplPreviewUri(null);
      inplFileWebRef.current = null;
      inplFileNativeRef.current = null;
      setMentions([]);
      setMentionTitle("");
      setMentionLink("");
      setMentionDescription("");

      Alert.alert("OK", "Pieza creada correctamente.");
      router.push("/(tabs)/archaeological-Pieces/View_pieces");
    } catch (e: any) {
      console.warn(e);

      if (e?.response?.data?.error) {
        const errorMessage = e.response.data.error;

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

        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", e?.message ?? "No se pudo crear la pieza.");
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
      <Text style={{ fontFamily: "CrimsonText-Regular", fontSize: 16, color: "#4A3725" }}>
        {value || label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Nueva pieza arqueologica"
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
              Registro de Pieza Arqueológica
            </Text>
            <Text
              style={{
                fontFamily: "CrimsonText-Regular",
                fontSize: 16,
                color: "#A0785D",
              }}
            >
              Ingrese los datos de la nueva pieza arqueológica
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
                flexDirection: windowWidth < 520 ? "column" : "row",
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
                    borderColor: nameError ? "#ff4444" : "#E5D4C1",
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
                    borderColor: materialError ? "#ff4444" : "#E5D4C1",
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
              <Switch value={available} onValueChange={setAvailable} />
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
              onPress={() => setIntClsPickerOpen(true)}
            />
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
              <Ionicons name="arrow-forward-outline" size={16} color="#8B5E3C" />
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
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: 92, height: 92, borderRadius: 12 }}
                  />
                ) : null}
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
                  SUBIR IMAGEN
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
                onPress={() => setInplModalOpen(true)}
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
                  SUBIR FICHA INPL
                </Text>
              </TouchableOpacity>

              {Platform.OS === "web" ? (
                <>
                  <input
                    ref={imageInputRef}
                    id="file-image"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onWebImageChange}
                  />
                  <input
                    ref={docInputRef}
                    id="file-doc"
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: "none" }}
                    onChange={onWebDocChange}
                  />
                  <input
                    ref={inplInputRef}
                    id="file-inpl"
                    type="file"
                    accept="image/*"
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
                  fontSize: 14,
                  color: "#4A3725",
                }}
              >
                Archivo: {docName}
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
                    ? (collections.find((c) => c.id === collectionId)?.name ??
                      "Sin colección")
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

            {/* Sitio + Estantería */}
            <View
              style={{
                flexDirection: windowWidth < 520 ? "column" : "row",
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

              <View style={{ width: windowWidth < 520 ? "100%" : 180 }}>
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
                    marginTop: 8,
                  }}
                  onPress={() => {
                    router.push("/(tabs)/archaeological-Pieces/New_shelf");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Crear nueva Estantería"
                >
                  <Text
                    style={{
                      color: "#8B5E3C",
                      marginRight: 6,
                      fontFamily: "MateSC-Regular",
                      fontSize: 14,
                    }}
                  >
                    Crear nueva Estantería
                  </Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#8B5E3C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

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
                  ESTANTERIA {shelfCode || "--"}
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
                          selectedLevel === li && selectedColumn === ci;
                        return (
                          <View
                            key={c}
                            style={{
                              flex: 1,
                              paddingHorizontal: 2,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedLevel(li);
                                setSelectedColumn(ci);
                              }}
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
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <Text
              style={{
                marginTop: 12,
                fontFamily: "CrimsonText-Regular",
                fontSize: 14,
                color: "#4A3725",
                textAlign: "center",
              }}
            >
              Ubicación física ID seleccionado: {physicalLocationId ?? "—"}
            </Text>
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
                flexDirection: windowWidth < 520 ? "column" : "row",
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
                  Título
                </Text>
                <TextInput
                  value={mentionTitle}
                  onChangeText={setMentionTitle}
                  placeholder="Ingrese el título"
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  maxLength={100}
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

              <View style={{ width: windowWidth < 520 ? "100%" : 200 }}>
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
                  maxLength={246}
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

            {/* descripción */}
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

            {/* botón agregar */}
            <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
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

                  // al menos nombre o enlace
                  if (!title && !link) return;

                  const m = {
                    id: Date.now(),
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
                <Text style={{ flex: 2, fontFamily: "MateSC-Regular", fontSize: 14, color: "#8B5E3C" }}>
                  Nombre
                </Text>
                <Text style={{ flex: 2, fontFamily: "MateSC-Regular", fontSize: 14, color: "#8B5E3C" }}>
                  Enlace
                </Text>
                <Text style={{ flex: 3, fontFamily: "MateSC-Regular", fontSize: 14, color: "#8B5E3C" }}>
                  Descripción
                </Text>
                <Text
                  style={{
                    width: 100,
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
                    key={m.id}
                    style={{
                      flexDirection: "row",
                      padding: 12,
                      alignItems: "flex-start",
                      borderBottomWidth: 1,
                      borderBottomColor: "#E5D4C1",
                    }}
                  >
                    {/* NOMBRE */}
                    <View style={{ flex: 2, paddingRight: 8, minWidth: 0 }}>
                      <Text
                        style={{
                          fontFamily: "CrimsonText-Regular",
                          fontSize: 14,
                          color: "#4A3725",
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
                    </View>

                    {/* ENLACE */}
                    <View style={{ flex: 2, paddingRight: 8, minWidth: 0 }}>
                      <Text
                        style={{
                          fontFamily: "CrimsonText-Regular",
                          fontSize: 14,
                          color: "#2B6CB0",
                          flexShrink: 1,
                          ...(Platform.OS === "web"
                            ? ({ wordBreak: "break-all" } as any)
                            : {}),
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {m.link}
                      </Text>
                    </View>

                    {/* DESCRIPCIÓN */}
                    <View style={{ flex: 3, paddingRight: 8, minWidth: 0 }}>
                      <Text
                        style={{
                          fontFamily: "CrimsonText-Regular",
                          fontSize: 14,
                          color: "#4A3725",
                          flexShrink: 1,
                          ...(Platform.OS === "web"
                            ? ({ wordBreak: "break-word" } as any)
                            : {}),
                        }}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {m.description}
                      </Text>
                    </View>

                    {/* ACCIONES */}
                    <View style={{ width: 100, alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() =>
                          setMentions((prev) => prev.filter((x) => x.id !== m.id))
                        }
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          backgroundColor: "#F3D6C1",
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontFamily: "CrimsonText-Regular", fontSize: 12 }}>
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
          <View style={{ gap: 16 }}>
            <Button
              title="Crear pieza"
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
      {/* Modal Ficha INPL */}
      {inplModalOpen && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              width: Math.min(containerWidth, 520),
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              gap: 16,
              shadowColor: "#8B5E3C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontFamily: "MateSC-Regular",
                fontSize: 20,
                fontWeight: "600",
                color: "#8B5E3C",
              }}
            >
              Cargar Ficha INPL
            </Text>

            {inplPreviewUri ? (
              <Image
                source={{ uri: inplPreviewUri }}
                style={{ width: "100%", height: 220, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  height: 180,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5D4C1",
                  backgroundColor: "#F7F5F2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 14,
                    color: "#4A3725",
                  }}
                >
                  Sin imagen seleccionada
                </Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                onPress={pickInplFicha}
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
                  ELEGIR IMAGEN
                </Text>
              </TouchableOpacity>

              {!!inplPreviewUri && (
                <TouchableOpacity
                  onPress={() => {
                    setInplPreviewUri(null);
                    inplFileWebRef.current = null;
                    inplFileNativeRef.current = null;
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#F3D6C1",
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#4A3725",
                      fontFamily: "CrimsonText-Regular",
                      fontSize: 14,
                    }}
                  >
                    QUITAR
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setInplModalOpen(false)}
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
                  LISTO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
