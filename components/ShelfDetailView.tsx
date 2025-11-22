import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, G, Rect, Text as SvgText, } from 'react-native-svg';
import Colors from '../constants/Colors';

type SlotId = string;

type ShelfDetailViewProps = {
  shelfName: string;
  shelfId: number;
  levels: number;
  columns: number;
  occupiedSlots?: SlotId[]; // se usa sólo para el contador, no para la visual
  onSlotClick?: (slotId: SlotId) => void;
  onClose?: () => void;
};

const ShelfDetailView: React.FC<ShelfDetailViewProps> = ({
  shelfName,
  levels,
  columns,
  occupiedSlots = [],
  onSlotClick,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<SlotId | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 768;
  const isMobile = !isDesktop;

  // Proporciones del SVG (sistema de coordenadas interno)
  const svgWidth = 360;
  const svgHeight = 230;
  const padding = 20;

  const usableWidth = svgWidth - padding * 2;
  const usableHeight = svgHeight - padding * 2;

  // Zonas para labels y grilla
  const headerHeight = 24; // fila de columnas
  const sideLabelWidth = 26; // columna de niveles

  const gridWidth = usableWidth - sideLabelWidth - 8;
  const gridHeight = usableHeight - headerHeight - 8;

  const safeLevels = Math.max(levels, 1);
  const safeColumns = Math.max(columns, 1);

  const levelHeight = gridHeight / safeLevels;
  const slotWidth = gridWidth / safeColumns;

  const gridOriginX = padding + sideLabelWidth + 4;
  const gridOriginY = padding + headerHeight + 4;

  // Tamaños de fuente adaptados
  const colLabelFontSize = isDesktop ? 11 : 12;
  const rowLabelFontSize = isDesktop ? 11 : 12;
  const headerTagFontSize = isDesktop ? 9 : 10;

  // 1-1 ES ARRIBA A LA IZQUIERDA
  const slots = useMemo(
    () =>
      Array.from({ length: levels }).flatMap((_, levelIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => {
          const uiLevel = levelIndex + 1; // fila superior = 1
          const uiCol = colIndex + 1; // columna izquierda = 1
          const id = `L${uiLevel}-C${uiCol}`;

          const x = gridOriginX + colIndex * slotWidth;
          const y = gridOriginY + levelIndex * levelHeight;

          return { id, uiLevel, uiCol, x, y };
        }),
      ),
    [levels, columns, slotWidth, levelHeight, gridOriginX, gridOriginY],
  );

  const handleSlotClick = (slotId: SlotId) => {
    setSelectedSlot(slotId);
    // el callback real se ejecuta desde el botón "Ver piezas"
  };

  const selectedSlotInfo = useMemo(() => {
    if (!selectedSlot) return null;
    const match = selectedSlot.match(/L(\d+)-C(\d+)/);
    if (!match) return null;
    const [, level, column] = match;
    return { level: Number(level), column: Number(column) };
  }, [selectedSlot]);

  const outerStroke = 1.2;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.cream }}>
      {/* Header */}
      <View className="px-6 pt-5 pb-4 border-b bg-white" style={{ borderBottomColor: Colors.cremit }}>
        <Text className="text-[11px] font-semibold uppercase mb-1 tracking-widest" style={{ color: Colors.brown }}>
          Vista Detallada
        </Text>
        <Text className="text-2xl font-bold" style={{ color: Colors.black }}>
          {shelfName}
        </Text>
      </View>

      {/* Botón de cierre flotante */}
      {onClose && (
        <Pressable
          onPress={onClose}
          className={`absolute right-7 w-11 h-11 rounded-full items-center justify-center z-10 border-[1.5px] bg-white shadow-lg active:scale-95 ${Platform.OS === 'android' ? 'top-16' : 'top-4'
            }`}
          style={({ pressed }) => ({
            borderColor: Colors.cremit,
            backgroundColor: pressed ? Colors.cremitLight : '#ffffff',
          })}
        >
          <Text className="text-[22px] font-bold" style={{ color: Colors.black }}>
            ✕
          </Text>
        </Pressable>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 32, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className={`w-full max-w-[1180px] flex-col gap-5 ${isDesktop ? 'md:flex-row md:gap-6 md:items-stretch' : 'items-center'
            }`}
        >
          {/* SVG */}
          <View
            className="bg-white rounded-2xl p-[18px]"
            style={{
              borderWidth: 1,
              borderColor: Colors.cremit,
              // 🔍 En mobile le damos más altura real y dejamos que el SVG se expanda
              minHeight: isDesktop ? 260 : 320,
              maxHeight: isDesktop ? 420 : undefined,
              height: isDesktop ? 420 : 320,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 9,
              elevation: 3,
              width: isDesktop ? '65%' : '100%',
            }}
          >
            <Text className="text-xs font-semibold uppercase text-center mb-3 tracking-wide" style={{ color: Colors.brown }}>
              Mapa de estantería
            </Text>
            <View className="flex-1 items-center justify-center">
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Clip redondeado EXACTO de la grilla */}
                <Defs>
                  <ClipPath id="gridRoundedClip">
                    <Rect
                      x={gridOriginX}
                      y={gridOriginY}
                      width={gridWidth}
                      height={gridHeight}
                      rx={12}
                    />
                  </ClipPath>
                </Defs>

                {/* Fondo general */}
                <Rect
                  x={outerStroke / 2}
                  y={outerStroke / 2}
                  width={svgWidth - outerStroke}
                  height={svgHeight - outerStroke}
                  fill={Colors.cream}
                  rx={24}
                  stroke={Colors.cremit}
                  strokeWidth={outerStroke}
                />


                {/* Contenedor principal */}
                <Rect
                  x={padding - 6}
                  y={padding - 4}
                  width={usableWidth + 12}
                  height={usableHeight + 8}
                  fill="#ffffff"
                  rx={18}
                  stroke={Colors.cremit}
                  strokeWidth={1}
                />

                {/* Cabecera de columnas (1..M) */}
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const colNumber = colIndex + 1;
                  const colCenterX =
                    gridOriginX + colIndex * slotWidth + slotWidth / 2;

                  return (
                    <SvgText
                      key={`col-label-${colNumber}`}
                      x={colCenterX}
                      y={padding + headerHeight - 6}
                      textAnchor="middle"
                      fontSize={colLabelFontSize}
                      fontWeight="600"
                      fill={Colors.brown}
                    >
                      {colNumber}
                    </SvgText>
                  );
                })}

                {/* Etiqueta "N" a la izquierda */}
                <SvgText
                  x={padding + sideLabelWidth / 2}
                  y={padding + headerHeight - 6}
                  textAnchor="middle"
                  fontSize={headerTagFontSize}
                  fontWeight="600"
                  fill={Colors.brown}
                >
                  N
                </SvgText>

                {/* Labels de niveles (1..N) – 1 ARRIBA */}
                {Array.from({ length: levels }).map((_, levelIndex) => {
                  const levelNumber = levelIndex + 1;
                  const rowCenterY =
                    gridOriginY + levelIndex * levelHeight + levelHeight / 2;

                  return (
                    <SvgText
                      key={`row-label-${levelNumber}`}
                      x={padding + sideLabelWidth / 2}
                      y={rowCenterY + 3}
                      textAnchor="middle"
                      fontSize={rowLabelFontSize}
                      fontWeight="600"
                      fill={Colors.brown}
                    >
                      {levelNumber}
                    </SvgText>
                  );
                })}

                {/* Todo lo de la matriz va “recortado” */}
                <G clipPath="url(#gridRoundedClip)">
                  {/* Fondo suave de grilla */}
                  <Rect
                    x={gridOriginX}
                    y={gridOriginY}
                    width={gridWidth}
                    height={gridHeight}
                    fill={Colors.cream}
                    opacity={0.65}
                  />

                  {/* Celdas con borde (toda la matriz) */}
                  {Array.from({ length: levels }).map((_, levelIndex) =>
                    Array.from({ length: columns }).map((_, colIndex) => {
                      const cellX = gridOriginX + colIndex * slotWidth;
                      const cellY = gridOriginY + levelIndex * levelHeight;
                      const cellW = slotWidth;
                      const cellH = levelHeight;

                      return (
                        <Rect
                          key={`cell-${levelIndex}-${colIndex}`}
                          x={cellX}
                          y={cellY}
                          width={cellW}
                          height={cellH}
                          fill="transparent"
                          stroke={Colors.cremit}
                          strokeWidth={0.9}
                        />
                      );
                    }),
                  )}

                  {/* Slots (igual que los tenías) */}
                  {slots.map(({ id, uiLevel, uiCol, x, y }) => {
                    const selected = selectedSlot === id;

                    const fill = selected ? Colors.darkgreen : '#ffffff';
                    const stroke = selected ? Colors.green : Colors.cremit;
                    const labelColor = selected ? '#ffffff' : Colors.brown;

                    const gapX = slotWidth * 0.12;
                    const gapY = levelHeight * 0.18;

                    const slotX = x + gapX;
                    const slotY = y + gapY;
                    const slotW = slotWidth - gapX * 2;
                    const slotH = levelHeight - gapY * 2;

                    const slotLabelFontSize = selected
                      ? isDesktop ? 13 : 14
                      : isDesktop ? 11.5 : 12.5;

                    const textX = isMobile ? slotX + slotW / 2.5 : slotX + slotW / 2;
                    const textOffsetY =
                      Platform.OS === 'ios'
                        ? 5
                        : (isMobile ? 3.5 : slotLabelFontSize * 0.35);
                    const textY = slotY + slotH / 2 + textOffsetY;

                    return (
                      <G
                        key={id}
                        onPress={() => handleSlotClick(id)}
                        style={Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined}
                      >
                        <Rect
                          x={slotX + 1.2}
                          y={slotY + 1.6}
                          width={slotW}
                          height={slotH}
                          fill="#000"
                          opacity={0.05}
                          rx={10}
                        />

                        <Rect
                          x={slotX}
                          y={slotY}
                          width={slotW}
                          height={slotH}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={selected ? 2 : 1.4}
                          rx={10}
                        />

                        <SvgText
                          x={textX}
                          y={textY}
                          textAnchor="middle"
                          fontSize={slotLabelFontSize}
                          fontWeight={selected ? '700' : '600'}
                          fill={labelColor}
                        >
                          {uiLevel}-{uiCol}
                        </SvgText>
                      </G>
                    );
                  })}
                </G>

                {/* Borde externo encima, para rematar y tapar cualquier micro-gap */}
                <Rect
                  x={gridOriginX}
                  y={gridOriginY}
                  width={gridWidth}
                  height={gridHeight}
                  rx={12}
                  fill="transparent"
                  stroke={Colors.cremit}
                  strokeWidth={1.2}
                />
              </Svg>

            </View>
          </View>

          {/* Panel derecho */}
          <View
            className="gap-4 mt-1"
            style={{
              width: isDesktop ? '33%' : '100%',
              maxWidth: 340,
            }}
          >
            {/* Resumen estantería */}
            <View className="bg-white rounded-2xl p-[18px] border shadow-sm" style={{ borderColor: Colors.cremit }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: Colors.cream }}>
                    <Ionicons name="cube" size={18} color={Colors.darkgreen} />
                  </View>
                  <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color: Colors.brown }}>
                    Vista detallada
                  </Text>
                </View>
                <Text className="text-xl font-extrabold" style={{ color: Colors.darkgreen }}>
                  {shelfName}
                </Text>
              </View>

              <View className="flex-row items-center rounded-xl py-[14px] px-[10px]" style={{ backgroundColor: Colors.cream }}>
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-extrabold mb-0.5" style={{ color: Colors.darkgreen }}>
                    {levels}
                  </Text>
                  <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: Colors.green }}>
                    Niveles
                  </Text>
                </View>
                <View className="w-px h-9" style={{ backgroundColor: Colors.cremit }} />
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-extrabold mb-0.5" style={{ color: Colors.darkgreen }}>
                    {columns}
                  </Text>
                  <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: Colors.green }}>
                    Columnas
                  </Text>
                </View>
              </View>
            </View>

            {/* Posición seleccionada */}
            <View
              className="rounded-2xl p-[18px] shadow-sm"
              style={{
                borderWidth: selectedSlotInfo ? 2 : 1,
                borderColor: selectedSlotInfo ? Colors.darkgreen : Colors.cremit,
                backgroundColor: selectedSlotInfo ? '#F7F1E7' : '#ffffff',
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: selectedSlotInfo ? Colors.darkgreen : Colors.cream }}
                  >
                    <Ionicons
                      name={selectedSlotInfo ? 'location' : 'hand-left-outline'}
                      size={18}
                      color={selectedSlotInfo ? '#FFFFFF' : Colors.brown}
                    />
                  </View>
                  <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color: Colors.brown }}>
                    {selectedSlotInfo ? 'Posición activa' : 'Selecciona'}
                  </Text>
                </View>
                {selectedSlotInfo && (
                  <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Colors.darkgreen }}>
                    <Text className="text-sm font-bold text-white">
                      Nivel {selectedSlotInfo.level} · Col {selectedSlotInfo.column}
                    </Text>
                  </View>
                )}
              </View>

              {selectedSlotInfo ? (
                <>
                  <Pressable
                    className="flex-row items-center justify-center gap-2 bg-[#4A5D23] py-3 px-4 rounded-full my-2.5 shadow-lg active:scale-[0.98] active:bg-[#656e55]"
                    onPress={() => selectedSlot && onSlotClick?.(selectedSlot)}
                  >
                    <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                    <Text className="text-white text-[15px] font-bold">
                      Ver piezas
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Text className="text-sm text-center py-2 leading-[21px]" style={{ color: Colors.green }}>
                  Toca un espacio en la estantería para ver sus detalles y las piezas almacenadas.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShelfDetailView;
