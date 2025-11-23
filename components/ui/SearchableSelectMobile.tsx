import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Tipo para las opciones del select
export interface SelectOption {
  id: string;
  label: string;
}

interface SearchableSelectMobileProps {
  // Valor seleccionado actual
  value: string;
  // Callback cuando cambia la selección
  onChange: (value: string) => void;
  // Lista de opciones disponibles
  options: string[];
  // Placeholder del input
  placeholder: string;
  // Estilos del contenedor
  style?: any;
  // ID único para manejar múltiples selects abiertos
  selectId: string;
  // ID del select actualmente abierto
  openSelectId: string | null;
  // Callback para cambiar el select abierto
  onOpenChange: (id: string | null) => void;
}

export default function SearchableSelectMobile({
  value,
  onChange,
  options,
  placeholder,
  style,
  selectId,
  openSelectId,
  onOpenChange,
}: SearchableSelectMobileProps) {
  const isOpen = openSelectId === selectId;

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  // Referencia al input para manejar el foco
  const inputRef = useRef<TextInput>(null);
  // Referencia al contenedor
  const containerRef = useRef<View>(null);
  // Referencia para rastrear si se hizo clic en una opción (para evitar que onBlur interfiera)
  const selectingRef = useRef(false);

  // Convertir opciones de string a SelectOption
  const selectOptions: SelectOption[] = useMemo(
    () =>
      options.map((opt) => ({
        id: opt,
        label: opt,
      })),
    [options]
  );

  // Lógica de filtrado de opciones: coincidencia por comienzo de palabra
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return selectOptions;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return selectOptions.filter((opt) =>
      opt.label.toLowerCase().startsWith(searchLower)
    );
  }, [selectOptions, searchTerm]);

  // Resetear el término de búsqueda cuando se abre o cierra el dropdown
  useEffect(() => {
    if (isOpen) {
      // Al abrir, resetear inmediatamente para mostrar todas las opciones
      setSearchTerm("");
    } else {
      // Al cerrar, resetear después de un pequeño delay
      const timeout = setTimeout(() => {
        setSearchTerm("");
      }, 10);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handler para cerrar el dropdown en mobile
  const handleCloseMobile = () => {
    // Si hay texto escrito, usar el texto directamente como filtro
    const currentSearchTerm = searchTerm.trim();
    if (currentSearchTerm.length > 0) {
      onChange(currentSearchTerm);
    }
    
    // Cerrar el dropdown
    onOpenChange(null);
    setSearchTerm("");
    selectingRef.current = false;
  };

  // Handler para seleccionar una opción en mobile
  const handleSelectMobile = (optionId: string) => {
    selectingRef.current = true;
    onChange(optionId);
    onOpenChange(null);
    setSearchTerm("");
    // Resetear el flag después de un delay
    setTimeout(() => {
      selectingRef.current = false;
    }, 300);
  };

  // Handler para limpiar en mobile
  const handleClearMobile = () => {
    onChange("");
    onOpenChange(null);
    setSearchTerm("");
  };

  // Handler para abrir en mobile
  const handleOpenMobile = () => {
    // Resetear el término de búsqueda al abrir para mostrar todas las opciones
    setSearchTerm("");
    onOpenChange(selectId);
    // Enfocar el input después de un pequeño delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Estilos base compartidos - La tarjeta beige siempre es el contenedor base
  const baseContainerStyle = {
    backgroundColor: "#F7F5F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8DFD0",
    ...style,
  };

  return (
    <View
      ref={containerRef}
      style={{ 
        position: "relative", 
        zIndex: isOpen ? 9999 : 1,
        // En Android, necesitamos asegurar que el contenedor capture los gestos cuando está abierto
        ...(Platform.OS === "android" && isOpen && {
          // @ts-ignore - Android specific
          collapsable: false,
        }),
      }}
    >
      {/* Contenedor beige base - Siempre visible, se transforma cuando está abierto */}
      <View
        style={[
          baseContainerStyle,
          {
            flexDirection: "column",
            overflow: isOpen ? "visible" : "hidden",
          },
        ]}
      >
        {/* Estado CERRADO: Botón con texto y chevron */}
        {!isOpen && (
          <TouchableOpacity
            onPress={handleOpenMobile}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: value ? "#2c2c2c" : "#999",
                flex: 1,
              }}
            >
              {value || placeholder}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color="#6B705C"
            />
          </TouchableOpacity>
        )}

        {/* Estado ABIERTO: Input de búsqueda dentro de la misma tarjeta beige */}
        {isOpen && (
          <>
            <View
              style={{
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TextInput
                ref={inputRef}
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                }}
                placeholder={`Buscar ${placeholder.toLowerCase()}...`}
                style={{
                  flex: 1,
                  fontSize: 14,
                  padding: 8,
                  backgroundColor: "white",
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#E8DFD0",
                }}
                returnKeyType="done"
                onSubmitEditing={() => {
                  // Cuando presiona "Done" en el teclado
                  const currentSearchTerm = searchTerm.trim();
                  if (currentSearchTerm.length > 0) {
                    onChange(currentSearchTerm);
                  }
                  handleCloseMobile();
                }}
                onBlur={() => {
                  // Cuando pierde el foco, aplicar filtro si hay texto y no se está seleccionando
                  setTimeout(() => {
                    if (!selectingRef.current) {
                      const currentSearchTerm = searchTerm.trim();
                      if (currentSearchTerm.length > 0) {
                        onChange(currentSearchTerm);
                      }
                      handleCloseMobile();
                    }
                  }, 200);
                }}
              />
              <TouchableOpacity
                onPress={handleClearMobile}
                activeOpacity={0.7}
                style={{
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#6B705C"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Lista de opciones - Aparece debajo de la tarjeta beige cuando está abierto */}
      {isOpen && (
        <View
          style={{
            position: "relative",
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#E8DFD0",
            marginTop: 4,
            zIndex: 9999,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1, // Sombra más suave
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {/* Opción para limpiar filtro - Muestra el texto que se está escribiendo */}
          <TouchableOpacity
            onPress={handleClearMobile}
            activeOpacity={0.7}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#E8DFD0",
              backgroundColor: !value ? "#F0F0F0" : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, color: "#999" }}>
              {searchTerm.trim() || placeholder}
            </Text>
          </TouchableOpacity>

          {/* Opciones filtradas con ScrollView - Mejor para scroll anidado en Android */}
          {filteredOptions.length > 0 ? (
            <ScrollView
              style={{ maxHeight: 192 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              bounces={true}
              // En Android, estas props ayudan a que el scroll anidado funcione correctamente
              {...(Platform.OS === "android" && {
                // @ts-ignore - Android specific
                overScrollMode: "auto",
                // @ts-ignore - Android specific
                scrollEventThrottle: 16,
                // @ts-ignore - Android specific - Permite que el scroll funcione dentro del dropdown
                // mientras el FlatList padre también puede scrollear
                nestedScrollEnabled: true,
              })}
              // Prevenir que los gestos se propaguen al padre cuando estamos scrolleando el dropdown
              onScrollBeginDrag={(e) => {
                // Cuando comenzamos a scrollear el dropdown, prevenimos la propagación
                e.stopPropagation?.();
              }}
            >
              {filteredOptions.map((opt, idx) => {
                const isSelected = value === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => handleSelectMobile(opt.id)}
                    activeOpacity={0.7}
                    style={{
                      padding: 12,
                      borderBottomWidth:
                        idx < filteredOptions.length - 1 ? 1 : 0,
                      borderBottomColor: "#E8DFD0",
                      backgroundColor: isSelected ? "#F0F0F0" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: isSelected ? "#6B705C" : "#2c2c2c",
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 14, color: "#999" }}>
                No se encontraron resultados
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

