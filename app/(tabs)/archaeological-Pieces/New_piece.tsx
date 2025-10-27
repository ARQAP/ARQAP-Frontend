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
import { useCreateArtefact, useUploadArtefactHistoricalRecord, useUploadArtefactPicture } from "@/hooks/useArtefact";
import { useCollections } from "../../../hooks/useCollections";
import { useArchaeologists } from "@/hooks/useArchaeologist";
import { useShelf, useShelves } from "../../../hooks/useShelf";
import { usePhysicalLocations } from "@/hooks/usePhysicalLocation";
import { useInternalClassifiers } from "@/hooks/useInternalClassifier";

export default function NewPiece() {
  const router = useRouter();

  // -------- form fields (básicos) ----------
  const [name, setName] = useState("");
  const [material, setMaterial] = useState("");
  const [observation, setObservation] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);

  // -------- relaciones (IDs) ----------
  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [archaeologistId, setArchaeologistId] = useState<number | null>(null);
  const [internalClassifierId, setInternalClassifierId] = useState<number | null>(null);
  const [shelfCode, setShelfCode] = useState<string>("07"); // lo mostramos como texto, pero resolvemos ID real a partir del hook de shelves
  const [selectedLevel, setSelectedLevel] = useState<number>(2); // 0..3 → NIVEL 3 por defecto
  const [selectedColumn, setSelectedColumn] = useState<number>(2); // 0..3 → C por defecto

  // NO IMPLEMENTADO AÚN:
  const archaeologicalSiteId = null;

  // -------- data remota ----------
  const { data: collections = [] } = useCollections();
  const { data: archaeologists = [] } = useArchaeologists();
  const { data: shelfs = [] } = useShelves();
  const { data: locations = [] } = usePhysicalLocations();
  const { data: internalClassifiers = [] } = useInternalClassifiers();

  // -------- uploads ----------
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);

  // guardamos los archivos reales para enviar al backend
  const pictureFileRef = useRef<File | null>(null); // web
  const recordFileRef = useRef<File | null>(null); // web
  // en móvil RN usamos { uri, name, type }
  const nativePictureRef = useRef<{ uri: string; name: string; type: string } | null>(null);
  const nativeRecordRef = useRef<{ uri: string; name: string; type: string } | null>(null);

  // -------- hooks de mutación ----------
  const createArtefact = useCreateArtefact();
  const uploadPicture = useUploadArtefactPicture();
  const uploadRecord = useUploadArtefactHistoricalRecord();

  // -------- layout ----------
  const { width: windowWidth } = useWindowDimensions();
  const columns = ["A", "B", "C", "D"];
  const levels = [1, 2, 3, 4];
  const horizontalPadding = 48;
  const containerMaxWidth = 720;
  const leftLabelWidth = 64;
  const gap = 8;
  const containerWidth = Math.min(windowWidth - horizontalPadding, containerMaxWidth);
  const availableWidthForCells = Math.max(0, containerWidth - leftLabelWidth - gap * (columns.length - 1));
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
      (l) => Number(l.shelfId) === shelfIdFromCode && Number(l.level) === levelNumber && String(l.column) === columnLetter
    );
    return found?.id ?? null;
  }, [locations, shelfIdFromCode, selectedLevel, selectedColumn]);

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
        Alert.alert("Falta dependencia", "Instalá expo-image-picker para elegir imágenes.");
        return;
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos permiso para acceder a la galería.");
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
        nativePictureRef.current = { uri, name: "picture.jpg", type: "image/jpeg" };
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
        Alert.alert("Falta dependencia", "Instalá expo-document-picker para elegir archivos.");
        return;
      }
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (res.type === "success") {
        setDocName(res.name || "archivo");
        nativeRecordRef.current = {
          uri: res.uri,
          name: res.name || "document.pdf",
          // tipo aproximado
          type: res.mimeType || (res.name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        };
      }
    } catch (e) {
      console.warn("pickFile error", e);
    }
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

      const payload = {
        name: name.trim(),
        material: material.trim() || null,
        observation: observation.trim() || null,
        available,
        description: description.trim() || null,

        // relaciones implementadas
        collectionId: collectionId ?? null,
        archaeologistId: archaeologistId ?? null,
        internalClassifierId: internalClassifierId ?? null,
        physicalLocationId: physicalLocationId ?? null,

        // aún no implementado
        archaeologicalSiteId,
        // dejamos null los que no uses hoy:
        inplClassifierId: null,
      };

      // 1) crear artefacto
      const created = await createArtefact.mutateAsync(payload);

      // 2) subir foto (opcional)
      if (Platform.OS === "web" && pictureFileRef.current) {
        await uploadPicture.mutateAsync({ id: created.id!, file: pictureFileRef.current });
      } else if (Platform.OS !== "web" && nativePictureRef.current) {
        // @ts-ignore RN FormData shape
        const fd = new FormData();
        fd.append("picture", nativePictureRef.current as any);
        await ArtefactRepository.uploadPicture(created.id!, (fd as any).get("picture") as any);
      }

      // 3) subir ficha / documento (opcional)
      if (Platform.OS === "web" && recordFileRef.current) {
        await uploadRecord.mutateAsync({ id: created.id!, file: recordFileRef.current });
      } else if (Platform.OS !== "web" && nativeRecordRef.current) {
        // @ts-ignore RN FormData shape
        const fd = new FormData();
        fd.append("document", nativeRecordRef.current as any);
        await ArtefactRepository.uploadHistoricalRecord(created.id!, (fd as any).get("document") as any);
      }

      Alert.alert("OK", "Pieza creada correctamente.");
      router.back();
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
      style={{ backgroundColor: subdued ? "#f3f3f3" : "#fff", borderRadius: 6, padding: 8, borderWidth: 1, borderColor: "#E6DAC4" }}
    >
      <Text style={{ fontFamily: "CrimsonText-Regular", color: Colors.black }}>{value || label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Nueva pieza arqueologica" showBackArrow backToHome />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8, fontFamily: "MateSC-Regular", color: Colors.black }}>
          Ingrese los datos de la nueva pieza arqueológica
        </Text>

        {/* nombre / material */}
        <View style={{ flexDirection: windowWidth < 520 ? "column" : "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              style={{ backgroundColor: "#fff", borderRadius: 6, padding: 8, fontFamily: "CrimsonText-Regular", color: Colors.black }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Material</Text>
            <TextInput
              value={material}
              onChangeText={setMaterial}
              placeholder="Material"
              style={{ backgroundColor: "#fff", borderRadius: 6, padding: 8, fontFamily: "CrimsonText-Regular", color: Colors.black }}
            />
          </View>
        </View>

        {/* observación */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Observación</Text>
          <TextInput
            multiline
            value={observation}
            onChangeText={setObservation}
            placeholder="Observación de la pieza"
            style={{ backgroundColor: "#fff", borderRadius: 6, padding: 8, minHeight: 80, fontFamily: "CrimsonText-Regular", color: Colors.black }}
          />
        </View>

        {/* disponible */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Text style={{ fontWeight: "700", fontFamily: "MateSC-Regular", color: Colors.black }}>Disponible</Text>
          <Switch value={available} onValueChange={setAvailable} />
        </View>

        {/* clasificador interno (select simple) */}
        <View style={{ flexDirection: windowWidth < 520 ? "column" : "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>
              Clasificador interno
            </Text>
            <SimpleSelectRow
              label="Seleccionar clasificador"
              value={
                internalClassifierId
                  ? (() => {
                      const ic = internalClassifiers.find((x) => x.id === internalClassifierId);
                      return ic ? `#${ic.number} (${ic.color})` : "Seleccionar clasificador";
                    })()
                  : "Seleccionar clasificador"
              }
              onPress={() => {
                // selector mínimo: alternar entre el primero o limpiar (podés reemplazar por un modal propio)
                if (!internalClassifierId && internalClassifiers.length > 0) {
                  setInternalClassifierId(internalClassifiers[0].id ?? null);
                } else {
                  setInternalClassifierId(null);
                }
              }}
            />
          </View>

          {/* descripción */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Descripción</Text>
            <TextInput
              multiline
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción detallada de la pieza"
              style={{ backgroundColor: "#fff", borderRadius: 6, padding: 8, minHeight: 56, fontFamily: "CrimsonText-Regular", color: Colors.black }}
            />
          </View>
        </View>

        {/* Imagen + Ficha */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Archivos</Text>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
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
              {photoUri ? <Image source={{ uri: photoUri }} style={{ width: 92, height: 92, borderRadius: 6 }} /> : null}
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.green, borderRadius: 6 }}>
              <Text style={{ color: "#fff", fontFamily: "CrimsonText-Regular" }}>SUBIR IMAGEN</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickFile} style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.brown, borderRadius: 6 }}>
              <Text style={{ color: "#fff", fontFamily: "CrimsonText-Regular" }}>SUBIR FICHA</Text>
            </TouchableOpacity>

            {Platform.OS === "web" ? (
              <>
                <input id="file-image" type="file" accept="image/*" style={{ display: "none" }} onChange={onWebImageChange} />
                <input id="file-doc" type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={onWebDocChange} />
              </>
            ) : null}
          </View>
          {docName ? (
            <Text style={{ marginTop: 8, fontFamily: "CrimsonText-Regular", color: Colors.black }}>Archivo: {docName}</Text>
          ) : null}
        </View>

        {/* Colección */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Colección</Text>
          <SimpleSelectRow
            label="Sin colección"
            value={
              collectionId
                ? collections.find((c) => c.id === collectionId)?.name ?? "Sin colección"
                : "Sin colección"
            }
            onPress={() => {
              // selector mínimo: alternar primero / limpiar
              if (!collectionId && collections.length > 0) setCollectionId(collections[0].id ?? null);
              else setCollectionId(null);
            }}
          />
        </View>

        {/* Arqueólogo */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Arqueólogo</Text>
          <SimpleSelectRow
            label="Seleccionar arqueólogo"
            value={
              archaeologistId
                ? (() => {
                    const a = archaeologists.find((x) => x.id === archaeologistId);
                    return a ? `${a.firstname} ${a.lastname}` : "Seleccionar arqueólogo";
                  })()
                : "Seleccionar arqueólogo"
            }
            onPress={() => {
              if (!archaeologistId && archaeologists.length > 0) setArchaeologistId(archaeologists[0].id ?? null);
              else setArchaeologistId(null);
            }}
          />
        </View>

        {/* Sitio (placeholder) + Estantería */}
        <View style={{ flexDirection: windowWidth < 520 ? "column" : "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, opacity: 0.6 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>
              Sitio arqueológico
            </Text>
            <SimpleSelectRow label="Próximamente" subdued />
          </View>

          <View style={{ width: windowWidth < 520 ? "100%" : 140 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, fontFamily: "MateSC-Regular", color: Colors.black }}>Estantería</Text>
            <TextInput
              value={shelfCode}
              onChangeText={setShelfCode}
              placeholder="Código (p.ej. 07)"
              keyboardType="number-pad"
              style={{ backgroundColor: "#fff", borderRadius: 6, padding: 8, fontFamily: "CrimsonText-Regular", color: Colors.black }}
            />
          </View>
        </View>

        {/* Ubicación física (grid) */}
        <View style={{ marginBottom: 8, backgroundColor: "#fff", padding: 8, borderRadius: 6 }}>
          <Text style={{ fontFamily: "MateSC-Regular", fontWeight: "700", textAlign: "center", marginBottom: 8, color: Colors.black }}>
            UBICACIÓN FÍSICA DE LA PIEZA
          </Text>

          <View style={{ marginBottom: 8, alignItems: "center" }}>
            <View style={{ width: containerWidth, alignItems: "flex-start" }}>
              <View style={{ backgroundColor: Colors.green, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                <Text style={{ color: Colors.cremit, fontFamily: "CrimsonText-Regular" }}>
                  ESTANTERIA {shelfCode || "--"}
                </Text>
              </View>
            </View>
          </View>

          {/* encabezado columnas */}
          <View style={{ width: containerWidth, marginBottom: 6, alignSelf: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
              <View style={{ width: leftLabelWidth }} />
              <View style={{ flexDirection: "row" }}>
                {columns.map((c, ci) => (
                  <View
                    key={c}
                    style={{ width: cellSize, paddingHorizontal: gap / 2, alignItems: "center", marginRight: ci < columns.length - 1 ? gap : 0 }}
                  >
                    <View style={{ backgroundColor: "#2F2F2F", paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ color: Colors.cremit, fontFamily: "CrimsonText-Regular", fontSize: 11 }}>
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
                style={{ width: containerWidth, alignSelf: "center", flexDirection: "row", alignItems: "center", marginBottom: 6 }}
              >
                <View style={{ width: leftLabelWidth, height: cellSize, justifyContent: "center" }}>
                  <View style={{ backgroundColor: Colors.brown, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, alignSelf: "flex-start" }}>
                    <Text style={{ color: Colors.cremit, fontFamily: "CrimsonText-Regular", fontSize: 12 }}>NIVEL {lvl}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row" }}>
                  {columns.map((c, ci) => {
                    const isSelected = selectedLevel === li && selectedColumn === ci;
                    return (
                      <View
                        key={c}
                        style={{ width: cellSize, paddingHorizontal: gap / 2, marginRight: ci < columns.length - 1 ? gap : 0 }}
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

          <Text style={{ marginTop: 8, fontFamily: "CrimsonText-Regular", color: Colors.black }}>
            Ubicación física ID seleccionado: {physicalLocationId ?? "—"}
          </Text>
        </View>

        {/* Menciones (placeholder local) */}
        <View style={{ marginTop: 16, backgroundColor: "#fff", padding: 12, borderRadius: 8 }}>
          <Text style={{ fontFamily: "MateSC-Regular", fontWeight: "700", marginBottom: 8, color: Colors.black }}>
            MENCIONES (local, opcional)
          </Text>
          <Text style={{ fontFamily: "CrimsonText-Regular", color: Colors.black, opacity: 0.7 }}>
            * Aún no estamos persistiendo menciones en el backend.
          </Text>
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
    </View>
  );
}
