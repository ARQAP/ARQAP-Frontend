import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Button from "../../../components/ui/Button";
import SimplePickerModal from "../../../components/ui/SimpleModal";
import Navbar from "../Navbar";
// --- Importar Hooks y Tipos ---
import Colors from "@/constants/Colors";
import { useUpdateArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
import { useAllCountries } from "../../../hooks/useCountry";
import { useAllRegions } from "../../../hooks/useRegion";
import { ArchaeologicalSite } from "../../../repositories/archaeologicalsiteRepository";
import { Country } from "../../../repositories/countryRepository";
import { Region } from "../../../repositories/regionRepository";

interface InputPosition { x: number; y: number; width: number; height: number; }

export default function EditSite() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // --- ESTADO INICIAL ---
    const id = Array.isArray(params.id) ? params.id[0] : params.id || "";
    const siteId = id ? parseInt(id, 10) : undefined;

    const [name, setName] = useState(Array.isArray(params.name) ? params.name[0] : params.name || "");
    const [ubicacion, setUbicacion] = useState(Array.isArray(params.location) ? params.location[0] : params.location || "");
    const [descripcion, setDescription] = useState(Array.isArray(params.description) ? params.description[0] : params.description || "");

    const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
    const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);

    // Los valores de búsqueda inician con el nombre actual (para visualización)
    const [regionSearch, setRegionSearch] = useState(Array.isArray(params.regionName) ? params.regionName[0] : params.regionName || "");
    const [paisSearch, setPaisSearch] = useState(Array.isArray(params.countryName) ? params.countryName[0] : params.countryName || ""); 

    const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
    const [showPaisSuggestions, setShowPaisSuggestions] = useState(false);
    const [regionInputPosition, setRegionInputPosition] = useState<InputPosition>({ x: 0, y: 0, width: 0, height: 0 });
    const [paisInputPosition, setPaisInputPosition] = useState<InputPosition>({ x: 0, y: 0, width: 0, height: 0 });

    // --- HOOKS ---
    const { mutate, isPending: isUpdating } = useUpdateArchaeologicalSite();
    const { data: allRegions = [], isLoading: isRegionsLoading } = useAllRegions();
    const { data: allCountries = [], isLoading: isCountriesLoading } = useAllCountries();

    // --- LÓGICA DE SELECCIÓN ---
    const handleRegionSuggestionSelect = (region: Region) => {
        setRegionSearch(region.name);
        setSelectedRegionId(region.id);
        setShowRegionSuggestions(false);
    };
    
    const handlePaisSuggestionSelect = (country: Country) => {
        setPaisSearch(country.name);
        setSelectedCountryId(country.id);
        setShowPaisSuggestions(false);
    };

    // --- NUEVAS FUNCIONES PARA LIMPIAR LA SELECCIÓN ---
    const handleClearRegion = () => {
        setRegionSearch(""); // Limpia el campo de búsqueda
        setSelectedRegionId(undefined); // Deselecciona el ID
        setShowRegionSuggestions(true); // Mostrar sugerencias inmediatamente para que el usuario pueda escribir
    }

    const handleClearCountry = () => {
        setPaisSearch("");
        setSelectedCountryId(undefined);
        setShowPaisSuggestions(true);
    }
    // --------------------------------------------------

    const regionSuggestions = regionSearch.length > 0
        ? allRegions.filter((r: Region) => r.name.toLowerCase().includes(regionSearch.toLowerCase())).slice(0, 5)
        : [];
    const paisSuggestions = paisSearch.length > 0
        ? allCountries.filter((c: Country) => c.name.toLowerCase().includes(paisSearch.toLowerCase())).slice(0, 5)
        : [];
    
    // --- COMPONENTE SIMPLESELECTROW (Ahora utilizado en SelectionGroup) ---
    const SimpleSelectRow = ({
        label,
        value,
        onPress,
        subdued,
    }: {
        label: string;
        value?: string | null;
        onPress?: () => void;
        subdued?: boolean;
    }) => (
        <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        // Estilos para resaltar la selección y permitir "Limpiar"
        style={{ backgroundColor: subdued ? "#E6DAC4" : "#fff", borderRadius: 6, padding: 10, borderWidth: 1, borderColor: "#A67C52" }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: "CrimsonText-Regular", color: Colors.black, flexShrink: 1 }}>{value || label}</Text>
                {/* Mostrar un indicador de limpieza si hay un onPress */}
                {onPress && (
                    <Text style={{ fontFamily: "MateSC-Regular", color: Colors.black, fontWeight: 'bold', marginLeft: 10 }}>✕ Limpiar</Text>
                )}
            </View>
        </TouchableOpacity>
    );
    // ----------------------------------------------------------------------
    
    // --- EFECTO PARA INICIALIZAR LOS IDs (Crucial para Edición) ---
    useEffect(() => {
        if (!isRegionsLoading && regionSearch && selectedRegionId === undefined) {
            const initialRegion = allRegions.find(r => r.name === regionSearch);
            if (initialRegion) setSelectedRegionId(initialRegion.id);
        }
        if (!isCountriesLoading && paisSearch && selectedCountryId === undefined) {
            const initialCountry = allCountries.find(c => c.name === paisSearch);
            if (initialCountry) setSelectedCountryId(initialCountry.id);
        }
    }, [isRegionsLoading, isCountriesLoading, regionSearch, paisSearch, allRegions, allCountries, selectedRegionId, selectedCountryId]);


    // --- LÓGICA DE ACTUALIZACIÓN (handleSave) ---
    const handleSave = () => {
        if (!siteId) return Alert.alert("Error", "ID del sitio no encontrado.");
        if (selectedRegionId === undefined || selectedCountryId === undefined) {
            return Alert.alert("Error", "Debe seleccionar una Región y un País válidos.");
        }

        const updatedSitePayload: ArchaeologicalSite = {
            Name: name.trim(),
            Description: descripcion.trim(),
            Location: ubicacion.trim(), 
            regionId: selectedRegionId,
            // Nota: region y country (si estuviera) no se envían al backend
            // El `region: {} as Region` es un workaround de TypeScript en el frontend
            region: {} as Region, 
        };

        mutate({ id: siteId, payload: updatedSitePayload }, {
            onSuccess: () => {
                Alert.alert("Éxito", "Sitio actualizado correctamente.");
                // Asumiendo que esta es la ruta de navegación correcta
                router.push("/(tabs)/location/Location"); 
            },
            onError: (e: any) => {
                Alert.alert("Error", `Fallo al actualizar: ${e.message}`);
            }
        });
    };

    const handleCancel = () => { router.back(); };
    const isFormLoading = isRegionsLoading || isCountriesLoading;
    // Si no hay IDs seleccionados, deshabilitar el guardado
    const isSaveDisabled = isUpdating || isFormLoading || selectedRegionId === undefined || selectedCountryId === undefined;


    return (
        <View className="flex-1 bg-[#F3E9DD]">
            <Navbar title="Editar Sitio Arqueológico" showBackArrow />
            <ScrollView
                className="flex-1 px-5 pt-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-[#3d2c13] text-center mb-2" style={{ fontFamily: "MateSC-Regular" }}>
                        {name}
                    </Text>
                    <View className="h-1 bg-[#A67C52] mx-auto w-32 rounded-full" />
                </View>

                <View className="space-y-5">
                    
                    {/* NOMBRE DEL SITIO */}
                    <InputGroup label="NOMBRE DEL SITIO" value={name} onChangeText={setName} editable={!isUpdating} />
                    
                    {/* UBICACIÓN */}
                    <InputGroup label="UBICACIÓN" value={ubicacion} onChangeText={setUbicacion} editable={!isUpdating} />

                    {/* SELECTOR DE REGIÓN */}
                    <SelectionGroup 
                        label="REGIÓN"
                        searchTerm={regionSearch}
                        setSearchTerm={setRegionSearch}
                        selectedId={selectedRegionId}
                        isLoading={isRegionsLoading}
                        placeholder="Buscar o seleccionar Región"
                        isUpdating={isUpdating}
                        setShowSuggestions={setShowRegionSuggestions}
                        setContainerLayout={setRegionInputPosition}
                        onClearSelection={handleClearRegion} // NUEVO: Función para limpiar
                        suggestionData={allRegions} // NUEVO: Datos para validar la selección
                        SimpleSelectRow={SimpleSelectRow} // PASAMOS EL COMPONENTE
                        onPick={handleRegionSuggestionSelect}
                    />

                    {/* SELECTOR DE PAÍS */}
                    <SelectionGroup 
                        label="PAÍS"
                        searchTerm={paisSearch}
                        setSearchTerm={setPaisSearch}
                        selectedId={selectedCountryId}
                        isLoading={isCountriesLoading}
                        placeholder="Buscar o seleccionar País"
                        isUpdating={isUpdating}
                        setShowSuggestions={setShowPaisSuggestions}
                        setContainerLayout={setPaisInputPosition}
                        onClearSelection={handleClearCountry} // NUEVO: Función para limpiar
                        suggestionData={allCountries} // NUEVO: Datos para validar la selección
                        SimpleSelectRow={SimpleSelectRow} // PASAMOS EL COMPONENTE
                        onPick={handlePaisSuggestionSelect}
                    />
                    
                    {/* DESCRIPCIÓN */}
                    <InputGroup 
                        label="DESCRIPCIÓN" 
                        value={descripcion} 
                        onChangeText={setDescription} 
                        editable={!isUpdating} 
                        multiline={true} 
                        numberOfLines={5} 
                        minHeight={120}
                    />
                </View>

                {/* BOTONES */}
                <View className="mt-8">
                    <Button
                        title={isUpdating ? "Guardando..." : "Guardar Cambios"}
                        onPress={handleSave}
                        className={`rounded-lg py-4 items-center ${isSaveDisabled ? 'bg-[#9C9A8A]' : 'bg-[#6B705C]'}`}
                        textClassName="text-[16px] font-bold text-white"
                        textStyle={{ fontFamily: "MateSC-Regular" }}
                    />
                    <View style={{ marginTop: 24 }}>
                        <Button
                            title="Cancelar"
                            onPress={handleCancel}
                            className="bg-[#D9C6A5] rounded-lg py-3 items-center mb-4"
                            textClassName="text-[16px] font-bold text-white"
                            textStyle={{ fontFamily: "MateSC-Regular" }}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Bloques de sugerencias flotantes (DEBEN estar fuera del ScrollView) */}
            {showRegionSuggestions && <SuggestionBlock 
                inputPosition={regionInputPosition} 
                suggestions={regionSuggestions} 
                onSelect={handleRegionSuggestionSelect} 
                isCountry={false}
            />}
            {showPaisSuggestions && <SuggestionBlock 
                inputPosition={paisInputPosition} 
                suggestions={paisSuggestions} 
                onSelect={handlePaisSuggestionSelect} 
                isCountry={true}
            />}
        </View>
    );
}

