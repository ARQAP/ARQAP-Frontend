import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ViewStyle } from "react-native"
import { Animated, Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Colors from "../constants/Colors"
import DepositoSvg from "../Distribucion Deposito.svg"
import { useArtefactSummaries } from "../hooks/useArtefact"

type ShelfBox = { id: string; x: number; y: number; w: number; h: number; label?: string }

// Tomado de "Distribucion Deposito.svg": viewBox="0 0 607 678"
const VB_WIDTH = 607
const VB_HEIGHT = 678

const SHELVES: ShelfBox[] = [
  // Estantes izquierda (A y B)
  { id: "s_120_190", x: 120, y: 171, w: 41, h: 75, label: "Estante A4" },
  { id: "s_120_246", x: 120, y: 246, w: 41, h: 75, label: "Estante A3" },
  { id: "s_120_322", x: 120, y: 322, w: 41, h: 75, label: "Estante A2" },
  { id: "s_120_398", x: 120, y: 398, w: 41, h: 75, label: "Estante A1" },
  { id: "s_162_190", x: 162, y: 171, w: 41, h: 75, label: "Estante B4" },
  { id: "s_162_246", x: 162, y: 246, w: 41, h: 75, label: "Estante B3" },
  { id: "s_162_322", x: 162, y: 322, w: 41, h: 75, label: "Estante B2" },
  { id: "s_162_398", x: 162, y: 398, w: 41, h: 75, label: "Estante B1" },

  // Estantes centro (C y D)
  { id: "s_259_454", x: 259, y: 454, w: 41, h: 75, label: "Estante C1" },
  { id: "s_259_378", x: 259, y: 378, w: 41, h: 75, label: "Estante C2" },
  { id: "s_259_302", x: 259, y: 302, w: 41, h: 75, label: "Estante C3" },
  { id: "s_259_226", x: 259, y: 226, w: 41, h: 75, label: "Estante C4" },
  { id: "s_301_454", x: 301, y: 454, w: 41, h: 75, label: "Estante D1" },
  { id: "s_301_378", x: 301, y: 378, w: 41, h: 75, label: "Estante D2" },
  { id: "s_301_302", x: 301, y: 302, w: 41, h: 75, label: "Estante D3" },
  { id: "s_301_226", x: 301, y: 226, w: 41, h: 75, label: "Estante D4" },

  // Estantes derecha (E y F)
  { id: "s_399_467", x: 399, y: 467, w: 41, h: 75, label: "Estante E1" },
  { id: "s_399_391", x: 399, y: 391, w: 41, h: 75, label: "Estante E2" },
  { id: "s_399_315", x: 399, y: 315, w: 41, h: 75, label: "Estante E3" },
  { id: "s_399_240", x: 399, y: 225, w: 41, h: 89, label: "Estante E4" },
  { id: "s_441_467", x: 441, y: 467, w: 41, h: 75, label: "Estante F1" },
  { id: "s_441_391", x: 441, y: 391, w: 41, h: 75, label: "Estante F2" },
  { id: "s_441_315", x: 441, y: 315, w: 41, h: 75, label: "Estante F3" },
  { id: "s_441_240", x: 441, y: 225, w: 41, h: 89, label: "Estante F4" },

  // Estantes superiores (G)
  { id: "s_121_92", x: 121, y: 92.4897, w: 138, h: 49.1171, label: "Estante G1" },
  { id: "s_259_92", x: 259, y: 92.4897, w: 138, h: 49.1171, label: "Estante G2" },
  { id: "s_397_92", x: 397, y: 92.4897, w: 138, h: 49.1171, label: "Estante G3" },

  // Mesas
  { id: "s_203_172", x: 120, y: 172, w: 83, h: 73, label: "Mesa MT-1" },
  { id: "s_203_245", x: 259, y: 454, w: 83, h: 73, label: "Mesa MT-2" },
  { id: "s_399_226", x: 399, y: 226, w: 83, h: 88, label: "Mesa MT-3" },
]

const SHELF_ID_MAP: Record<string, number> = {
  s_120_398: 1,  
  s_120_322: 2,  
  s_120_246: 3,  
  s_120_190: 4,  
  s_162_398: 5,  
  s_162_322: 6,  
  s_162_246: 7,  
  s_162_190: 8, 
  s_259_454: 9,
  s_259_378: 10,
  s_259_302: 11,
  s_259_226: 12,
  s_301_454: 13,
  s_301_378: 14,
  s_301_302: 15,
  s_301_226: 16,
  s_399_467: 17,
  s_399_391: 18,
  s_399_315: 19,
  s_399_240: 20,
  s_441_467: 21,
  s_441_391: 22,
  s_441_315: 23,
  s_441_240: 24,
  s_121_92: 25,
  s_259_92: 26,
  s_397_92: 27,
  s_203_172: 28,
  s_203_245: 29,
  s_399_226: 30,
}

export default function DepositMap({ style }: { style?: ViewStyle }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [selected, setSelected] = useState<ShelfBox | null>(null)
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null)
  const [containerLayout, setContainerLayout] = useState({ width: 0, height: 0 })
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width)
  const [mtSelection, setMtSelection] = useState<{ mesa: ShelfBox; shelves: ShelfBox[] } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  // Tanstack Query para obtener artefactos del estante seleccionado
  const selectedShelfId = selected ? SHELF_ID_MAP[selected.id] : undefined
  const { data: items, isLoading: loading, refetch } = useArtefactSummaries(
    selectedShelfId ? { shelfId: selectedShelfId } : undefined
  )

  // Para pinch-to-zoom
  const savedScale = useRef(1)

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024
  const isLargeDesktop = windowWidth >= 1440

  const sidePanelWidth = isLargeDesktop ? 360 : isDesktop ? 380 : 420

  const onShelfPress = useCallback(
    (shelf: ShelfBox) => {
      if (shelf.label?.includes("Mesa MT-")) {
        const mtNumber = shelf.label.match(/MT-(\d+)/)?.[1]
        let associatedShelves: ShelfBox[] = []

        if (mtNumber === "1") {
          associatedShelves = SHELVES.filter((s) => s.label === "Estante A4" || s.label === "Estante B4")
        } else if (mtNumber === "2") {
          associatedShelves = SHELVES.filter((s) => s.label === "Estante C1" || s.label === "Estante D1")
        } else if (mtNumber === "3") {
          associatedShelves = SHELVES.filter((s) => s.label === "Estante E4" || s.label === "Estante F4")
        }

        setMtSelection({ mesa: shelf, shelves: associatedShelves })
      } else {
        setSelected(shelf)
        if (isMobile || isTablet) {
          setShowMobilePanel(true)
        }
      }
    },
    [isMobile, isTablet],
  )

  const details = useMemo(() => {
    if (!items || !Array.isArray(items)) return null
    // `items` vienen como ArtefactSummary: usan `collectionName` y `archaeologistName`.
    const count = items.length
    const collections = Array.from(
      new Set(items.map((i: any) => (i.collectionName || null)).filter(Boolean)),
    ).slice(0, 5)
    const archaeologists = Array.from(
      new Set(items.map((i: any) => (i.archaeologistName || null)).filter(Boolean)),
    ).slice(0, 5)

    return { count, collections, archaeologists }
  }, [items])

  const svgAspect = VB_WIDTH / VB_HEIGHT

  const effectiveMapWidth = isDesktop
    ? containerLayout.width || windowWidth - sidePanelWidth
    : containerLayout.width || windowWidth

  const baseWidth = isMobile
    ? Math.min(effectiveMapWidth * 0.95, 600)
    : isTablet
      ? Math.min(effectiveMapWidth * 0.9, 900)
      : isLargeDesktop
        ? Math.min(effectiveMapWidth * 0.85, 1100)
        : Math.min(effectiveMapWidth * 0.9, 1000)

  const svgWidth = baseWidth * zoomLevel
  const svgHeight = svgWidth / svgAspect

  const offsetX = Math.max(0, (effectiveMapWidth - svgWidth) / 2)
  const offsetY = isMobile ? 10 : 20

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
  const handleZoomReset = () => setZoomLevel(1)

  // Gesto de pinch para zoom en móvil
  const pinchGesture = Gesture.Pinch()
    .enabled(isMobile)
    .onStart(() => {
      savedScale.current = zoomLevel
    })
    .onUpdate((e) => {
      const newScale = savedScale.current * e.scale
      const clampedScale = Math.min(Math.max(newScale, 0.6), 2)
      setZoomLevel(clampedScale)
    })
    .runOnJS(true)

  useEffect(() => {
    const sub = Dimensions.addEventListener?.("change", ({ window }) => {
      setWindowWidth(window.width)
    })
    return () => sub?.remove?.()
  }, [])

  const PanelContent = () => {
    if (!selected) {
      return (
        <View className="items-center justify-center py-16 px-5">
          <View className="relative mb-8">
            <View className="w-20 h-20 rounded-full bg-white border-3 border-[#D9C6A5] items-center justify-center shadow-lg">
              <Ionicons name="map-outline" size={36} color={Colors.darkgreen} />
            </View>
            <View className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-[#B7C9A6] border-3 border-[#F3E9DD]" />
          </View>
          <Text className="text-2xl font-extrabold text-[#1A1A1A] mb-2 text-center" style={{ letterSpacing: -0.5 }}>
            Explora el Depósito
          </Text>
          <Text className="text-base font-semibold text-[#4A4A3E] mb-3 text-center">Navega por el mapa arqueológico</Text>
          <Text className="text-sm text-[#7A7A6E] text-center leading-5 max-w-[280px]">
            Selecciona cualquier estante o mesa en el mapa para visualizar las piezas arqueológicas almacenadas.
          </Text>

          <View className="mt-8 gap-3 w-full">
            <View className="flex-row items-center gap-3 bg-white py-3.5 px-4 rounded-xl border-2 border-[#E2D1B2] shadow-md">
              <View className="w-10 h-10 rounded-full bg-[#E2D1B2] items-center justify-center">
                <Ionicons name="hand-left-outline" size={20} color={Colors.darkgreen} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1A1A1A] mb-0.5">Selecciona ubicaciones</Text>
                <Text className="text-xs text-[#7A7A6E] leading-tight">Haz clic en estantes o mesas</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3 bg-white py-3.5 px-4 rounded-xl border-2 border-[#E2D1B2] shadow-md">
              <View className="w-10 h-10 rounded-full bg-[#E2D1B2] items-center justify-center">
                <Ionicons name="search-outline" size={20} color={Colors.darkgreen} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1A1A1A] mb-0.5">Controla el zoom</Text>
                <Text className="text-xs text-[#7A7A6E] leading-tight">Ajusta la vista para mejor precisión</Text>
              </View>
            </View>
          </View>
        </View>
      )
    }

    return (
      <>
        <View className="items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-white border-3 border-[#D9C6A5] items-center justify-center mb-3">
            <Ionicons name="cube-outline" size={28} color={Colors.brown} />
          </View>
          <Text className="text-2xl font-extrabold text-[#1A1A1A] text-center" style={{ letterSpacing: -0.5 }}>
            {selected.label ?? "Estantería"}
          </Text>
        </View>

        {loading ? (
          <View className="py-16 items-center">
            <View className="mb-4">
              <Ionicons name="hourglass-outline" size={48} color={Colors.accent} />
            </View>
            <Text className="text-base text-[#1A1A1A] font-bold mb-1.5">Consultando inventario</Text>
            <Text className="text-xs text-[#7A7A6E]">Accediendo a la base de datos...</Text>
          </View>
        ) : details ? (
          <>
            <View className="bg-white rounded-2xl p-5 items-center border-2 border-[#E2D1B2] mb-6 shadow-lg relative overflow-hidden">
              <View className="w-11 h-11 rounded-full bg-[#E2D1B2] items-center justify-center mb-3">
                <Ionicons name="stats-chart" size={24} color={Colors.darkgreen} />
              </View>
              <Text className="text-4xl font-black text-[#4A5D23] mb-1.5" style={{ letterSpacing: -1.5 }}>
                {details.count}
              </Text>
              <Text className="text-[10px] text-[#4A4A3E] font-extrabold tracking-widest">
                PIEZAS ARQUEOLÓGICAS
              </Text>
              <View className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#B7C9A6]" />
            </View>

            {details.collections.length > 0 && (
              <View className="mb-5">
                <View className="flex-row items-center gap-2.5 mb-4">
                  <Ionicons name="library-outline" size={20} color={Colors.darkgreen} />
                  <Text className="text-base font-extrabold text-[#1A1A1A]" style={{ letterSpacing: -0.3 }}>
                    Colecciones
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5">
                  {details.collections.map((c: string) => (
                    <View
                      key={c}
                      className="flex-row items-center gap-2.5 bg-[#B7C9A6] px-4 py-2.5 rounded-xl border-2 border-[#9AAE8C] shadow-sm"
                    >
                      <View className="w-1.5 h-1.5 rounded-full bg-[#4A5D23]" />
                      <Text className="text-sm text-[#1A1A1A] font-bold">{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {details.archaeologists.length > 0 && (
              <View className="mb-5">
                <View className="flex-row items-center gap-2.5 mb-4">
                  <Ionicons name="people-outline" size={20} color={Colors.brown} />
                  <Text className="text-base font-extrabold text-[#1A1A1A]" style={{ letterSpacing: -0.3 }}>
                    Investigadores
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5">
                  {details.archaeologists.map((a: string) => (
                    <View
                      key={a}
                      className="flex-row items-center gap-2.5 bg-[#C9ADA1] px-4 py-2.5 rounded-xl border-2 border-[#A68B5B] shadow-sm"
                    >
                      <View className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
                      <Text className="text-sm text-[#1A1A1A] font-bold">{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="gap-2.5 mt-4">
              <Pressable
                className="flex-row items-center justify-center gap-2 bg-[#4A5D23] py-3.5 rounded-xl border-2 border-[#656e55] shadow-lg active:scale-[0.98]"
                onPress={() => {
                  if (!selected) return
                  const shelfId = SHELF_ID_MAP[selected.id]
                  const params: any = {}
                  if (shelfId !== undefined && shelfId !== null) params.shelfId = Number(shelfId)
                  if (selected.label) params.shelfLabel = selected.label
                  
                  if (isMobile || isTablet) {
                    setShowMobilePanel(false)
                  }
                  
                  // Transición slide desde la derecha
                  router.push({
                    pathname: "/(tabs)/archaeological-Pieces/View_pieces",
                    params,
                  })
                }}
              >
                <Ionicons name="eye-outline" size={18} color={Colors.white} />
                <Text className="text-white text-sm font-extrabold">
                  Ver piezas
                </Text>
              </Pressable>

              {!selected.label?.includes("Mesa MT-") && (
                <Pressable
                  className="flex-row items-center justify-center gap-2 bg-white border-2 border-[#D9C6A5] py-3.5 rounded-xl shadow-md active:scale-[0.98] active:bg-[#E2D1B2]"
                  onPress={() => {
                    if (!selected) return
                    const shelfId = SHELF_ID_MAP[selected.id]
                    const params: any = {}
                    if (shelfId !== undefined && shelfId !== null) params.shelfId = Number(shelfId)
                    if (selected.label) params.shelfLabel = selected.label
                    
                    if (isMobile || isTablet) {
                      setShowMobilePanel(false)
                    }
                    
                    // Transición slide desde abajo
                    router.push({
                      pathname: "/(tabs)/archaeological-Pieces/shelf-detail",
                      params,
                    })
                  }}
                >
                  <Ionicons name="document-text-outline" size={18} color={Colors.darkgreen} />
                  <Text className="text-[#4A5D23] text-sm font-extrabold">Detalle de estantería</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : null}
      </>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 w-full bg-[#F3E9DD]" style={style}>
        <View className="flex-1 flex-row">
        <View className="flex-1 relative bg-white" onLayout={(e) => setContainerLayout(e.nativeEvent.layout)}>
          {/* Controles de zoom - Solo en tablet y desktop */}
          {!isMobile && (
            <View
              className="absolute z-[1000] bg-white rounded-2xl border-2 border-[#D9C6A5] shadow-xl overflow-hidden"
              style={{
                right: isTablet ? 20 : 32,
                bottom: Platform.select({ ios: insets.bottom , android: insets.bottom, default: 32 }),
              }}
            >
            <Pressable
              style={({ pressed }) => [
                styles.zoomButton,
                pressed && styles.zoomButtonPressed,
              ]}
              onPress={handleZoomIn}
            >
              <Text style={styles.zoomButtonText}>+</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.zoomButton,
                styles.zoomResetButton,
                pressed && styles.zoomButtonPressed,
              ]}
              onPress={handleZoomReset}
            >
              <Text style={styles.zoomResetText}>
                {Math.round(zoomLevel * 100)}%
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.zoomButton,
                pressed && styles.zoomButtonPressed,
              ]}
              onPress={handleZoomOut}
            >
              <Text style={styles.zoomButtonText}>−</Text>
            </Pressable>
            </View>
          )}

          {/* MAPA + SVG */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ 
              flexGrow: 1, 
              alignItems: "center", 
              paddingVertical: 0 
            }}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            horizontal={false}
            bounces={false}
          >
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              bounces={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {isMobile ? (
                <GestureDetector gesture={pinchGesture}>
                  <Animated.View style={{ width: svgWidth + offsetX * 2, minHeight: svgHeight + offsetY * 2 }}>
                    <View
                      style={{
                        position: "relative",
                        width: svgWidth,
                        height: svgHeight,
                        marginTop: offsetY,
                        marginHorizontal: offsetX,
                      }}
                    >
                    <DepositoSvg
                      width={svgWidth}
                      height={svgHeight}
                      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
                      preserveAspectRatio="xMidYMid meet"
                    />

                {svgWidth > 0 &&
                  SHELVES.map((s) => {
                    const left = (s.x / VB_WIDTH) * svgWidth
                    const top = (s.y / VB_HEIGHT) * svgHeight
                    const width = (s.w / VB_WIDTH) * svgWidth
                    const height = (s.h / VB_HEIGHT) * svgHeight
                    const isSelected = selected?.id === s.id
                    const isHovered = hoveredShelf === s.id

                    const webTransition =
                      Platform.OS === "web"
                        ? {
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: isSelected ? "scale(1.08)" : isHovered ? "scale(1.04)" : "scale(1)",
                          }
                        : {}

                    return (
                      <Pressable
                        key={s.id}
                        onPress={() => onShelfPress(s)}
                        onHoverIn={Platform.OS === "web" ? () => setHoveredShelf(s.id) : undefined}
                        onHoverOut={Platform.OS === "web" ? () => setHoveredShelf(null) : undefined}
                        style={[
                          { position: "absolute", overflow: "visible", borderRadius: 8, left, top, width, height },
                          Platform.OS === "web" && ({ cursor: "pointer", ...webTransition } as any),
                        ]}
                        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                        android_ripple={{ color: Colors.ripple }}
                      >
                        <View
                          style={[
                            styles.hotInner,
                            isSelected && styles.selectedHot,
                            isHovered && styles.hoveredHot,
                          ]}
                        />
                        {isHovered && Platform.OS === "web" && (
                          <View style={styles.tooltip}>
                            <Text style={styles.tooltipText}>
                              {s.label}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    )
                  })}
                    </View>
                  </Animated.View>
                </GestureDetector>
              ) : (
                <View style={{ width: svgWidth + offsetX * 2, minHeight: svgHeight + offsetY * 2 }}>
                  <View
                    style={{
                      position: "relative",
                      width: svgWidth,
                      height: svgHeight,
                      marginTop: offsetY,
                      marginHorizontal: offsetX,
                    }}
                  >
                  <DepositoSvg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                  />

                {svgWidth > 0 &&
                  SHELVES.map((s) => {
                    const left = (s.x / VB_WIDTH) * svgWidth
                    const top = (s.y / VB_HEIGHT) * svgHeight
                    const width = (s.w / VB_WIDTH) * svgWidth
                    const height = (s.h / VB_HEIGHT) * svgHeight
                    const isSelected = selected?.id === s.id
                    const isHovered = hoveredShelf === s.id

                    const webTransition =
                      Platform.OS === "web"
                        ? {
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: isSelected ? "scale(1.08)" : isHovered ? "scale(1.04)" : "scale(1)",
                          }
                        : {}

                    return (
                      <Pressable
                        key={s.id}
                        onPress={() => onShelfPress(s)}
                        onHoverIn={Platform.OS === "web" ? () => setHoveredShelf(s.id) : undefined}
                        onHoverOut={Platform.OS === "web" ? () => setHoveredShelf(null) : undefined}
                        style={[
                          { position: "absolute", overflow: "visible", borderRadius: 8, left, top, width, height },
                          Platform.OS === "web" && ({ cursor: "pointer", ...webTransition } as any),
                        ]}
                        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                        android_ripple={{ color: Colors.ripple }}
                      >
                        <View
                          style={[
                            styles.hotInner,
                            isSelected && styles.selectedHot,
                            isHovered && styles.hoveredHot,
                          ]}
                        />
                        {isHovered && Platform.OS === "web" && (
                          <View style={styles.tooltip}>
                            <Text style={styles.tooltipText}>
                              {s.label}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    )
                  })}
                  </View>
                </View>
              )}
            </ScrollView>
          </ScrollView>

          {/* Botón flotante móvil para ver info */}
          {(isMobile || isTablet) && selected && (
            <Pressable
              style={[
                styles.mobileInfoButton,
                { bottom: insets.bottom + 10 },
              ]}
              onPress={() => setShowMobilePanel(true)}
            >
              <Ionicons name="information-circle-outline" size={20} color={Colors.white} style={styles.mobileInfoButtonIcon} />
              <Text style={styles.mobileInfoButtonText}>
                Ver información
              </Text>
            </Pressable>
          )}
        </View>

        {/* PANEL LATERAL DESKTOP */}
        {isDesktop && (
          <View
            className="bg-[#F3E9DD] border-l-2 border-[#D9C6A5] shadow-2xl"
            style={{
              width: sidePanelWidth,
            }}
          >
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 32 }} showsVerticalScrollIndicator={false}>
              <PanelContent />
            </ScrollView>
          </View>
        )}
      </View>

      {/* PANEL BOTTOM SHEET MOBILE/TABLET */}
      {(isMobile || isTablet) && (
        <Modal
          visible={showMobilePanel}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setShowMobilePanel(false)}
        >
          <View style={styles.mobileModalOverlay}>
            <Pressable style={styles.mobileModalBackdrop} onPress={() => setShowMobilePanel(false)} />
            <View
              style={[
                styles.mobileModalContent,
                {
                  height: Dimensions.get("window").height * 0.83,
                  paddingBottom: (insets.bottom || 16) + 8,
                },
              ]}
            >
              <View style={styles.mobileModalHeader}>
                <View style={styles.mobileModalHandle} />
                <Pressable
                  style={styles.mobileModalCloseButton}
                  onPress={() => setShowMobilePanel(false)}
                >
                  <Text style={styles.mobileModalCloseText}>✕</Text>
                </Pressable>
              </View>
              <ScrollView
                style={styles.mobileModalScroll}
                contentContainerStyle={[
                  styles.mobileModalScrollContent,
                  { paddingBottom: (insets.bottom || 16) + 24 },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <PanelContent />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL MESAS DE TRABAJO */}
      <Modal visible={!!mtSelection} transparent animationType="fade" onRequestClose={() => setMtSelection(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMtSelection(null)}
        >
          <Pressable
            style={[styles.mtModal, isMobile && styles.mtModalMobile]}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center">
              <View className="w-[72px] h-[72px] rounded-full bg-white border-4 border-[#D9C6A5] items-center justify-center mb-4">
                <Ionicons name="construct-outline" size={36} color={Colors.accent} />
              </View>
              <Text className="text-3xl font-extrabold text-[#1A1A1A] text-center" style={{ letterSpacing: -0.5 }}>
                {mtSelection?.mesa.label ?? "Mesa de Trabajo"}
              </Text>
            </View>

            <Text className="text-base text-[#7A7A6E] text-center mb-6 leading-snug px-2">
              Las mesas de trabajo pueden contener piezas propias o estar vinculadas a estantes cercanos
            </Text>

            <View className="h-0.5 bg-[#E2D1B2] mb-6 rounded" />

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-3.5">
                <Text className="text-base font-bold text-[#4A4A3E] mb-3 text-center" style={{ letterSpacing: 0.5 }}>
                  Seleccione una ubicación
                </Text>

                <Pressable
                  className="flex-row items-center gap-3.5 bg-[#4A5D23] py-5 px-5 rounded-2xl border-2 border-[#656e55] shadow-lg active:scale-[0.97]"
                  onPress={() => {
                    if (mtSelection?.mesa) {
                      setSelected(mtSelection.mesa)
                      setMtSelection(null)
                      if (isMobile || isTablet) {
                        setShowMobilePanel(true)
                      }
                    }
                  }}
                >
                  <View className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.25)] items-center justify-center">
                    <Ionicons name="construct" size={20} color={Colors.white} />
                  </View>
                  <Text className="flex-1 text-white text-lg font-extrabold">{mtSelection?.mesa.label}</Text>
                </Pressable>

                {mtSelection?.shelves.map((shelf) => (
                  <Pressable
                    key={shelf.id}
                    className="flex-row items-center gap-3.5 bg-[#A68B5B] py-5 px-5 rounded-2xl border-2 border-[#8B5E3C] shadow-lg active:scale-[0.97]"
                    onPress={() => {
                      setSelected(shelf)
                      setMtSelection(null)
                      if (isMobile || isTablet) {
                        setShowMobilePanel(true)
                      }
                    }}
                  >
                    <View className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.25)] items-center justify-center">
                      <Ionicons name="cube" size={20} color={Colors.white} />
                    </View>
                    <Text className="flex-1 text-white text-lg font-extrabold">{shelf.label}</Text>
                  </Pressable>
                ))}

                <Pressable
                  className="bg-white border-2 border-[#D9C6A5] py-4 rounded-xl items-center mt-4 active:bg-[#E2D1B2]"
                  onPress={() => setMtSelection(null)}
                >
                  <Text className="text-[#4A5D23] text-base font-extrabold">Cancelar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  zoomButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderBottomColor: Colors.cremitLight,
  },
  zoomButtonPressed: {
    backgroundColor: Colors.cremitLight,
  },
  zoomResetButton: {
    backgroundColor: Colors.cream,
  },
  zoomButtonText: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.darkgreen,
    lineHeight: 26,
    textAlign: "center",
  },
  zoomResetText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.darkgreen,
    letterSpacing: 0.5,
  },

  hotInner: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  selectedHot: {
    backgroundColor: Colors.shelfSelected,
    borderWidth: 4,
    borderColor: Colors.darkgreen,
    shadowColor: Colors.darkgreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  hoveredHot: {
    backgroundColor: Colors.shelfHovered,
    borderWidth: 3,
    borderColor: Colors.mediumgreen,
    shadowColor: Colors.mediumgreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  tooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    marginLeft: -70,
    backgroundColor: Colors.darkText,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    minWidth: 140,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  } as ViewStyle,
  tooltipText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800" as any,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
  },
  mtModal: {
    backgroundColor: Colors.cream,
    borderRadius: 32,
    width: 480,
    maxHeight: "80%",
    padding: 36,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 3,
    borderColor: Colors.cremit,
  },

  mobileInfoButton: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.darkgreen,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: Colors.darkgreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  mobileInfoButtonIcon: {},
  mobileInfoButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  mobileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    justifyContent: "flex-end",
  },
  mobileModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mobileModalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
  },
  mobileModalHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.cremitLight,
    position: "relative",
  },
  mobileModalHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.cremit,
    borderRadius: 3,
    marginBottom: 8,
  },
  mobileModalCloseButton: {
    position: "absolute",
    right: 20,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cremitLight,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
  mobileModalCloseText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.darkText,
  },
  mobileModalScroll: {
    flex: 1,
  },
  mobileModalScrollContent: {
    padding: 24,
  },

  mtModalMobile: {
    width: "90%",
    maxWidth: 400,
  },
})
