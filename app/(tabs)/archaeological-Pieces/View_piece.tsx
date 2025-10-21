import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import Navbar from '../Navbar';
import Colors from '../../../constants/Colors';
import Badge from '../../../components/ui/Badge';
import InfoRow from '../../../components/ui/InfoRow';
import { useLocalSearchParams } from 'expo-router';

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
  description?: string;
  observation?: string;
  images?: string[];
  fichaHistorica?: { id: number; title: string }[];
  mentions?: { id: number; title: string }[];
  selectedLevel?: number;
  selectedColumn?: number;
};

export default function ViewPiece() {
  const params = useLocalSearchParams();
  const id = (params as any)?.id ? Number((params as any).id) : null;
  const { width: windowWidth } = useWindowDimensions();

  const columns = ['COLUMNA A', 'COLUMNA B', 'COLUMNA C', 'COLUMNA D'];
  const levels = ['NIVEL 1', 'NIVEL 2', 'NIVEL 3', 'NIVEL 4'];
  const containerMaxWidth = 720;
  const leftLabelWidth = 52; // slightly smaller to avoid overflow
  const gap = 8;
  // Compute container width based on the parent (92% width) minus parent paddings (16px each side)
  const parentWidth = Math.min(windowWidth * 0.92, containerMaxWidth);
  const containerWidth = Math.max(0, parentWidth - 32);
  const availableWidthForCells = Math.max(0, containerWidth - leftLabelWidth - gap * (columns.length - 1));
  const rawCellSize = Math.floor(availableWidthForCells / columns.length);
  const cellSize = Math.max(48, Math.min(rawCellSize, 110));

  const [piece, setPiece] = useState<Piece | null>(null);

  useEffect(() => {
    if (id == null) return;
    // mocked rich data
    setPiece({
      id: id,
      name: 'VAS IJA CEREMONIAL MOCHE',
      material: 'Cerámica (arcilla cocida pintada)',
      site: 'Rodolfo Raffino',
      archaeologist: 'Juan Bautista Ambrosetti',
      collection: 'Rio de La Plata',
      shelf: 'ESTANTERIA 07',
      level: 'NIVEL 02',
      column: 'COLUMNA C',
      description:
        'Vasija de cerámica modelada con forma antropomorfa representando una figura masculina con tocado ritual. Decoración en pintura roja y crema, cerámica característica de la cultura Moche del norte del Perú (aprox. 100-700 d.C.). Presenta detalles bien conservados en el rostro y el cuerpo, aunque se observa desgaste en los bordes.',
      observation: 'La pieza presenta una rotura en su interior y desgaste en el borde superior.',
      images: [null as any, null as any],
      fichaHistorica: [
        { id: 1, title: 'DESCUBRIMIENTO DE NATIONAL GEOGRAPHIC' },
        { id: 2, title: 'PUBLICACIÓN: REVISTA ARQUEOLOGÍA' },
      ],
      mentions: [
        { id: 1, title: 'DESCUBRIMIENTO DE NATIONAL GEOGRAPHIC' },
        { id: 2, title: 'ARTÍCULO EN LA PLATA' },
      ],
      selectedLevel: 1,
      selectedColumn: 2,
    });
  }, [id]);

  if (!piece) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F3E9DD' }}>
      <Navbar title="Ficha de la pieza" showBackArrow backToHome />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={{ width: '92%', maxWidth: 840, padding: 16 }}>
          {/* main content now sits on page background (no white card) */}
          <View style={{ backgroundColor: 'transparent', borderRadius: 0, padding: 12, borderWidth: 0 }}>
                <View style={{ marginBottom: 8, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <Badge text={piece.shelf || ''} background={Colors.green} textColor={Colors.cremit} />
                  <Badge text={piece.level || ''} background={Colors.brown} textColor={Colors.cremit} />
                  <Badge text={piece.column || ''} background={Colors.black} textColor={Colors.cremit} />
                </View>

            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8, fontFamily: 'CrimsonText-Regular' }}>{piece.name}</Text>

            <Text style={{ fontFamily: 'MateSC-Regular', color: '#333', marginBottom: 8 }}>DESCRIPCIÓN</Text>
            <Text style={{ fontFamily: 'CrimsonText-Regular', marginBottom: 12 }}>{piece.description}</Text>

            <View style={{ marginBottom: 8 }}>
              <InfoRow icon="cube" label="MATERIAL" value={piece.material} />
              <InfoRow icon="map-marker" label="SITIO ARQUEOLOGICO" value={piece.site} />
              <InfoRow icon="user" label="ARQUEOLOGO" value={piece.archaeologist} />
              <InfoRow icon="archive" label="COLECCION" value={piece.collection} />
            </View>

            <Text style={{ fontFamily: 'MateSC-Regular', color: '#333', marginTop: 8, marginBottom: 6 }}>OBSERVACIÓN</Text>
            <Text style={{ fontFamily: 'CrimsonText-Regular', marginBottom: 12 }}>{piece.observation}</Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={{ width: 120, height: 100, backgroundColor: '#F7F5F2', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6DAC4' }}>
                <Text style={{ fontFamily: 'CrimsonText-Regular' }}>IMAGEN</Text>
              </View>
              <View style={{ width: 120, height: 100, backgroundColor: '#F7F5F2', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6DAC4' }}>
                <Text style={{ fontFamily: 'CrimsonText-Regular' }}>FICHA HISTÓRICA</Text>
              </View>
            </View>

            {/* ficha histórica list */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontFamily: 'MateSC-Regular', color: '#333', marginBottom: 6 }}>FICHA HISTÓRICA</Text>
              {piece.fichaHistorica?.map((f) => (
                <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F5F2', padding: 8, borderRadius: 6, marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'CrimsonText-Regular' }}>{f.title}</Text>
                  <TouchableOpacity style={{ backgroundColor: Colors.green, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }} onPress={() => console.log('Ver ficha', f.id)}>
                    <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular' }}>VER</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Ubicación física */}
            <View style={{ marginTop: 8, backgroundColor: 'transparent', padding: 0, borderRadius: 0 }}>
              <Text style={{ fontFamily: 'MateSC-Regular', fontWeight: '700', textAlign: 'center', marginBottom: 8, color: Colors.black }}>UBICACIÓN FÍSICA DE LA PIEZA</Text>

              <View style={{ marginBottom: 8, alignItems: 'center' }}>
                <View style={{ width: containerWidth, alignItems: 'flex-start' }}>
                  <View style={{ backgroundColor: Colors.green, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                    <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular' }}>{piece.shelf}</Text>
                  </View>
                </View>
              </View>

              <View style={{ width: containerWidth, marginBottom: 6, alignSelf: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <View style={{ width: leftLabelWidth }} />
                  <View style={{ flexDirection: 'row' }}>
                    {columns.map((c, ci) => (
                      <View key={c} style={{ width: cellSize, paddingHorizontal: gap / 2, alignItems: 'center', marginRight: ci < columns.length - 1 ? gap : 0 }}>
                        <View style={{ backgroundColor: '#2F2F2F', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular', fontSize: 11 }}>{c}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View>
                {levels.map((lvl, li) => (
                  <View key={lvl} style={{ width: containerWidth, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ width: leftLabelWidth, height: cellSize, justifyContent: 'center' }}>
                      <View style={{ backgroundColor: Colors.brown, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' }}>
                        <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular', fontSize: 12 }}>{lvl}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                      {columns.map((c, ci) => {
                        const isSelected = piece.selectedLevel === li && piece.selectedColumn === ci;
                        return (
                          <View key={c} style={{ width: cellSize, paddingHorizontal: gap / 2, marginRight: ci < columns.length - 1 ? gap : 0 }}>
                            <View style={{ width: cellSize, height: cellSize, borderRadius: 6, backgroundColor: isSelected ? Colors.brown : '#EADFCB' }} />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Menciones */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontFamily: 'MateSC-Regular', fontWeight: '700', marginBottom: 8, color: Colors.black }}>MENCIONES DE LA PIEZA ARQUEOLÓGICA</Text>
              {piece.mentions?.map((m) => (
                <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F5F2', padding: 8, borderRadius: 6, marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'CrimsonText-Regular' }}>{m.title}</Text>
                  <TouchableOpacity style={{ backgroundColor: Colors.green, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }} onPress={() => console.log('Ver mención', m.id)}>
                    <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular' }}>VER</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
