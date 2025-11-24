import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import type { Artefact } from "@/repositories/artefactRepository";
import { useCollections } from "@/hooks/useCollections";
import { useInternalClassifierNames } from "@/hooks/useInternalClassifier";

interface MultiArtefactSelectorProps {
  visible: boolean;
  artefacts: Artefact[];
  selectedArtefactIds: number[];
  onSelect: (artefactIds: number[]) => void;
  onClose: () => void;
}

export default function MultiArtefactSelector({
  visible,
  artefacts,
  selectedArtefactIds,
  onSelect,
  onClose,
}: MultiArtefactSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollection, setFilterCollection] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  const [filterInternalClassifierName, setFilterInternalClassifierName] = useState<string>("");
  const [filterInternalClassifierNumber, setFilterInternalClassifierNumber] = useState<string>("");
  const [filterSite, setFilterSite] = useState<string>("");

  const { data: collections = [] } = useCollections();
  const { data: internalClassifierNames = [] } = useInternalClassifierNames();

  // Obtener valores únicos para filtros
  const uniqueMaterials = useMemo(() => {
    const materials = new Set<string>();
    artefacts.forEach((a) => {
      if (a.material) materials.add(a.material);
    });
    return Array.from(materials).sort();
  }, [artefacts]);

  const uniqueSites = useMemo(() => {
    const sites = new Set<string>();
    artefacts.forEach((a) => {
      const site = (a.archaeologicalSite as any)?.Name;
      if (site) sites.add(site);
    });
    return Array.from(sites).sort();
  }, [artefacts]);

  // Filtrar artefactos
  const filteredArtefacts = useMemo(() => {
    return artefacts.filter((artefact) => {
      // Búsqueda por nombre
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (!artefact.name.toLowerCase().includes(query)) return false;
      }

      // Filtro por colección
      if (filterCollection.trim() !== "") {
        const collectionName = (artefact.collection as any)?.name || "";
        if (!collectionName.toLowerCase().includes(filterCollection.toLowerCase())) return false;
      }

      // Filtro por material
      if (filterMaterial.trim() !== "") {
        if (!artefact.material.toLowerCase().includes(filterMaterial.toLowerCase())) return false;
      }

      // Filtro por clasificador interno (nombre)
      if (filterInternalClassifierName.trim() !== "") {
        const classifierName = (artefact.internalClassifier as any)?.name || "";
        if (!classifierName.toLowerCase().includes(filterInternalClassifierName.toLowerCase())) return false;
      }

      // Filtro por clasificador interno (número)
      if (filterInternalClassifierNumber.trim() !== "") {
        const classifierNumber = (artefact.internalClassifier as any)?.number;
        if (classifierNumber == null) return false;
        if (String(classifierNumber) !== filterInternalClassifierNumber.trim()) return false;
      }

      // Filtro por sitio arqueológico
      if (filterSite.trim() !== "") {
        const siteName = (artefact.archaeologicalSite as any)?.Name || "";
        if (!siteName.toLowerCase().includes(filterSite.toLowerCase())) return false;
      }

      return true;
    });
  }, [
    artefacts,
    searchQuery,
    filterCollection,
    filterMaterial,
    filterInternalClassifierName,
    filterInternalClassifierNumber,
    filterSite,
  ]);

  const toggleArtefactSelection = (artefactId: number) => {
    if (selectedArtefactIds.includes(artefactId)) {
      onSelect(selectedArtefactIds.filter((id) => id !== artefactId));
    } else {
      onSelect([...selectedArtefactIds, artefactId]);
    }
  };

  const selectAll = () => {
    onSelect(filteredArtefacts.map((a) => a.id!).filter((id): id is number => id != null));
  };

  const clearSelection = () => {
    onSelect([]);
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Piezas Arqueológicas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Filtros */}
          <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.filterLabel}>Búsqueda por nombre:</Text>
            <TextInput
              style={styles.filterInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#B8967D"
            />

            <Text style={styles.filterLabel}>Filtrar por colección:</Text>
            <TextInput
              style={styles.filterInput}
              value={filterCollection}
              onChangeText={setFilterCollection}
              placeholder="Filtrar por colección..."
              placeholderTextColor="#B8967D"
            />

            <Text style={styles.filterLabel}>Filtrar por material:</Text>
            <TextInput
              style={styles.filterInput}
              value={filterMaterial}
              onChangeText={setFilterMaterial}
              placeholder="Filtrar por material..."
              placeholderTextColor="#B8967D"
            />

            <Text style={styles.filterLabel}>Filtrar por clasificador interno (nombre):</Text>
            <TextInput
              style={styles.filterInput}
              value={filterInternalClassifierName}
              onChangeText={setFilterInternalClassifierName}
              placeholder="Ej: Verde, Rojo..."
              placeholderTextColor="#B8967D"
            />

            <Text style={styles.filterLabel}>Filtrar por clasificador interno (número):</Text>
            <TextInput
              style={styles.filterInput}
              value={filterInternalClassifierNumber}
              onChangeText={setFilterInternalClassifierNumber}
              placeholder="Ej: 1, 2, 3..."
              keyboardType="numeric"
              placeholderTextColor="#B8967D"
            />

            <Text style={styles.filterLabel}>Filtrar por sitio arqueológico:</Text>
            <TextInput
              style={styles.filterInput}
              value={filterSite}
              onChangeText={setFilterSite}
              placeholder="Filtrar por sitio..."
              placeholderTextColor="#B8967D"
            />
          </ScrollView>

          {/* Contador y acciones */}
          <View style={styles.actionsBar}>
            <Text style={styles.counter}>
              {selectedArtefactIds.length} de {filteredArtefacts.length} seleccionadas
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={selectAll} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Seleccionar todas</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearSelection} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de artefactos */}
          <FlatList
            data={filteredArtefacts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const isSelected = selectedArtefactIds.includes(item.id!);
              const classifier = item.internalClassifier as any;
              const classifierLabel = classifier
                ? `${classifier.name}${classifier.number ? ` #${classifier.number}` : ""}`
                : "Sin clasificador";

              return (
                <TouchableOpacity
                  style={[styles.artefactItem, isSelected && styles.artefactItemSelected]}
                  onPress={() => toggleArtefactSelection(item.id!)}
                >
                  <View style={styles.checkbox}>
                    {isSelected && <Ionicons name="checkmark" size={20} color={Colors.green} />}
                  </View>
                  <View style={styles.artefactInfo}>
                    <Text style={styles.artefactName}>{item.name}</Text>
                    <Text style={styles.artefactDetails}>
                      {item.material} • {(item.collection as any)?.name || "Sin colección"} • {classifierLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            style={styles.list}
          />

          {/* Botón confirmar */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                selectedArtefactIds.length === 0 && styles.confirmButtonDisabled,
              ]}
              disabled={selectedArtefactIds.length === 0}
            >
              <Text style={styles.confirmButtonText}>
                Confirmar ({selectedArtefactIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D4C1",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "MateSC-Regular",
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    maxHeight: 200,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D4C1",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.brown,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: "CrimsonText-Regular",
  },
  filterInput: {
    backgroundColor: "#F7F5F2",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5D4C1",
    fontSize: 14,
    fontFamily: "CrimsonText-Regular",
    color: Colors.black,
    marginBottom: 8,
  },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D4C1",
  },
  counter: {
    fontSize: 14,
    color: Colors.brown,
    fontFamily: "CrimsonText-Regular",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.lightbrown,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: "CrimsonText-Regular",
  },
  list: {
    flex: 1,
    maxHeight: 300,
  },
  artefactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D4C1",
  },
  artefactItemSelected: {
    backgroundColor: "#F0F8F0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.green,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  artefactInfo: {
    flex: 1,
  },
  artefactName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "CrimsonText-Regular",
    marginBottom: 4,
  },
  artefactDetails: {
    fontSize: 12,
    color: Colors.brown,
    fontFamily: "CrimsonText-Regular",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5D4C1",
  },
  confirmButton: {
    backgroundColor: Colors.green,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  confirmButtonText: {
    color: Colors.cremit,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "MateSC-Regular",
  },
});