// --- COMPONENTES AUXILIARES DE DISEÑO ---

// 1. Componente para campos de texto simples
const InputGroup = ({ label, value, onChangeText, editable, multiline = false, numberOfLines, minHeight = 0 }: any) => (
    <View className="mb-4">
        <Text className="text-[16px] font-bold mb-2 text-[#3d2c13]" style={{ fontFamily: "MateSC-Regular" }}>{label}</Text>
        <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-[16px] w-full"
            style={{ fontFamily: "CrimsonText-Regular", backgroundColor: "#F7F5F2", minHeight, textAlignVertical: multiline ? "top" : "center" }}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            placeholderTextColor="#A68B5B"
            selectionColor="#8B5E3C"
        />
    </View>
);

// 2. Componente de bloque de selección con búsqueda (ACTUALIZADO PARA USAR SimpleSelectRow)
const SelectionGroup = ({ 
    label, 
    searchTerm, 
    setSearchTerm, 
    selectedId, 
    isLoading, 
    isUpdating, 
    placeholder, 
    setContainerLayout, 
    setShowSuggestions, 
    onClearSelection, // NUEVO
    suggestionData, // NUEVO
    SimpleSelectRow, // PASADO COMO PROP DESDE EditSite
    onPick // function to call when an item is picked from modal
}: any) => {

    // Lógica para determinar si el item está seleccionado y su nombre coincide con la búsqueda
    const selectedItem = suggestionData.find((item: any) => item.id === selectedId);
    const isItemSelected = selectedId !== undefined && selectedItem?.name === searchTerm;
    const [pickerOpen, setPickerOpen] = useState(false);

    const items = suggestionData.map((s: any) => ({ value: s.id, label: s.name, raw: s }));

    return (
        <View className="mb-4">
            <Text className="text-[16px] font-bold mb-2 text-[#3d2c13]" style={{ fontFamily: "MateSC-Regular" }}>
                {label} 
                {/* Indicador visual de estado actual */}
                {selectedId ? (
                    <Text className="text-[14px] text-green-600 font-normal ml-2"> (Asignado)</Text>
                ) : (
                    <Text className="text-[14px] text-red-600 font-normal ml-2"> (Requerido)</Text>
                )}
                {isLoading && <ActivityIndicator size="small" color="#A68B5B" className="ml-2" />}
            </Text>

            {isItemSelected ? (
                <SimpleSelectRow 
                    label={`Selección actual: ${searchTerm}`} 
                    value={searchTerm} 
                    onPress={onClearSelection} // Permite al usuario "Limpiar" la selección
                    subdued={true}
                />
            ) : (
                <TouchableOpacity
                    onPress={() => setPickerOpen(true)}
                    style={{ borderWidth: 2, borderColor: '#A67C52', borderRadius: 8, padding: 12, backgroundColor: '#F7F5F2' }}
                    disabled={isUpdating}
                >
                    <Text style={{ fontFamily: 'CrimsonText-Regular', color: '#3d2c13' }}>{searchTerm || placeholder}</Text>
                </TouchableOpacity>
            )}

            <SimplePickerModal
                visible={pickerOpen}
                title={label}
                items={items}
                selectedValue={selectedId ?? null}
                onSelect={(value) => {
                    const sel = suggestionData.find((s: any) => s.id === Number(value));
                    if (sel) {
                        setSearchTerm(sel.name);
                        if (onPick) onPick(sel);
                    }
                    setPickerOpen(false);
                    setShowSuggestions(false);
                }}
                onClose={() => setPickerOpen(false)}
            />
        </View>
    );
};

