import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import type { Artefact } from "@/repositories/artefactRepository";
import FiltersBar, { FilterValues } from "./FiltersBar";
import SearchableSelect from "./SearchableSelect";
import { getShelfLabel, getShelfShortLabel } from "@/utils/shelfLabels";

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
  const [filters, setFilters] = useState<FilterValues>({
    name: "",
    material: "",
    collection: "",
    site: "",
    shelf: "",
    shelfLevel: "",
    shelfColumn: "",
    internalClassifierName: "",
    internalClassifierNumber: "",
  });
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  // Preparar datos para FiltersBar (incluyendo shelf y clasificador interno)
  const piecesForFilters = useMemo(() => {
    return artefacts.map((a) => {
      // Extraer shelf code de physicalLocation
      const phys = (a as any)?.physicalLocation ?? {};
      const shelfObj = phys?.shelf ?? phys?.estanteria ?? null;
      const shelfCode = typeof shelfObj === "object" && shelfObj
        ? (shelfObj?.code ?? shelfObj?.codigo)
        : null;
      
      // Extraer clasificador interno
      const classifier = a.internalClassifier as any;
      const classifierName = classifier?.name || "";
      
      return {
        material: a.material,
        collection: (a.collection as any)?.name || "",
        site: (a.archaeologicalSite as any)?.Name || (a.archaeologicalSite as any)?.name || "",
        shelf: shelfCode != null ? String(shelfCode) : "",
        internalClassifierName: classifierName,
      };
    });
  }, [artefacts]);

  // Obtener valores únicos para clasificador interno
  const uniqueInternalClassifierNames = useMemo(() => {
    const names = new Set<string>();
    artefacts.forEach((a) => {
      const classifier = a.internalClassifier as any;
      if (classifier?.name) names.add(classifier.name);
    });
    return Array.from(names).sort();
  }, [artefacts]);

  // Filtrar artefactos
  const filteredArtefacts = useMemo(() => {
    return artefacts.filter((artefact) => {
      // Filtros de FiltersBar
      if (filters.name.trim() !== "") {
        const query = filters.name.toLowerCase();
        if (!artefact.name.toLowerCase().includes(query)) return false;
      }

      if (filters.material.trim() !== "") {
        if (!artefact.material.toLowerCase().includes(filters.material.toLowerCase())) return false;
      }

      if (filters.collection.trim() !== "") {
        const collectionName = (artefact.collection as any)?.name || "";
        if (!collectionName.toLowerCase().includes(filters.collection.toLowerCase())) return false;
      }

      if (filters.site.trim() !== "") {
        const siteName = (artefact.archaeologicalSite as any)?.Name || (artefact.archaeologicalSite as any)?.name || "";
        if (!siteName.toLowerCase().includes(filters.site.toLowerCase())) return false;
      }

      // Filtro por estante
      if (filters.shelf.trim() !== "") {
        const phys = (artefact as any)?.physicalLocation ?? {};
        const shelfObj = phys?.shelf ?? phys?.estanteria ?? null;
        const shelfCode = typeof shelfObj === "object" && shelfObj
          ? (shelfObj?.code ?? shelfObj?.codigo)
          : null;

        if (shelfCode == null) return false;

        const shelfQuery = filters.shelf.trim().toUpperCase();
        const pieceLabel = getShelfLabel(shelfCode).toUpperCase();
        const pieceShortLabel = getShelfShortLabel(shelfCode).toUpperCase();
        const pieceCode = String(shelfCode);

        if (
          !pieceLabel.includes(shelfQuery) &&
          !pieceShortLabel.includes(shelfQuery) &&
          !pieceCode.includes(shelfQuery)
        ) {
          return false;
        }
      }

      // Filtros para clasificador interno
      if (filters.internalClassifierName.trim() !== "") {
        const classifierName = (artefact.internalClassifier as any)?.name || "";
        if (!classifierName.toLowerCase().includes(filters.internalClassifierName.toLowerCase())) return false;
      }

      if (filters.internalClassifierNumber.trim() !== "") {
        const classifierNumber = (artefact.internalClassifier as any)?.number;
        if (classifierNumber == null) return false;
        if (String(classifierNumber) !== filters.internalClassifierNumber.trim()) return false;
      }

      return true;
    });
  }, [
    artefacts,
    filters,
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

  const handleClearFilters = () => {
    setFilters({
      name: "",
      material: "",
      collection: "",
      site: "",
      shelf: "",
      shelfLevel: "",
      shelfColumn: "",
      internalClassifierName: "",
      internalClassifierNumber: "",
    });
  };

  const handleConfirm = () => {
    onClose();
  };

  const windowHeight = Dimensions.get("window").height;
  const modalHeight = Math.min(windowHeight * 0.9, 800);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: modalHeight }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Piezas Arqueológicas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Filtros */}
          <View style={styles.filtersSection}>
            <FiltersBar
              filters={filters}
              onFilterChange={setFilters}
              pieces={piecesForFilters}
              onClear={handleClearFilters}
              internalClassifierNames={uniqueInternalClassifierNames}
              defaultExpanded={true}
              onDropdownOpenChange={(isOpen) => {
                if (isOpen) {
                  setOpenSelectId("filters");
                } else {
                  setOpenSelectId(null);
                }
              }}
            />
          </View>

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
              
              // Extraer sitio arqueológico
              const siteName = (item.archaeologicalSite as any)?.Name || (item.archaeologicalSite as any)?.name || "Sin sitio";
              
              // Extraer shelf label
              const phys = (item as any)?.physicalLocation ?? {};
              const shelfObj = phys?.shelf ?? phys?.estanteria ?? null;
              const shelfCode = typeof shelfObj === "object" && shelfObj
                ? (shelfObj?.code ?? shelfObj?.codigo)
                : null;
              const shelfLabel = shelfCode != null ? getShelfLabel(shelfCode) : "Sin estante";

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
                      {item.material} • {(item.collection as any)?.name || "Sin colección"} • {classifierLabel} • {siteName} • {shelfLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            style={styles.list}
            contentContainerStyle={styles.listContent}
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
    justifyContent: "center",
    alignItems: "center",
    padding: Platform.OS === "web" ? 20 : 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: Platform.OS === "web" ? "90%" : "100%",
    maxWidth: 1200,
    flex: Platform.OS === "web" ? undefined : 1,
    display: "flex",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: "relative" as any,
    // @ts-ignore - Web-only style
    overflow: "visible" as any,
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
    fontSize: 22,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "MateSC-Regular",
  },
  closeButton: {
    padding: 4,
  },
  filtersSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D4C1",
    backgroundColor: "#FAFAF8",
    position: "relative" as any,
    zIndex: 1000,
    // @ts-ignore - Web-only style
    overflow: "visible" as any,
  },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D4C1",
    backgroundColor: "#FFFFFF",
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
  },
  listContent: {
    paddingBottom: 8,
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
    backgroundColor: "#FFFFFF",
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
