import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";
import Button from "./Button";
import SearchableSelect from "./SearchableSelect";

// Tipos para los filtros
export interface FilterValues {
  name: string;
  material: string;
  collection: string;
  site: string;
  shelf: string;
  shelfLevel: string;
  shelfColumn: string;
  internalClassifierName: string;
  internalClassifierNumber: string;
}

interface FiltersBarProps {
  // Valores actuales de los filtros
  filters: FilterValues;
  // Callbacks para actualizar filtros
  onFilterChange: (filters: FilterValues) => void;
  // Datos para extraer opciones únicas
  pieces: Array<{
    material?: string;
    collection?: string;
    site?: string;
    internalClassifierName?: string;
  }>;
  // Opciones para clasificador interno (si se proporcionan desde fuera)
  internalClassifierNames?: string[];
  // Callback para aplicar filtros (opcional, para modo manual)
  onApply?: () => void;
  // Callback para limpiar filtros
  onClear: () => void;
  // Callback opcional para notificar cuando un dropdown está abierto
  onDropdownOpenChange?: (isOpen: boolean) => void;
  // Si es true, los filtros avanzados estarán expandidos por defecto (útil para modales)
  defaultExpanded?: boolean;
}


export default function FiltersBar({
  filters,
  onFilterChange,
  pieces,
  onApply,
  onClear,
  onDropdownOpenChange,
  internalClassifierNames = [],
  defaultExpanded = false,
}: FiltersBarProps) {
  const isWeb = Platform.OS === "web";
  const isMobile = Platform.OS === "android" || Platform.OS === "ios";
  const [isMobileExpanded, setIsMobileExpanded] = useState(defaultExpanded);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(defaultExpanded);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  // Notificar cuando el estado del dropdown cambia
  useEffect(() => {
    onDropdownOpenChange?.(openSelectId !== null);
  }, [openSelectId, onDropdownOpenChange]);

  // Extraer valores únicos para los selects
  const uniqueMaterials = useMemo(() => {
    const materials = new Set<string>();
    pieces.forEach((p) => {
      if (p.material && p.material.trim()) {
        materials.add(p.material.trim());
      }
    });
    return Array.from(materials).sort();
  }, [pieces]);

  const uniqueCollections = useMemo(() => {
    const collections = new Set<string>();
    pieces.forEach((p) => {
      if (p.collection && p.collection.trim()) {
        collections.add(p.collection.trim());
      }
    });
    return Array.from(collections).sort();
  }, [pieces]);

  const uniqueSites = useMemo(() => {
    const sites = new Set<string>();
    pieces.forEach((p) => {
      if (p.site && p.site.trim()) {
        sites.add(p.site.trim());
      }
    });
    return Array.from(sites).sort();
  }, [pieces]);

  // Extraer valores únicos para clasificador interno (si no se proporcionan)
  const uniqueInternalClassifierNames = useMemo(() => {
    if (internalClassifierNames && internalClassifierNames.length > 0) {
      return internalClassifierNames;
    }
    const names = new Set<string>();
    pieces.forEach((p) => {
      if (p.internalClassifierName && p.internalClassifierName.trim()) {
        names.add(p.internalClassifierName.trim());
      }
    });
    return Array.from(names).sort();
  }, [pieces, internalClassifierNames]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.name.trim()) count++;
    if (filters.material.trim()) count++;
    if (filters.collection.trim()) count++;
    if (filters.site.trim()) count++;
    if (filters.shelf.trim()) count++;
    if (filters.shelfLevel.trim()) count++;
    if (filters.shelfColumn.trim()) count++;
    if (filters.internalClassifierName.trim()) count++;
    if (filters.internalClassifierNumber.trim()) count++;
    return count;
  }, [filters]);

  // Handlers para actualizar filtros individuales
  const updateFilter = (key: keyof FilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  // Estilos compartidos para inputs de texto (sin borde interno visible)
  const inputStyle = {
    backgroundColor: isWeb ? "#FAFAF8" : "#F7F5F2",
    borderRadius: isWeb ? 10 : 8,
    padding: isWeb ? 15 : 12,
    fontSize: isWeb ? 15 : 14,
    borderWidth: 1,
    borderColor: "#E8DFD0",
    fontWeight: "500" as const,
  };

  // Estilos para los selects buscables (sin borde interno, solo el contenedor)
  const selectStyle = {
    width: "100%",
  };

  // Contenedor principal de filtros
  const filtersContent = (
    <View
      style={{
        display: isWeb ? ("grid" as any) : "flex",
        gridTemplateColumns: isWeb ? "repeat(3, 1fr)" : undefined,
        gap: isWeb ? 16 : 12,
        flexDirection: isMobile ? "column" : undefined,
      }}
    >
      {/* Filtrar por nombre */}
      <TextInput
        placeholder="Filtrar por nombre"
        value={filters.name}
        onChangeText={(text) => updateFilter("name", text)}
        style={inputStyle}
      />

      {/* Dropdown buscable para material */}
      <SearchableSelect
        value={filters.material}
        onChange={(value) => updateFilter("material", value)}
        options={uniqueMaterials}
        placeholder="Filtrar por material"
        style={selectStyle}
        selectId="material"
        openSelectId={openSelectId}
        onOpenChange={setOpenSelectId}
      />

      {/* Dropdown buscable para colección */}
      <SearchableSelect
        value={filters.collection}
        onChange={(value) => updateFilter("collection", value)}
        options={uniqueCollections}
        placeholder="Filtrar por colección"
        style={selectStyle}
        selectId="collection"
        openSelectId={openSelectId}
        onOpenChange={setOpenSelectId}
      />

      {/* Dropdown buscable para sitio arqueológico */}
      <SearchableSelect
        value={filters.site}
        onChange={(value) => updateFilter("site", value)}
        options={uniqueSites}
        placeholder="Filtrar por sitio arqueológico"
        style={selectStyle}
        selectId="site"
        openSelectId={openSelectId}
        onOpenChange={setOpenSelectId}
      />

      {/* Filtrar por estante (código o etiqueta: ej. "1", "A1", "MT-1") */}
      <TextInput
        placeholder="Filtrar por estante (ej: 1, A1, MT-1)"
        value={filters.shelf}
        onChangeText={(text) => updateFilter("shelf", text)}
        style={inputStyle}
      />

      {/* Filtros condicionales de ubicación - aparecen al lado del estante cuando tiene valor */}
      {filters.shelf !== "" && (
        <>
          <TextInput
            placeholder="Filtrar por nivel (1-4)"
            value={filters.shelfLevel}
            onChangeText={(text) =>
              updateFilter("shelfLevel", text.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
            style={inputStyle}
          />
          <TextInput
            placeholder="Filtrar por columna (A-D)"
            value={filters.shelfColumn}
            onChangeText={(text) =>
              updateFilter(
                "shelfColumn",
                text.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 1)
              )
            }
            autoCapitalize="characters"
            style={inputStyle}
          />
        </>
      )}

      {/* Dropdown buscable para clasificador interno (nombre) - se desplaza cuando hay filtro de estante */}
      {filters.shelf === "" && (
        <SearchableSelect
          value={filters.internalClassifierName}
          onChange={(value) => updateFilter("internalClassifierName", value)}
          options={uniqueInternalClassifierNames}
          placeholder="Filtrar por clasificador interno (nombre)"
          style={selectStyle}
          selectId="internalClassifierName"
          openSelectId={openSelectId}
          onOpenChange={setOpenSelectId}
        />
      )}

      {/* Filtrar por clasificador interno (número) - se desplaza cuando hay filtro de estante */}
      {filters.shelf === "" && (
        <TextInput
          placeholder="Filtrar por clasificador interno (número)"
          value={filters.internalClassifierNumber}
          onChangeText={(text) => updateFilter("internalClassifierNumber", text.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          style={inputStyle}
        />
      )}

      {/* Clasificadores internos cuando hay filtro de estante - aparecen en la siguiente fila */}
      {filters.shelf !== "" && (
        <>
          <SearchableSelect
            value={filters.internalClassifierName}
            onChange={(value) => updateFilter("internalClassifierName", value)}
            options={uniqueInternalClassifierNames}
            placeholder="Filtrar por clasificador interno (nombre)"
            style={selectStyle}
            selectId="internalClassifierName"
            openSelectId={openSelectId}
            onOpenChange={setOpenSelectId}
          />
          <TextInput
            placeholder="Filtrar por clasificador interno (número)"
            value={filters.internalClassifierNumber}
            onChangeText={(text) => updateFilter("internalClassifierNumber", text.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            style={inputStyle}
          />
        </>
      )}
    </View>
  );

  // Botones de aplicar y limpiar
  const actionButtons = (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginTop: isWeb ? 20 : 16,
        justifyContent: "flex-start",
        // Ocultar botones cuando hay un dropdown abierto para evitar superposición visual
        opacity: openSelectId ? 0 : 1,
        pointerEvents: openSelectId ? "none" : "auto",
      }}
    >
      {onApply && (
        <TouchableOpacity
          onPress={onApply}
          style={{
            flex: isMobile ? 1 : undefined,
            backgroundColor: Colors.green,
            borderRadius: isWeb ? 10 : 8,
            paddingVertical: isWeb ? 12 : 10,
            paddingHorizontal: isWeb ? 24 : 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: isWeb ? 15 : 14,
              fontWeight: "600",
            }}
          >
            Aplicar filtros
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onClear}
        style={{
          flex: isMobile ? 1 : undefined,
          backgroundColor: "transparent",
          borderRadius: isWeb ? 10 : 8,
          paddingVertical: isWeb ? 12 : 10,
          paddingHorizontal: isWeb ? 24 : 16,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: Colors.brown,
        }}
      >
        <Text
          style={{
            color: Colors.brown,
            fontSize: isWeb ? 15 : 14,
            fontWeight: "600",
          }}
        >
          Limpiar filtros
        </Text>
      </TouchableOpacity>
    </View>
  );


  // Obtener filtros activos para mostrar en chips
  const activeFilters = useMemo(() => {
    const active: Array<{ key: keyof FilterValues; label: string; value: string }> = [];
    if (filters.material.trim()) {
      active.push({ key: "material", label: "Material", value: filters.material });
    }
    if (filters.collection.trim()) {
      active.push({ key: "collection", label: "Colección", value: filters.collection });
    }
    if (filters.site.trim()) {
      active.push({ key: "site", label: "Sitio arqueológico", value: filters.site });
    }
    if (filters.shelf.trim()) {
      active.push({ key: "shelf", label: "Estante", value: filters.shelf });
    }
    if (filters.shelfLevel.trim()) {
      active.push({ key: "shelfLevel", label: "Nivel", value: filters.shelfLevel });
    }
    if (filters.shelfColumn.trim()) {
      active.push({ key: "shelfColumn", label: "Columna", value: filters.shelfColumn });
    }
    if (filters.internalClassifierName.trim()) {
      active.push({ key: "internalClassifierName", label: "Clasificador interno (nombre)", value: filters.internalClassifierName });
    }
    if (filters.internalClassifierNumber.trim()) {
      active.push({ key: "internalClassifierNumber", label: "Clasificador interno (número)", value: filters.internalClassifierNumber });
    }
    return active;
  }, [filters]);

  // Handler para limpiar un filtro individual
  const handleClearSingleFilter = (key: keyof FilterValues) => {
    updateFilter(key, "");
  };

  // Vista Desktop
  if (isWeb) {
    return (
      <View
        style={{
          marginBottom: 32,
          position: "relative" as any, // Asegurar contexto de posicionamiento para dropdowns absolutos
          // @ts-ignore - Web-only style
          overflow: "visible" as any, // Permitir que el dropdown se salga del contenedor
          // Z-index alto para que el contenedor (y sus hijos como el dropdown) estén por encima
          // del div de "PIEZAS ENCONTRADAS" que tiene z-index: 1
          // @ts-ignore - Web-only style
          zIndex: 1000,
        }}
      >
        {/* Barra principal de filtros */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            // Responsive: en pantallas chicas, pasar a 2 filas
            // @ts-ignore - Web-only style
            flexWrap: "wrap" as any,
          }}
        >
          {/* Input de búsqueda por nombre */}
          <TextInput
            placeholder="Buscar por nombre"
            value={filters.name}
            onChangeText={(text) => updateFilter("name", text)}
            style={{
              flex: 1,
              minWidth: 200,
              backgroundColor: "#FAFAF8",
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
              borderWidth: 1,
              borderColor: "#E8DFD0",
              fontWeight: "500",
            }}
          />

          {/* Botón "Más filtros" */}
          <TouchableOpacity
            onPress={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: isAdvancedFiltersOpen ? "#F0F0F0" : "transparent",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: "#E8DFD0",
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter"
              size={18}
              color="#6B705C"
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#6B705C",
              }}
            >
              Más filtros
            </Text>
            <Ionicons
              name={isAdvancedFiltersOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color="#6B705C"
            />
          </TouchableOpacity>

          {/* Botón "Limpiar filtros" */}
          <TouchableOpacity
            onPress={onClear}
            style={{
              backgroundColor: "transparent",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: Colors.brown,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: Colors.brown,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chips de filtros activos */}
        {activeFilters.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            {activeFilters.map((filter) => (
              <View
                key={filter.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F0F0F0",
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingLeft: 12,
                  paddingRight: 6,
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B705C",
                  }}
                >
                  {filter.label}: {filter.value}
                </Text>
                <TouchableOpacity
                  onPress={() => handleClearSingleFilter(filter.key)}
                  style={{
                    padding: 4,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#6B705C"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Panel de filtros avanzados (plegable) */}
        {isAdvancedFiltersOpen && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E8DFD0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 1,
              position: "relative" as any,
              // @ts-ignore - Web-only style
              zIndex: 1001,
              // @ts-ignore - Web-only style
              overflow: "visible" as any,
            }}
          >
            <View
              style={{
                display: "grid" as any,
                gridTemplateColumns: "repeat(3, 1fr)" as any,
                gap: 16,
              }}
            >
              {/* Dropdown buscable para material */}
              <SearchableSelect
                value={filters.material}
                onChange={(value) => updateFilter("material", value)}
                options={uniqueMaterials}
                placeholder="Filtrar por material"
                style={selectStyle}
                selectId="material"
                openSelectId={openSelectId}
                onOpenChange={setOpenSelectId}
              />

              {/* Dropdown buscable para colección */}
              <SearchableSelect
                value={filters.collection}
                onChange={(value) => updateFilter("collection", value)}
                options={uniqueCollections}
                placeholder="Filtrar por colección"
                style={selectStyle}
                selectId="collection"
                openSelectId={openSelectId}
                onOpenChange={setOpenSelectId}
              />

              {/* Dropdown buscable para sitio arqueológico */}
              <SearchableSelect
                value={filters.site}
                onChange={(value) => updateFilter("site", value)}
                options={uniqueSites}
                placeholder="Filtrar por sitio arqueológico"
                style={selectStyle}
                selectId="site"
                openSelectId={openSelectId}
                onOpenChange={setOpenSelectId}
              />

              {/* Filtrar por estante (código o etiqueta: ej. "1", "A1", "MT-1") */}
              <TextInput
                placeholder="Filtrar por estante (ej: 1, A1, MT-1)"
                value={filters.shelf}
                onChangeText={(text) => updateFilter("shelf", text)}
                style={inputStyle}
              />

              {/* Filtros condicionales de ubicación - aparecen al lado del estante cuando tiene valor */}
              {filters.shelf !== "" && (
                <>
                  <TextInput
                    placeholder="Filtrar por nivel (1-4)"
                    value={filters.shelfLevel}
                    onChangeText={(text) =>
                      updateFilter("shelfLevel", text.replace(/[^0-9]/g, ""))
                    }
                    keyboardType="numeric"
                    style={inputStyle}
                  />
                  <TextInput
                    placeholder="Filtrar por columna (A-D)"
                    value={filters.shelfColumn}
                    onChangeText={(text) =>
                      updateFilter(
                        "shelfColumn",
                        text.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 1)
                      )
                    }
                    autoCapitalize="characters"
                    style={inputStyle}
                  />
                </>
              )}

              {/* Dropdown buscable para clasificador interno (nombre) - se desplaza cuando hay filtro de estante */}
              {filters.shelf === "" && (
                <SearchableSelect
                  value={filters.internalClassifierName}
                  onChange={(value) => updateFilter("internalClassifierName", value)}
                  options={uniqueInternalClassifierNames}
                  placeholder="Filtrar por clasificador interno (nombre)"
                  style={selectStyle}
                  selectId="internalClassifierName"
                  openSelectId={openSelectId}
                  onOpenChange={setOpenSelectId}
                />
              )}

              {/* Filtrar por clasificador interno (número) - se desplaza cuando hay filtro de estante */}
              {filters.shelf === "" && (
                <TextInput
                  placeholder="Filtrar por clasificador interno (número)"
                  value={filters.internalClassifierNumber}
                  onChangeText={(text) => updateFilter("internalClassifierNumber", text.replace(/[^0-9]/g, ""))}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              )}

              {/* Clasificadores internos cuando hay filtro de estante - aparecen en la siguiente fila */}
              {filters.shelf !== "" && (
                <>
                  <SearchableSelect
                    value={filters.internalClassifierName}
                    onChange={(value) => updateFilter("internalClassifierName", value)}
                    options={uniqueInternalClassifierNames}
                    placeholder="Filtrar por clasificador interno (nombre)"
                    style={selectStyle}
                    selectId="internalClassifierName"
                    openSelectId={openSelectId}
                    onOpenChange={setOpenSelectId}
                  />
                  <TextInput
                    placeholder="Filtrar por clasificador interno (número)"
                    value={filters.internalClassifierNumber}
                    onChangeText={(text) => updateFilter("internalClassifierNumber", text.replace(/[^0-9]/g, ""))}
                    keyboardType="numeric"
                    style={inputStyle}
                  />
                </>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }

  // Vista Mobile
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: "hidden",
      }}
    >
      {/* Botón toggle para mostrar/ocultar filtros */}
      <TouchableOpacity
        onPress={() => setIsMobileExpanded(!isMobileExpanded)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "#FFFFFF",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons
            name="filter"
            size={20}
            color="#6B705C"
            style={{ marginRight: 10 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#6B705C",
            }}
          >
            {isMobileExpanded ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
          {activeFiltersCount > 0 && (
            <View
              style={{
                backgroundColor: Colors.green,
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8,
                minWidth: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isMobileExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B705C"
        />
      </TouchableOpacity>

      {/* Contenido de filtros (colapsable) */}
      {isMobileExpanded && (
        <View style={{ padding: 16, paddingTop: 0 }}>
          {filtersContent}
          {actionButtons}
        </View>
      )}
    </View>
  );
}