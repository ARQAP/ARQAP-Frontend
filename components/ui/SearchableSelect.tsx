import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SearchableSelectMobile from "./SearchableSelectMobile";

// Tipo para las opciones del select
export interface SelectOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
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

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  style,
  selectId,
  openSelectId,
  onOpenChange,
}: SearchableSelectProps) {
  const isWeb = Platform.OS === "web";
  const isOpen = openSelectId === selectId;

  // Si es mobile, usar el componente mobile separado
  if (!isWeb) {
    return (
      <SearchableSelectMobile
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        style={style}
        selectId={selectId}
        openSelectId={openSelectId}
        onOpenChange={onOpenChange}
      />
    );
  }

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para la opción resaltada con el teclado
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // Referencia al input para manejar el foco
  const inputRef = useRef<TextInput>(null);
  // Referencia al contenedor para detectar clicks fuera
  const containerRef = useRef<View>(null);
  // Referencia al contenedor del dropdown para manejar scroll
  const dropdownRef = useRef<View>(null);

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

  // Resetear el término de búsqueda cuando se cierra el dropdown
  // Nota: Este efecto se ejecuta después de que handleClose ya procesó el searchTerm
  useEffect(() => {
    if (!isOpen) {
      // Pequeño delay para asegurar que handleClose ya procesó el searchTerm
      const timeout = setTimeout(() => {
        setSearchTerm("");
        setHighlightedIndex(-1);
      }, 10);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Manejar scroll de la rueda del mouse para que solo scrollee el dropdown, no la página
  useEffect(() => {
    if (!isOpen || !isWeb || !dropdownRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Verificar si el evento ocurrió dentro del dropdown
      if (dropdownRef.current && (dropdownRef.current as any).contains?.(target)) {
        e.stopPropagation();
        // Permitir que el scroll del dropdown funcione normalmente
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen, isWeb]);

  // Manejar clicks fuera del componente para cerrarlo
  useEffect(() => {
    if (!isOpen || !isWeb) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Verificar si el clic fue dentro del contenedor o del dropdown
      let clickedInside = false;
      
      if (containerRef.current) {
        // @ts-ignore - Acceso al DOM nativo en web
        const containerNode = (containerRef.current as any)._nativeNode || 
                             (containerRef.current as any).getNode?.() ||
                             containerRef.current;
        
        if (containerNode && typeof containerNode.contains === 'function') {
          if (containerNode.contains(target)) {
            clickedInside = true;
          }
        }
      }
      
      // También verificar el dropdown directamente
      if (dropdownRef.current && !clickedInside) {
        // @ts-ignore - Acceso al DOM nativo en web
        const dropdownNode = (dropdownRef.current as any)._nativeNode || 
                            (dropdownRef.current as any).getNode?.() ||
                            dropdownRef.current;
        
        if (dropdownNode && typeof dropdownNode.contains === 'function') {
          if (dropdownNode.contains(target)) {
            clickedInside = true;
          }
        }
      }
      
      // Si el clic fue fuera, cerrar el dropdown
      if (!clickedInside) {
        // Usar handleClose para que se aplique la selección automática si hay texto escrito
        handleClose();
      }
    };

    // Usar 'click' en lugar de 'mousedown' para dar tiempo a que los eventos de los botones se procesen primero
    // Usar capture: false para que los eventos dentro del dropdown se procesen antes
    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside, false);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, isWeb, onOpenChange]);

  // Cerrar el dropdown (definido antes de handleKeyDown para evitar problemas de orden)
  const handleClose = (shouldAutoSelect: boolean = true) => {
    // Capturar el valor de searchTerm ANTES de cerrar el dropdown
    // porque el useEffect que resetea searchTerm se ejecuta cuando isOpen cambia
    const currentSearchTerm = searchTerm.trim();
    
    // Si hay texto escrito, usar el texto directamente como valor del filtro (no seleccionar una opción específica)
    if (shouldAutoSelect && currentSearchTerm.length > 0) {
      // Pasar el texto escrito directamente al filtro para que filtre por "empieza con"
      onChange(currentSearchTerm);
    }
    
    // Cerrar el dropdown (esto disparará el useEffect que resetea searchTerm)
    onOpenChange(null);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  // Manejar teclado: ENTER, ESC, flechas (solo en web)
  const handleKeyDown = (e: any) => {
    if (!isOpen || !isWeb) return;

    if (e.key === "Escape") {
      handleClose();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      
      // Capturar el texto escrito antes de cualquier otra lógica
      const currentSearchTerm = searchTerm.trim();
      
      // Si hay texto escrito, usar el texto directamente como filtro (prioridad sobre opción resaltada)
      if (currentSearchTerm.length > 0) {
        // Pasar el texto escrito directamente al filtro para que filtre por "empieza con"
        onChange(currentSearchTerm);
        handleClose(false); // No auto-seleccionar porque ya seleccionamos manualmente
        return;
      }
      
      // Si no hay texto escrito pero hay una opción resaltada, seleccionarla
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const selectedOption = filteredOptions[highlightedIndex];
        if (selectedOption) {
          onChange(selectedOption.id);
          handleClose(false); // No auto-seleccionar porque ya seleccionamos manualmente
        }
        return;
      }
      
      // Si no hay texto escrito ni opción resaltada, solo cerrar el dropdown sin seleccionar
      handleClose(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      return;
    }
  };

  // Abrir el dropdown y enfocar el input
  const handleOpen = () => {
    onOpenChange(selectId);
    // Enfocar el input después de un pequeño delay para asegurar que esté renderizado
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Seleccionar una opción
  const handleSelect = (optionId: string) => {
    onChange(optionId);
    handleClose(false); // No auto-seleccionar porque ya seleccionamos manualmente
  };

  // Limpiar la selección
  const handleClear = () => {
    onChange("");
    handleClose();
  };

  // Estilos base compartidos (sin borde interno)
  const baseContainerStyle = {
    backgroundColor: isWeb ? "#FAFAF8" : "#F7F5F2",
    borderRadius: isWeb ? 10 : 8,
    borderWidth: 1,
    borderColor: "#E8DFD0",
    ...style,
  };

  // ==================== VISTA WEB ====================
  return (
      <View
        ref={containerRef}
        style={{ 
          position: "relative" as any, // Contenedor con posición relativa para que el dropdown se posicione relativo a él
          // Asegurar que el contenedor no bloquee eventos
          // @ts-ignore - Web-only style
          pointerEvents: "auto" as any,
          // @ts-ignore - Web-only style
          overflow: "visible" as any,
          // @ts-ignore - Web-only style
          zIndex: isOpen ? 10001 : "auto" as any,
        }}
      >
        {/* Input principal que muestra el valor seleccionado o permite buscar */}
        <View 
          style={baseContainerStyle}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 15,
              paddingVertical: 15,
            }}
          >
            {isOpen ? (
              <TextInput
                ref={inputRef}
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setHighlightedIndex(-1);
                }}
                // @ts-ignore - Web-only keyboard event
                onKeyDown={handleKeyDown}
                placeholder={`Buscar ${placeholder.toLowerCase()}...`}
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#2c2c2c",
                  padding: 0,
                  margin: 0,
                  borderWidth: 0,
                  outline: "none",
                  backgroundColor: "transparent",
                }}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                onPress={handleOpen}
                style={{ flex: 1 }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: value ? "#2c2c2c" : "#999",
                  }}
                >
                  {value || placeholder}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => (isOpen ? handleClose() : handleOpen())}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#6B705C"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown con opciones filtradas - Posicionado absolutamente pegado al input */}
        {isOpen && (
          <View
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: "100%", // Pegado directamente debajo del input
              left: 0,
              right: 0,
              width: "100%", // Mismo ancho que el input
              backgroundColor: "white", // Fondo sólido para tapar elementos debajo
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E8DFD0",
              marginTop: 4, // Pequeño espacio entre input y dropdown
              maxHeight: 180, // Altura para mostrar ~4 opciones visibles (cada opción ~40px)
              // Z-index muy alto para estar por encima de otros elementos, especialmente en modales
              // @ts-ignore - Web-only style
              zIndex: 10000 as any,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15, // Sombra suave
              shadowRadius: 8,
              elevation: 10, // Elevación alta para Android
              overflow: "hidden", // Asegurar que el contenido no se desborde
              // Asegurar que el dropdown capture todos los eventos de clic
              // @ts-ignore - Web-only style
              pointerEvents: "auto" as any,
            }}
            // Prevenir que los clicks pasen a través del dropdown
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            // Capturar todos los eventos de clic dentro del dropdown
            // @ts-ignore - Web-only mouse event
            onClick={(e: any) => {
              e.stopPropagation(); // Evitar que el clic se propague y cierre el dropdown
            }}
            // @ts-ignore - Web-only mouse event
            onMouseDown={(e: any) => {
              e.stopPropagation(); // Evitar que el clic se propague y cierre el dropdown
            }}
            // Manejar scroll de la rueda del mouse para que solo scrollee el dropdown
            // @ts-ignore - Web-only wheel event
            onWheel={(e: any) => {
              if (isOpen) {
                e.stopPropagation();
              }
            }}
          >
            <ScrollView
              style={{ 
                maxHeight: 180,
                // Asegurar que el ScrollView capture todos los eventos
                // @ts-ignore - Web-only style
                pointerEvents: "auto" as any,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              // Capturar eventos de clic dentro del ScrollView
              // @ts-ignore - Web-only mouse event
              onClick={(e: any) => {
                e.stopPropagation();
              }}
              // @ts-ignore - Web-only mouse event
              onMouseDown={(e: any) => {
                e.stopPropagation();
              }}
              // Manejar scroll de la rueda del mouse
              // @ts-ignore - Web-only wheel event
              onWheel={(e: any) => {
                e.stopPropagation();
              }}
            >
              {/* Opción para limpiar - Muestra el texto que se está escribiendo */}
              <TouchableOpacity
                onPress={handleClear}
                onPressIn={() => {
                  // Capturar el evento temprano para evitar que se propague
                }}
                activeOpacity={0.7}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E8DFD0",
                  backgroundColor: !value ? "#F0F0F0" : "transparent",
                  // Asegurar que el TouchableOpacity capture los eventos
                  // @ts-ignore - Web-only style
                  pointerEvents: "auto" as any,
                }}
                // @ts-ignore - Web-only mouse event
                onClick={(e: any) => {
                  e.stopPropagation();
                }}
                // @ts-ignore - Web-only mouse event
                onMouseDown={(e: any) => {
                  e.stopPropagation();
                }}
              >
                <Text style={{ fontSize: 14, color: "#999" }}>
                  {searchTerm.trim() || placeholder}
                </Text>
              </TouchableOpacity>

              {/* Lista de opciones filtradas */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = value === opt.id;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => handleSelect(opt.id)}
                      onPressIn={() => {
                        // Capturar el evento temprano para evitar que se propague
                      }}
                      activeOpacity={0.7}
                      style={{
                        padding: 12,
                        borderBottomWidth:
                          idx < filteredOptions.length - 1 ? 1 : 0,
                        borderBottomColor: "#E8DFD0",
                        backgroundColor:
                          isSelected || isHighlighted
                            ? "#F0F0F0"
                            : "transparent",
                        // Asegurar que cada opción capture los eventos
                        // @ts-ignore - Web-only style
                        pointerEvents: "auto" as any,
                      }}
                      // @ts-ignore - Web-only mouse event
                      onClick={(e: any) => {
                        e.stopPropagation();
                      }}
                      // @ts-ignore - Web-only mouse event
                      onMouseDown={(e: any) => {
                        e.stopPropagation();
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
                })
              ) : (
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 14, color: "#999" }}>
                    No se encontraron resultados
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }


