import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import Colors from '../constants/Colors';

type SlotId = string;

type ShelfDetailViewProps = {
  shelfName: string;
  shelfId: number;
  levels: number;
  columns: number;
  occupiedSlots?: SlotId[];
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

  // Proporciones del SVG (más apaisado)
  const svgWidth = 320;
  const svgHeight = 220;
  const padding = 22;
  const usableWidth = svgWidth - padding * 2;
  const usableHeight = svgHeight - padding * 2;
  const levelHeight = usableHeight / Math.max(levels, 1);
  const slotWidth = usableWidth / Math.max(columns, 1);

  const isOccupied = (slotId: SlotId) => occupiedSlots.includes(slotId);

  const slots = useMemo(
    () =>
      Array.from({ length: levels }).flatMap((_, levelIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => {
          const uiLevel = levels - levelIndex;
          const uiCol = colIndex + 1;
          const id = `L${uiLevel}-C${uiCol}`;
          const x = padding + colIndex * slotWidth;
          const y = padding + levelIndex * levelHeight;
          return { id, uiLevel, uiCol, x, y };
        }),
      ),
    [levels, columns, slotWidth, levelHeight],
  );

  const handleSlotClick = (slotId: SlotId) => {
    setSelectedSlot(slotId);
    // onSlotClick se dispara desde el botón "Ver piezas"
  };

  const selectedSlotInfo = useMemo(() => {
    if (!selectedSlot) return null;
    const match = selectedSlot.match(/L(\d+)-C(\d+)/);
    if (!match) return null;
    const [, level, column] = match;
    return { level: Number(level), column: Number(column) };
  }, [selectedSlot]);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
      {/* Header */}
      <View 
        className="px-6 pt-5 pb-4 border-b" 
        style={{ 
          backgroundColor: '#ffffff',
          borderBottomColor: Colors.cremit 
        }}
      >
        <Text 
          className="text-[11px] font-semibold uppercase mb-1" 
          style={{ 
            color: Colors.brown,
            letterSpacing: 1.5 
          }}
        >
          Vista Detallada
        </Text>
        <Text 
          className="text-2xl font-bold" 
          style={{ color: Colors.black }}
        >
          {shelfName}
        </Text>
      </View>

      {/* Botón de cierre flotante */}
      {onClose && (
        <Pressable
          onPress={onClose}
          className="absolute top-4 right-4 w-11 h-11 rounded-full items-center justify-center z-10"
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.cremitLight : '#ffffff',
            borderWidth: 1.5,
            borderColor: Colors.cremit,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 5,
            transform: [{ scale: pressed ? 0.94 : 1 }],
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
          className={`w-full max-w-[1180px] flex-col gap-5 ${
            isDesktop ? 'md:flex-row md:gap-6 md:items-stretch' : ''
          }`}
        >
          {/* SVG */}
          <View
            className="bg-white rounded-2xl items-center justify-center p-[18px]"
            style={{
              borderWidth: 1,
              borderColor: Colors.cremit,
              minHeight: 260,
              maxHeight: 400,
              aspectRatio: 16 / 9,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 3,
              width: isDesktop ? '65%' : '100%',
            }}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Fondo general */}
              <Rect
                x={0}
                y={0}
                width={svgWidth}
                height={svgHeight}
                fill={Colors.cream}
                rx={28}
              />

              {/* Marco exterior grande */}
              <Rect
                x={padding - 14}
                y={padding - 4}
                width={usableWidth + 28}
                height={usableHeight + 8}
                fill={Colors.black}
                rx={22}
              />

              {/* Marco interior */}
              <Rect
                x={padding - 4}
                y={padding + 4}
                width={usableWidth + 8}
                height={usableHeight - 8}
                fill={Colors.cremit}
                rx={16}
              />

              {/* Laterales oscuros */}
              <Rect
                x={padding - 4}
                y={padding + 4}
                width={12}
                height={usableHeight - 8}
                fill={Colors.black}
                opacity={0.92}
              />
              <Rect
                x={padding + usableWidth}
                y={padding + 4}
                width={12}
                height={usableHeight - 8}
                fill={Colors.black}
                opacity={0.92}
              />

              {/* Planchas horizontales */}
              {Array.from({ length: levels }).map((_, levelIndex) => {
                const plankY =
                  padding +
                  (levelIndex + 1) * levelHeight -
                  levelHeight * 0.3;
                return (
                  <Rect
                    key={`plank-${levelIndex}`}
                    x={padding}
                    y={plankY}
                    width={usableWidth}
                    height={levelHeight * 0.18}
                    fill={Colors.lightbrown}
                    rx={26}
                  />
                );
              })}

              {/* Slots */}
              {slots.map(({ id, uiLevel, uiCol, x, y }) => {
                const occupied = isOccupied(id);
                const selected = selectedSlot === id;

                let fill, stroke, labelColor;

                if (selected) {
                  fill = Colors.darkgreen;
                  stroke = Colors.green;
                  labelColor = '#ffffff';
                } else if (occupied) {
                  fill = Colors.lightgreen;
                  stroke = Colors.mediumgreen;
                  labelColor = Colors.black;
                } else {
                  fill = '#FFFFFF';
                  stroke = Colors.cremit;
                  labelColor = Colors.brown;
                }

                const slotX = x + slotWidth * 0.08;
                const slotY = y + levelHeight * 0.18;
                const slotW = slotWidth * 0.84;
                const slotH = levelHeight * 0.48;

                return (
                  <G key={id} onPress={() => handleSlotClick(id)}>
                    {/* Sombra */}
                    <Rect
                      x={slotX + 2}
                      y={slotY + 3}
                      width={slotW}
                      height={slotH}
                      fill="#000"
                      opacity={0.08}
                      rx={14}
                    />
                    {/* Slot principal */}
                    <Rect
                      x={slotX}
                      y={slotY}
                      width={slotW}
                      height={slotH}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={selected ? 2.8 : 1.6}
                      rx={14}
                    />
                    {/* Indicador superior si está ocupado */}
                    {occupied && (
                      <Rect
                        x={slotX + slotW * 0.08}
                        y={slotY + 4}
                        width={slotW * 0.84}
                        height={4}
                        fill={Colors.mediumgreen}
                        rx={2}
                      />
                    )}
                    {/* Label */}
                    <SvgText
                      x={slotX + slotW / 2}
                      y={slotY + slotH * 0.55}
                      textAnchor="middle"
                      fontSize={selected ? 14 : 12}
                      fontWeight={selected ? '700' : '600'}
                      fill={labelColor}
                    >
                      {uiLevel}-{uiCol}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
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
            <View 
              className="bg-white rounded-2xl p-[18px]"
              style={{
                borderWidth: 1,
                borderColor: Colors.cremit,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center gap-2 mb-[10px]">
                <Ionicons name="cube-outline" size={20} color={Colors.green} />
                <Text 
                  className="text-[11px] font-bold uppercase" 
                  style={{ color: Colors.green, letterSpacing: 1.2 }}
                >
                  Vista Detallada
                </Text>
              </View>
              <Text 
                className="text-xl font-bold mb-[14px]" 
                style={{ color: Colors.black }}
              >
                {shelfName}
              </Text>

              <View 
                className="flex-row items-center rounded-xl py-[14px] px-[10px] mt-1"
                style={{ backgroundColor: Colors.cream }}
              >
                <View className="flex-1 items-center">
                  <Text 
                    className="text-2xl font-extrabold mb-0.5" 
                    style={{ color: Colors.darkgreen }}
                  >
                    {levels}
                  </Text>
                  <Text 
                    className="text-[11px] font-semibold uppercase" 
                    style={{ color: Colors.green, letterSpacing: 0.4 }}
                  >
                    Niveles
                  </Text>
                </View>
                <View 
                  className="w-px h-9" 
                  style={{ backgroundColor: Colors.cremit }}
                />
                <View className="flex-1 items-center">
                  <Text 
                    className="text-2xl font-extrabold mb-0.5" 
                    style={{ color: Colors.darkgreen }}
                  >
                    {columns}
                  </Text>
                  <Text 
                    className="text-[11px] font-semibold uppercase" 
                    style={{ color: Colors.green, letterSpacing: 0.4 }}
                  >
                    Columnas
                  </Text>
                </View>
                <View 
                  className="w-px h-9" 
                  style={{ backgroundColor: Colors.cremit }}
                />
                <View className="flex-1 items-center">
                  <Text 
                    className="text-2xl font-extrabold mb-0.5" 
                    style={{ color: Colors.darkgreen }}
                  >
                    {occupiedSlots.length}
                  </Text>
                  <Text 
                    className="text-[11px] font-semibold uppercase" 
                    style={{ color: Colors.green, letterSpacing: 0.4 }}
                  >
                    Ocupados
                  </Text>
                </View>
              </View>
            </View>

            {/* Leyenda */}
            <View 
              className="bg-white rounded-2xl p-[18px]"
              style={{
                borderWidth: 1,
                borderColor: Colors.cremit,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center gap-2 mb-[10px]">
                <Ionicons name="color-palette-outline" size={20} color={Colors.green} />
                <Text 
                  className="text-[11px] font-bold uppercase" 
                  style={{ color: Colors.green, letterSpacing: 1.2 }}
                >
                  Leyenda
                </Text>
              </View>
              <View className="gap-[10px]">
                <View className="flex-row items-center gap-[10px]">
                  <View
                    className="w-6 h-6 rounded-md"
                    style={{
                      backgroundColor: Colors.lightgreen,
                      borderColor: Colors.mediumgreen,
                      borderWidth: 2,
                    }}
                  />
                  <Text className="text-sm font-medium" style={{ color: Colors.black }}>
                    Espacio ocupado
                  </Text>
                </View>
                <View className="flex-row items-center gap-[10px]">
                  <View
                    className="w-6 h-6 rounded-md"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: Colors.cremit,
                      borderWidth: 2,
                    }}
                  />
                  <Text className="text-sm font-medium" style={{ color: Colors.black }}>
                    Espacio disponible
                  </Text>
                </View>
                <View className="flex-row items-center gap-[10px]">
                  <View
                    className="w-6 h-6 rounded-md"
                    style={{
                      backgroundColor: Colors.darkgreen,
                      borderColor: Colors.green,
                      borderWidth: 2,
                    }}
                  />
                  <Text className="text-sm font-medium" style={{ color: Colors.black }}>
                    Seleccionado
                  </Text>
                </View>
              </View>
            </View>

            {/* Posición seleccionada */}
            <View
              className="bg-white rounded-2xl p-[18px]"
              style={{
                borderWidth: selectedSlotInfo ? 2 : 1,
                borderColor: selectedSlotInfo ? Colors.darkgreen : Colors.cremit,
                backgroundColor: selectedSlotInfo ? '#F7F1E7' : '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center gap-2 mb-[10px]">
                <Ionicons 
                  name={selectedSlotInfo ? 'location' : 'hand-left-outline'} 
                  size={20} 
                  color={Colors.green} 
                />
                <Text 
                  className="text-[11px] font-bold uppercase" 
                  style={{ color: Colors.green, letterSpacing: 1.2 }}
                >
                  {selectedSlotInfo ? 'Posición activa' : 'Selecciona un espacio'}
                </Text>
              </View>

              {selectedSlotInfo ? (
                <>
                  <View 
                    className="px-[14px] py-2 rounded-full self-start mb-3"
                    style={{ backgroundColor: Colors.darkgreen }}
                  >
                    <Text className="text-[15px] font-bold text-white">
                      Nivel {selectedSlotInfo.level} · Col {selectedSlotInfo.column}
                    </Text>
                  </View>
                  <View 
                    className="p-3 rounded-[10px] mb-[10px]"
                    style={{
                      backgroundColor: Colors.cream,
                      borderLeftWidth: 3,
                      borderLeftColor: Colors.darkgreen,
                    }}
                  >
                    <Text 
                      className="text-[11px] font-semibold uppercase mb-1" 
                      style={{ color: Colors.green, letterSpacing: 0.5 }}
                    >
                      ID de ubicación
                    </Text>
                    <Text 
                      className="text-base font-bold" 
                      style={{ color: Colors.black, fontFamily: 'monospace' }}
                    >
                      {selectedSlot}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => selectedSlot && onSlotClick?.(selectedSlot)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 999,
                      marginVertical: 10,
                      backgroundColor: pressed ? Colors.green : Colors.darkgreen,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 3,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                    <Text 
                      style={{ 
                        fontSize: 15, 
                        fontWeight: 'bold', 
                        color: '#FFFFFF',
                        letterSpacing: 0.4 
                      }}
                    >
                      Ver piezas
                    </Text>
                  </Pressable>
                  <View className="flex-row items-start gap-2">
                    <Ionicons name="bulb-outline" size={16} color={Colors.brown} style={{ marginTop: 2 }} />
                    <Text 
                      className="text-[13px] italic flex-1" 
                      style={{ color: Colors.brown, lineHeight: 19 }}
                    >
                      Visualiza las piezas arqueológicas almacenadas en esta ubicación.
                    </Text>
                  </View>
                </>
              ) : (
                <Text 
                  className="text-sm text-center py-2" 
                  style={{ color: Colors.green, lineHeight: 21 }}
                >
                  Toca un espacio en la estantería para ver sus detalles y las piezas almacenadas.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShelfDetailView;
