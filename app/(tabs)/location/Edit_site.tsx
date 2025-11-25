import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Button from "../../../components/ui/Button";
import SimplePickerModal, { SimplePickerItem } from "../../../components/ui/SimpleModal";
import { useAllArchaeologicalSites, useUpdateArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
import { useAllCountries } from "../../../hooks/useCountry";
import { useAllRegions } from "../../../hooks/useRegion";
import Navbar from "../Navbar";
import Colors from "@/constants/Colors";

export default function EditSite() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [countryId, setCountryId] = useState<number | null>(null);
    const [regionId, setRegionId] = useState<number | null>(null);
    const [countryPickerOpen, setCountryPickerOpen] = useState(false);
    const [regionPickerOpen, setRegionPickerOpen] = useState(false);
    
    const { data: sites = [], isLoading: sitesLoading, refetch } = useAllArchaeologicalSites();
    const { data: regions = [], isLoading: regionsLoading } = useAllRegions();
    const { data: countries = [], isLoading: countriesLoading } = useAllCountries();
    const updateMutation = useUpdateArchaeologicalSite();

    // Cargar datos del sitio arqueológico
    useEffect(() => {
        const site = sites.find(s => s.id === id);
        if (site) {
            setName(site.Name);
            setDescription(site.Description || "");
            setLocation(site.Location || "");
            setRegionId(site.regionId || null);
            setCountryId(site.region?.countryId || null);
        }
    }, [sites, id]);

    // Preparar items para el picker de países
    const countryItems: SimplePickerItem<any>[] = countries.map(country => ({
        value: country.id ?? 0,
        label: country.name,
        raw: country,
    }));

    // Filtrar regiones por país seleccionado
    const filteredRegions = countryId
        ? regions.filter(region => region.countryId === countryId)
        : regions;

    // Preparar items para el picker de regiones
    const regionItems: SimplePickerItem<any>[] = filteredRegions.map(region => ({
        value: region.id ?? 0,
        label: region.name,
        raw: region,
    }));

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Error", "El nombre es obligatorio.");
            return;
        }

        if (!regionId) {
            Alert.alert("Error", "Debe seleccionar una región.");
            return;
        }

        const selectedRegionData = regions.find(r => r.id === regionId);
        if (!selectedRegionData) {
            Alert.alert("Error", "Región no válida.");
            return;
        }

        updateMutation.mutate(
            {
                id,
                payload: {
                    Name: name.trim(),
                    Description: description.trim() || "",
                    Location: location.trim() || "",
                    regionId: regionId,
                    region: selectedRegionData,
                },
            },
            {
                onSuccess: async () => {
                    await refetch();
                    Alert.alert("Éxito", "Sitio arqueológico actualizado correctamente.");
                    router.back();
                },
                onError: (error: any) => {
                    const errorMessage = error?.message || "Error al actualizar el sitio arqueológico.";
                    Alert.alert("Error", errorMessage);
                },
            }
        );
    };

    const handleCancel = () => {
        router.back();
    };

    const isLoading = sitesLoading || regionsLoading || countriesLoading;

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F3E9DD", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#8B5E3C" />
            </View>
        );
    }

    const isSaveDisabled = updateMutation.isPending || !name.trim() || !regionId;

    const selectedCountry = countries.find(c => c.id === countryId);
    const selectedRegion = regions.find(r => r.id === regionId);

    return (
        <View style={{ flex: 1, backgroundColor: Colors.cream }}>
            <Navbar
                title="Editar Sitio Arqueológico"
                showBackArrow
                backToHome={false}
            />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: Platform.OS === "web" ? 32 : 20,
                        paddingTop: Platform.OS === "web" ? 40 : 20,
                        paddingBottom: Platform.OS === "web" ? 32 : 20,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={{
                            width: "100%",
                            maxWidth: 800,
                            alignSelf: "center",
                        }}
                    >
                        {/* Encabezado */}
                        <View
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: 16,
                                padding: 28,
                                marginBottom: 32,
                                shadowColor: "#8B5E3C",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 3,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 28,
                                    color: "#8B5E3C",
                                    marginBottom: 8,
                                    fontWeight: "600",
                                }}
                            >
                                Editar Sitio Arqueológico
                            </Text>
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: "#A0785D",
                                }}
                            >
                                Modifique los datos del sitio arqueológico
                            </Text>
                        </View>

                        {/* Formulario */}
                        <View
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: 16,
                                padding: 24,
                                marginBottom: 24,
                                shadowColor: "#8B5E3C",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 3,
                            }}
                        >
                            {/* Campo Nombre */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Nombre *
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                    placeholder="Nombre del sitio arqueológico"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    editable={!updateMutation.isPending}
                                />
                            </View>

                            {/* Campo Descripción */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Descripción
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                        minHeight: 120,
                                        textAlignVertical: "top",
                                    }}
                                    placeholder="Descripción detallada del sitio arqueológico"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    multiline
                                    numberOfLines={5}
                                    editable={!updateMutation.isPending}
                                />
                            </View>

                            {/* Campo Ubicación */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Ubicación
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                    placeholder="Ubicación geográfica del sitio"
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    editable={!updateMutation.isPending}
                                />
                            </View>

                            {/* Campo País */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    País *
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setCountryPickerOpen(true)}
                                    disabled={updateMutation.isPending}
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 16,
                                            color: selectedCountry ? "#4A3725" : "#B8967D",
                                            flex: 1,
                                        }}
                                    >
                                        {selectedCountry?.name || "Seleccionar país"}
                                    </Text>
                                    <Ionicons
                                        name="chevron-down"
                                        size={20}
                                        color="#8B5E3C"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Campo Región */}
                            <View style={{ marginBottom: 8 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Región *
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setRegionPickerOpen(true)}
                                    disabled={updateMutation.isPending || !countryId}
                                    style={{
                                        backgroundColor: !countryId ? "#EFEFEF" : "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: "#E5D4C1",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        opacity: !countryId ? 0.5 : 1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 16,
                                            color: selectedRegion ? "#4A3725" : "#B8967D",
                                            flex: 1,
                                        }}
                                    >
                                        {selectedRegion?.name || (countryId ? "Seleccionar región" : "Primero seleccione un país")}
                                    </Text>
                                    <Ionicons
                                        name="chevron-down"
                                        size={20}
                                        color="#8B5E3C"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Botones de Acción */}
                        <View style={{ marginTop: 8 }}>
                            <Button
                                title={updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                                onPress={handleSave}
                                className={`rounded-lg py-4 items-center mb-4 ${isSaveDisabled ? 'bg-[#9C9A8A]' : 'bg-[#6B705C]'}`}
                                textClassName="text-[16px] font-bold text-white"
                                textStyle={{ fontFamily: "MateSC-Regular" }}
                            />
                            
                            <Button
                                title="Cancelar"
                                onPress={handleCancel}
                                className="bg-[#E5D4C1] rounded-lg py-4 items-center"
                                textClassName="text-[16px] font-bold text-[#8B5E3C]"
                                textStyle={{ fontFamily: "MateSC-Regular" }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal para seleccionar país */}
            <SimplePickerModal
                visible={countryPickerOpen}
                title="Seleccionar País"
                items={countryItems}
                selectedValue={countryId ?? ""}
                onSelect={(value) => {
                    const newCountryId = Number(value);
                    setCountryId(newCountryId);
                    // Limpiar la región si cambia el país
                    if (countryId !== newCountryId) {
                        setRegionId(null);
                    }
                    setCountryPickerOpen(false);
                }}
                onClose={() => setCountryPickerOpen(false)}
            />

            {/* Modal para seleccionar región */}
            <SimplePickerModal
                visible={regionPickerOpen}
                title="Seleccionar Región"
                items={regionItems}
                selectedValue={regionId ?? ""}
                onSelect={(value) => {
                    setRegionId(Number(value));
                    setRegionPickerOpen(false);
                }}
                onClose={() => setRegionPickerOpen(false)}
            />
        </View>
    );
}