// app/(tabs)/archaeological-Pieces/View_pieces.tsx
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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

import { useArtefacts } from "../../../hooks/useArtefact";
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
};

export default function ViewPieces() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useArtefacts();
  console.log("Artefacts data:", data);
  const [query, setQuery] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

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

      const shelfRaw = (a as any)?.physicalLocation?.shelf.code ?? undefined;

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
        id: Number(a.id!),
        name: a.name,
        material: a.material ?? undefined,
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
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (
        filterMaterial &&
        !(p.material || "").toLowerCase().includes(filterMaterial.toLowerCase())
      )
        return false;
      if (
        filterCollection &&
        !(p.collection || "")
          .toLowerCase()
          .includes(filterCollection.toLowerCase())
      )
        return false;
      if (
        filterSite &&
        !(p.site || "").toLowerCase().includes(filterSite.toLowerCase())
      )
        return false;
      if (
        filterCategory &&
        !(p.name || "").toLowerCase().includes(filterCategory.toLowerCase())
      )
        return false; // placeholder
      return true;
    });
  }, [
    pieces,
    query,
    filterMaterial,
    filterCollection,
    filterSite,
    filterCategory,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Piezas arqueologicas" showBackArrow backToHome />

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

            {/* Filtros */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
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
                placeholder="Filtrar por categoría"
                value={filterCategory}
                onChangeText={setFilterCategory}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: "#F7F5F2",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>

            <Text style={{ marginBottom: 8, color: "#222", fontWeight: "700" }}>
              {filtered.length} PIEZAS ENCONTRADAS
            </Text>

            <View style={{ display: "flex", gap: 12 }}>
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
                          value={p.material}
                        />
                        <InfoRow
                          icon="map-marker"
                          label="SITIO ARQUEOLOGICO"
                          value={p.site}
                        />
                        <InfoRow
                          icon="user"
                          label="ARQUEOLOGO"
                          value={p.archaeologist}
                        />
                        <InfoRow
                          icon="archive"
                          label="COLECCION"
                          value={p.collection}
                        />
                      </View>
                    </View>

                    <View style={{ marginLeft: 12, alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={(e) => {
                          // evitar que dispare el onPress del card
                          // @ts-ignore RN synthetic event
                          e.stopPropagation?.();
                          router.push(
                            `/(tabs)/archaeological-Pieces/Edit_piece?id=${p.id}`
                          );
                        }}
                        style={{ padding: 8 }}
                        accessibilityLabel={`Editar pieza ${p.name}`}
                      >
                        <FontAwesome
                          name="pencil"
                          size={18}
                          color={Colors.black}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