// 3. Bloque de sugerencias flotante
const SuggestionBlock = ({ inputPosition, suggestions, onSelect, isCountry }: any) => (
    <View
        className="absolute bg-white border-2 border-[#A67C52] rounded-lg shadow-lg max-h-[200px] w-full"
        style={{
            top: inputPosition.y + inputPosition.height + 5,
            left: inputPosition.x,
            // Ajuste el 'right' para que el bloque de sugerencias ocupe todo el ancho
            // Asumiendo que el componente padre (View className="flex-1 bg-[#F3E9DD]")
            // contiene el scrollview con padding. Se ajusta con 'right: 20' (20px de padding derecho)
            // Esto es una simplificación, en React Native la posición absoluta puede ser tricky.
            // Lo más seguro es usar el ancho (width) del inputPosition si estuviera disponible,
            // pero 'right: 0' y 'left: 0' dentro de un contenedor relativo es más común.
            // Aquí lo dejamos en 'right: 0' que suele funcionar en contenedores anclados.
            right: 0, 
            zIndex: 99999,
            elevation: 50,
        }}
    >
        <ScrollView nestedScrollEnabled>
            {suggestions.map((item: Country | Region, index: number) => (
                <TouchableOpacity
                    key={item.id || index}
                    className="p-3 border-b border-[#E2D1B2]"
                    onPress={() => onSelect(item)}
                >
                    <Text className="text-[16px] text-[#3d2c13]" style={{ fontFamily: "CrimsonText-Regular" }}>
                        {item.name}
                    </Text>
                    <Text className="text-[12px] text-[#A68B5B]">ID: {item.id}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);