import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image, Platform, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Navbar from '../Navbar';
import Button from '../../../components/ui/Button';
import Colors from '../../../constants/Colors';

export default function EditPiece() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = (params as any)?.id as string | undefined;

  // form state (same as New_piece)
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('');
  const [observation, setObservation] = useState('');
  const [available, setAvailable] = useState(true);
  const [classifier, setClassifier] = useState('INAPL');
  const [color, setColor] = useState('');
  const [collection, setCollection] = useState('');
  const [archaeologist, setArchaeologist] = useState('');
  const [site, setSite] = useState('');
  const [shelf, setShelf] = useState('07');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(2);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(2);

  const columns = ['COLUMNA A', 'COLUMNA B', 'COLUMNA C', 'COLUMNA D'];
  const levels = ['NIVEL 1', 'NIVEL 2', 'NIVEL 3', 'NIVEL 4'];
  const { width: windowWidth } = useWindowDimensions();

  // layout tuning (copy from New_piece)
  const horizontalPadding = 48;
  const containerMaxWidth = 720;
  const leftLabelWidth = 64;
  const gap = 8;
  const containerWidth = Math.min(windowWidth - horizontalPadding, containerMaxWidth);
  const availableWidthForCells = Math.max(0, containerWidth - leftLabelWidth - gap * (columns.length - 1));
  const rawCellSize = Math.floor(availableWidthForCells / columns.length);
  const cellSize = Math.max(56, Math.min(rawCellSize, 110));

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const fileInputRef = useRef<any>(null);
  const fileInputRef2 = useRef<any>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  // mentions state
  const [mentionName, setMentionName] = useState('');
  const [mentionLink, setMentionLink] = useState('');
  const [mentionDescription, setMentionDescription] = useState('');
  const [mentions, setMentions] = useState<Array<{ id: number; name: string; link: string; description: string }>>([]);

  // simple mock load when id provided (in a real app fetch from API)
  useEffect(() => {
    if (!id) return;
    // mock prefill
    const mock = {
      name: 'Vasija fragmentada',
      material: 'Cerámica',
      observation: 'Fragmento Hallado en sector norte',
      available: true,
      classifier: 'INAPL',
      color: 'Terracota',
      collection: 'Colección Museo',
      archaeologist: 'Dr. Perez',
      site: 'Sitio A',
      shelf: '07',
      selectedLevel: 1,
      selectedColumn: 0,
    } as any;

    setName(mock.name);
    setMaterial(mock.material);
    setObservation(mock.observation);
    setAvailable(mock.available);
    setClassifier(mock.classifier);
    setColor(mock.color);
    setCollection(mock.collection);
    setArchaeologist(mock.archaeologist);
    setSite(mock.site);
    setShelf(mock.shelf);
    setSelectedLevel(mock.selectedLevel);
    setSelectedColumn(mock.selectedColumn);
  }, [id]);

  function handleSave() {
    const payload = {
      id,
      name,
      material,
      observation,
      available,
      classifier,
      color,
      collection,
      archaeologist,
      site,
      shelf,
      photoUri,
      location: {
        level: selectedLevel != null ? levels[selectedLevel] : null,
        column: selectedColumn != null ? columns[selectedColumn] : null,
        shelf: `ESTANTERIA ${shelf}`,
      },
    };
    console.log('Updating piece', payload);
    // TODO: call API to update
    // navigate back to list
    router.back();
  }

  async function pickImage() {
    try {
      if (Platform.OS === 'web') {
        fileInputRef.current?.click?.();
        return;
      }

      let ImagePicker: any;
      try {
        // @ts-ignore
        ImagePicker = await import('expo-image-picker');
      } catch (e) {
        Alert.alert('Dependencia faltante', 'Instale `expo-image-picker` para seleccionar imágenes en el dispositivo móvil');
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a las fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      // @ts-ignore
      const uri = result?.assets?.[0]?.uri ?? (result as any)?.uri ?? null;
      if (uri) setPhotoUri(uri);
    } catch (err) {
      console.warn('Error picking image', err);
    }
  }

  function handleWebFile(e: any) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUri(url);
  }

  async function pickFile() {
    try {
      if (Platform.OS === 'web') {
        fileInputRef2.current?.click?.();
        return;
      }

      let DocumentPicker: any;
      try {
        // @ts-ignore
        DocumentPicker = await import('expo-document-picker');
      } catch (e) {
        console.warn('expo-document-picker not installed, falling back to image picker');
        await pickImage();
        return;
      }

      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (res.type === 'success') {
        setFileUri(res.uri);
        setFileName(res.name || null);
      }
    } catch (err) {
      console.warn('Error picking file', err);
    }
  }

  function handleWebFile2(e: any) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileUri(url);
    setFileName(file.name || 'archivo');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3E9DD' }}>
      <Navbar title="Editar pieza arqueologica" showBackArrow backToHome />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8, fontFamily: 'MateSC-Regular', color: Colors.black }}>Edite los datos de la pieza arqueológica</Text>

        <View style={{ flexDirection: windowWidth < 520 ? 'column' : 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Nombre</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Nombre" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontFamily: 'CrimsonText-Regular', color: Colors.black }} />
          </View>

          <View style={{ flex: 1, width: windowWidth < 520 ? '100%' : undefined }}>
            <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Material</Text>
            <TextInput value={material} onChangeText={setMaterial} placeholder="Material" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontFamily: 'CrimsonText-Regular', color: Colors.black }} />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Observación</Text>
          <TextInput multiline value={observation} onChangeText={setObservation} placeholder="Observación de la pieza" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, minHeight: 80, fontFamily: 'CrimsonText-Regular', color: Colors.black }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', fontFamily: 'MateSC-Regular', color: Colors.black }}>Disponible</Text>
          <Switch value={available} onValueChange={setAvailable} />
        </View>

        <View style={{ flexDirection: windowWidth < 520 ? 'column' : 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Clasificador</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8 }}>
              <Text style={{ fontFamily: 'CrimsonText-Regular', color: Colors.black }}>{classifier}</Text>
            </View>
          </View>
          <View style={{ flex: 1, width: windowWidth < 520 ? '100%' : undefined }}>
            <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Color</Text>
            <TextInput value={color} onChangeText={setColor} placeholder="Seleccione el color" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontFamily: 'CrimsonText-Regular', color: Colors.black }} />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Foto</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={pickImage} style={{ width: 96, height: 96, backgroundColor: '#FFF', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDD' }}>
              {photoUri ? (
                // @ts-ignore
                <Image source={{ uri: photoUri }} style={{ width: 92, height: 92, borderRadius: 6 }} />
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.green, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontFamily: 'CrimsonText-Regular' }}>SUBIR IMAGEN</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickFile} style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.brown, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontFamily: 'CrimsonText-Regular' }}>SUBIR FICHA</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              // hidden file inputs for web
              <>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWebFile} />
                <input ref={fileInputRef2} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleWebFile2} />
              </>
            )}
          </View>
          {fileName ? (
            <Text style={{ marginTop: 8, fontFamily: 'CrimsonText-Regular', color: Colors.black }}>Archivo: {fileName}</Text>
          ) : null}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Descripción</Text>
          <TextInput multiline placeholder="Descripción detallada de la pieza" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, minHeight: 100, fontFamily: 'CrimsonText-Regular', color: Colors.black }} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Asociar pieza a una colección</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8 }}>
            <Text>Sin Colección</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Asociar pieza a un arqueólogo</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8 }}>
            <Text>Seleccionar Arqueólogo</Text>
          </View>
        </View>

        <View style={{ flexDirection: windowWidth < 520 ? 'column' : 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Asociar pieza a un sitio arqueológico</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8 }}>
              <Text>Seleccionar sitio</Text>
            </View>
          </View>
          <View style={{ width: windowWidth < 520 ? '100%' : 100 }}>
            <Text style={{ fontWeight: '700', marginBottom: 6, fontFamily: 'MateSC-Regular', color: Colors.black }}>Estantería</Text>
            <TextInput value={shelf} onChangeText={setShelf} style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, fontFamily: 'CrimsonText-Regular', color: Colors.black }} />
          </View>
        </View>

        {/* Ubicación física de la pieza */}
  <View style={{ marginBottom: 8, backgroundColor: '#fff', padding: 8, borderRadius: 6 }}>
          <Text style={{ fontFamily: 'MateSC-Regular', fontWeight: '700', textAlign: 'center', marginBottom: 8, color: Colors.black }}>UBICACIÓN FÍSICA DE LA PIEZA</Text>

          <View style={{ marginBottom: 8, alignItems: 'center' }}>
            <View style={{ width: containerWidth, alignItems: 'flex-start' }}>
              <View style={{ backgroundColor: Colors.green, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular' }}>ESTANTERIA {shelf}</Text>
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
                    const isSelected = selectedLevel === li && selectedColumn === ci;
                    return (
                      <View key={c} style={{ width: cellSize, paddingHorizontal: gap / 2, marginRight: ci < columns.length - 1 ? gap : 0 }}>
                        <TouchableOpacity onPress={() => { setSelectedLevel(li); setSelectedColumn(ci); }} style={{ width: cellSize, height: cellSize, borderRadius: 6, backgroundColor: isSelected ? Colors.brown : '#EADFCB' }} />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Menciones: formulario para agregar + lista */}
        <View style={{ marginTop: 16, backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontFamily: 'MateSC-Regular', fontWeight: '700', marginBottom: 8, color: Colors.black }}>MENCIONES DE LA PIEZA ARQUEOLÓGICA (OPCIONAL)</Text>

          {/* inputs: nombre + enlace */}
          {/** Stack vertically on small screens to avoid layout breakage **/}
          <View style={{ flexDirection: windowWidth < 520 ? 'column' : 'row', gap: 12, marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'MateSC-Regular', color: Colors.black, marginBottom: 6 }}>NOMBRE</Text>
              <TextInput value={mentionName} onChangeText={setMentionName} placeholder="Nombre" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: '#E6DAC4' }} />
            </View>
            <View style={{ width: windowWidth < 520 ? '100%' : 200 }}>
              <Text style={{ fontFamily: 'MateSC-Regular', color: Colors.black, marginBottom: 6 }}>ENLACE</Text>
              <TextInput value={mentionLink} onChangeText={setMentionLink} placeholder="Enlace" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: '#E6DAC4' }} />
            </View>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: 'MateSC-Regular', color: Colors.black, marginBottom: 6 }}>DESCRIPCIÓN</Text>
            <TextInput multiline value={mentionDescription} onChangeText={setMentionDescription} placeholder="Descripción" style={{ backgroundColor: '#fff', borderRadius: 6, padding: 8, minHeight: 80, borderWidth: 1, borderColor: '#E6DAC4' }} />
          </View>

          <View style={{ alignItems: 'flex-end', marginBottom: 12 }}>
            <TouchableOpacity
              style={{ backgroundColor: Colors.green, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
              onPress={() => {
                const name = mentionName.trim();
                const link = mentionLink.trim();
                const desc = mentionDescription.trim();
                if (!name && !link) return;
                const m = { id: Date.now(), name, link, description: desc };
                setMentions((prev) => [m, ...prev]);
                setMentionName('');
                setMentionLink('');
                setMentionDescription('');
              }}
            >
              <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular' }}>AGREGAR MENCIÓN</Text>
            </TouchableOpacity>
          </View>

          {/* tabla/lista de menciones */}
          <View style={{ borderWidth: 1, borderColor: '#E6DAC4', borderRadius: 8, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#EADFCB', padding: 8 }}>
              <Text style={{ flex: 2, fontFamily: 'MateSC-Regular' }}>NOMBRE</Text>
              <Text style={{ flex: 2, fontFamily: 'MateSC-Regular' }}>ENLACE</Text>
              <Text style={{ flex: 3, fontFamily: 'MateSC-Regular' }}>DESCRIPCIÓN</Text>
              <Text style={{ width: 80, textAlign: 'center', fontFamily: 'MateSC-Regular' }}>ACCIONES</Text>
            </View>
            {mentions.length === 0 ? (
              <View style={{ padding: 12 }}>
                <Text style={{ fontFamily: 'CrimsonText-Regular', color: Colors.black }}>No hay menciones agregadas.</Text>
              </View>
            ) : (
              mentions.map((m) => (
                <View key={m.id} style={{ flexDirection: 'row', padding: 8, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0E6DB' }}>
                  <Text style={{ flex: 2, fontFamily: 'CrimsonText-Regular' }}>{m.name}</Text>
                  <Text style={{ flex: 2, fontFamily: 'CrimsonText-Regular', color: '#2B6CB0' }}>{m.link}</Text>
                  <Text style={{ flex: 3, fontFamily: 'CrimsonText-Regular' }}>{m.description}</Text>
                  <View style={{ width: 80, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setMentions((prev) => prev.filter((x) => x.id !== m.id))} style={{ padding: 6, backgroundColor: '#F3D6C1', borderRadius: 6 }}>
                      <Text style={{ fontFamily: 'CrimsonText-Regular' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* botón Guardar debajo de las menciones */}
        <View style={{ marginTop: 12 }}>
          <Button title="Guardar cambios" onPress={handleSave} className="bg-[#6B705C] rounded-lg py-3 items-center" textClassName="text-white" />
        </View>
      </ScrollView>
    </View>
  );
}
