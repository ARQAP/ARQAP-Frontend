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
import SimplePickerModal from "../../../components/ui/SimpleModal";
import Navbar from "../Navbar";

// --- 1. IMPORTAR HOOKS Y TIPOS ---
import { useCreateArchaeologicalSite } from "../../../hooks/useArchaeologicalsite";
import { useAllCountries } from "../../../hooks/useCountry";
import { useAllRegions } from "../../../hooks/useRegion";
import { ArchaeologicalSite } from "../../../repositories/archaeologicalsiteRepository";
import { Country } from "../../../repositories/countryRepository";
import { Region } from "../../../repositories/regionRepository";

export default function New_location() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // --- 2. ESTADO DE LOS DATOS A CREAR ---
    const [nombre, setNombre] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const [regionSearch, setRegionSearch] = useState("");
    const [selectedRegionId, setSelectedRegionId] = useState<
        number | undefined
    >(undefined);
    const [paisSearch, setPaisSearch] = useState("");
    const [selectedCountryId, setSelectedCountryId] = useState<
        number | undefined
    >(undefined);

    // Estados de UI
    const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
    const [showPaisSuggestions, setShowPaisSuggestions] = useState(false);

    // --- 3. CONEXIÓN CON LOS HOOKS DE LECTURA (Regiones y Países) ---
    const { data: allRegions = [], isLoading: regionsLoading } =
        useAllRegions();
    const { data: allCountries = [], isLoading: countriesLoading } =
        useAllCountries();

    // HOOK DE MUTACIÓN (Sitio Arqueológico)
    const { mutate, isPending: isCreating } = useCreateArchaeologicalSite();

    // --- 4. LÓGICA DE SELECCIÓN Y BÚSQUEDA ---

    useEffect(() => {
        if (!params) return;
        const p: any = params;
        const getVal = (key: string) => {
            const v = p[key];
            if (Array.isArray(v)) return v[0];
            return v;
        };

        const nombreParam = getVal("nombre");
        const ubicacionParam = getVal("ubicacion");
        const descripcionParam = getVal("descripcion");
        const regionSearchParam = getVal("regionSearch");
        const selectedRegionIdParam = getVal("selectedRegionId");
        const paisSearchParam = getVal("paisSearch");
        const selectedCountryIdParam = getVal("selectedCountryId");

        if (nombreParam) setNombre(String(nombreParam));
        if (ubicacionParam) setUbicacion(String(ubicacionParam));
        if (descripcionParam) setDescripcion(String(descripcionParam));
        if (regionSearchParam) setRegionSearch(String(regionSearchParam));
        if (selectedRegionIdParam)
            setSelectedRegionId(Number(selectedRegionIdParam));
        if (paisSearchParam) setPaisSearch(String(paisSearchParam));
        if (selectedCountryIdParam)
            setSelectedCountryId(Number(selectedCountryIdParam));
    }, [params]);

    const handleRegionSuggestionSelect = (region: Region) => {
        const regionCountryId =
            (region as any).countryId ?? (region as any).country?.id;
        if (
            selectedCountryId &&
            regionCountryId &&
            Number(selectedCountryId) !== Number(regionCountryId)
        ) {
            const message = `La región '${region.name}' pertenece a otro país. ¿Desea cambiar el país seleccionado?`;
            if (Platform.OS === "web") {
                const ok = window.confirm(message);
                if (!ok) return;
                const countryFromRegion = (region as any).country;
                if (countryFromRegion) {
                    setPaisSearch(countryFromRegion.name);
                    setSelectedCountryId(countryFromRegion.id);
                } else if (regionCountryId) {
                    const found = allCountries.find(
                        (c) => c.id === Number(regionCountryId)
                    );
                    if (found) {
                        setPaisSearch(found.name);
                        setSelectedCountryId(found.id);
                    }
                }
            } else {
                Alert.alert("País diferente", message, [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Cambiar país",
                        onPress: () => {
                            const countryFromRegion = (region as any).country;
                            if (countryFromRegion) {
                                setPaisSearch(countryFromRegion.name);
                                setSelectedCountryId(countryFromRegion.id);
                            } else if (regionCountryId) {
                                const found = allCountries.find(
                                    (c) => c.id === Number(regionCountryId)
                                );
                                if (found) {
                                    setPaisSearch(found.name);
                                    setSelectedCountryId(found.id);
                                }
                            }
                        },
                    },
                ]);
                return;
            }
        }

        setRegionSearch(region.name);
        setSelectedRegionId(region.id);
        setShowRegionSuggestions(false);
    };

    const handleClearRegionSearch = () => {
        setRegionSearch("");
        setSelectedRegionId(undefined);
        setShowRegionSuggestions(false);
    };

    const handlePaisSearchChange = (text: string) => {
        setPaisSearch(text);
        setSelectedCountryId(undefined);
        setShowPaisSuggestions(text.length > 0);
        setSelectedRegionId(undefined);
        setRegionSearch("");
    };

    const handlePaisSuggestionSelect = (country: Country) => {
        setPaisSearch(country.name);
        setSelectedCountryId(country.id);
        setShowPaisSuggestions(false);
    };

    const handleClearPaisSearch = () => {
        setPaisSearch("");
        setSelectedCountryId(undefined);
        setShowPaisSuggestions(false);
    };

    const regionItems = (
        selectedCountryId
            ? allRegions.filter(
                  (r) =>
                      ((r as any).countryId ?? (r as any).country?.id) ===
                      Number(selectedCountryId)
              )
            : allRegions
    ).map((r) => ({ value: r.id!, label: r.name, raw: r }));

    // --- 5. FUNCIÓN DE CREACIÓN CON MUTATION ---
    const handleCrear = () => {
        if (!nombre.trim() || !ubicacion.trim() || !descripcion.trim()) {
            return Alert.alert(
                "Error",
                "Debe completar Nombre, Ubicación y Descripción."
            );
        }
        if (!selectedRegionId) {
            return Alert.alert(
                "Error",
                "Debe seleccionar o buscar una Región válida."
            );
        }

        const newSite: ArchaeologicalSite = {
            Name: nombre.trim(),
            Description: descripcion.trim(),
            Location: ubicacion.trim(),
            regionId: selectedRegionId,
            region: {} as Region,
        };

        mutate(newSite, {
            onSuccess: () => {
                Alert.alert(
                    "Éxito",
                    "Sitio Arqueológico creado correctamente."
                );
                router.replace("/(tabs)/location/Location");
            },
            onError: (e) => {
                Alert.alert("Error", `Fallo al crear el sitio: ${e.message}`);
            },
        });
    };

    const handleCancelar = () => {
        router.replace("/(tabs)/location/Location");
    };

    const isButtonDisabled =
        isCreating ||
        !nombre.trim() ||
        !ubicacion.trim() ||
        !descripcion.trim() ||
        !selectedRegionId;

    return (
        <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
            <Navbar title="Nuevo Sitio Arqueológico" showBackArrow />

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
                                Nuevo Sitio Arqueológico
                            </Text>
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: "#A0785D",
                                }}
                            >
                                Ingrese los datos del nuevo sitio arqueológico
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
                                    placeholder="Nombre del sitio"
                                    value={nombre}
                                    onChangeText={setNombre}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
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
                                    Ubicación *
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
                                    placeholder="Ubicación geográfica"
                                    value={ubicacion}
                                    onChangeText={setUbicacion}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
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
                                    Descripción *
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
                                    placeholder="Descripción detallada del sitio"
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            {/* Campo País */}
                            <View style={{ marginBottom: 24 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "MateSC-Regular",
                                            fontSize: 15,
                                            color: "#8B5E3C",
                                            fontWeight: "600",
                                            flex: 1,
                                        }}
                                    >
                                        País *
                                    </Text>
                                    {countriesLoading && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#8B5E3C"
                                        />
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={() => setShowPaisSuggestions(true)}
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
                                            color: paisSearch
                                                ? "#4A3725"
                                                : "#B8967D",
                                            flex: 1,
                                        }}
                                    >
                                        {paisSearch || "Seleccionar país"}
                                    </Text>
                                    {paisSearch && (
                                        <TouchableOpacity
                                            onPress={handleClearPaisSearch}
                                            hitSlop={{
                                                top: 10,
                                                bottom: 10,
                                                left: 10,
                                                right: 10,
                                            }}
                                        >
                                            <Ionicons
                                                name="close-outline"
                                                size={20}
                                                color="#8B5E3C"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        marginTop: 8,
                                    }}
                                    onPress={() =>
                                        router.push({
                                            pathname:
                                                "/(tabs)/location/New_Country",
                                            params: {
                                                nombre,
                                                ubicacion,
                                                descripcion,
                                                regionSearch,
                                                selectedRegionId:
                                                    selectedRegionId
                                                        ? String(
                                                              selectedRegionId
                                                          )
                                                        : undefined,
                                                paisSearch,
                                                selectedCountryId:
                                                    selectedCountryId
                                                        ? String(
                                                              selectedCountryId
                                                          )
                                                        : undefined,
                                            },
                                        })
                                    }
                                >
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                            color: "#8B5E3C",
                                            marginRight: 4,
                                        }}
                                    >
                                        Crear nuevo País
                                    </Text>
                                    <Ionicons
                                        name="arrow-forward-outline"
                                        size={16}
                                        color="#8B5E3C"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Campo Región */}
                            <View style={{ marginBottom: 8 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "MateSC-Regular",
                                            fontSize: 15,
                                            color: "#8B5E3C",
                                            fontWeight: "600",
                                            flex: 1,
                                        }}
                                    >
                                        Región *
                                    </Text>
                                    {regionsLoading && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#8B5E3C"
                                        />
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        if (!selectedCountryId) {
                                            Alert.alert(
                                                "Seleccione un país",
                                                "Primero seleccione un país para ver sus regiones."
                                            );
                                            return;
                                        }
                                        setShowRegionSuggestions(true);
                                    }}
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
                                        opacity: selectedCountryId ? 1 : 0.6,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 16,
                                            color: regionSearch
                                                ? "#4A3725"
                                                : "#B8967D",
                                            flex: 1,
                                        }}
                                    >
                                        {regionSearch ||
                                            (selectedCountryId
                                                ? "Seleccionar región"
                                                : "Seleccione un país primero")}
                                    </Text>
                                    {regionSearch && (
                                        <TouchableOpacity
                                            onPress={handleClearRegionSearch}
                                            hitSlop={{
                                                top: 10,
                                                bottom: 10,
                                                left: 10,
                                                right: 10,
                                            }}
                                        >
                                            <Ionicons
                                                name="close-outline"
                                                size={20}
                                                color="#8B5E3C"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        marginTop: 8,
                                    }}
                                    onPress={() =>
                                        router.push({
                                            pathname:
                                                "/(tabs)/location/New_Region",
                                            params: {
                                                nombre,
                                                ubicacion,
                                                descripcion,
                                                regionSearch,
                                                selectedRegionId:
                                                    selectedRegionId
                                                        ? String(
                                                              selectedRegionId
                                                          )
                                                        : undefined,
                                                paisSearch,
                                                selectedCountryId:
                                                    selectedCountryId
                                                        ? String(
                                                              selectedCountryId
                                                          )
                                                        : undefined,
                                            },
                                        })
                                    }
                                >
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                            color: "#8B5E3C",
                                            marginRight: 4,
                                        }}
                                    >
                                        Crear nueva Región
                                    </Text>
                                    <Ionicons
                                        name="arrow-forward-outline"
                                        size={16}
                                        color="#8B5E3C"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Botones de Acción */}
                        <View style={{ gap: 16 }}>
                            <Button
                                title={
                                    isCreating
                                        ? "Creando Sitio..."
                                        : "Crear Sitio Arqueológico"
                                }
                                onPress={handleCrear}
                                style={{
                                    opacity: isButtonDisabled ? 0.6 : 1,
                                }}
                                textStyle={{
                                    fontFamily: "MateSC-Regular",
                                    fontWeight: "bold",
                                    fontSize: 15,
                                }}
                            />

                            <Button
                                title="Cancelar"
                                onPress={handleCancelar}
                                style={{
                                    backgroundColor: "#E5D4C1",
                                }}
                                textStyle={{
                                    fontFamily: "MateSC-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal pickers */}
            <SimplePickerModal
                visible={showRegionSuggestions}
                title="Seleccionar Región"
                items={regionItems}
                selectedValue={selectedRegionId ?? null}
                onSelect={(value) => {
                    const sel = allRegions.find((r) => r.id === Number(value));
                    if (sel) handleRegionSuggestionSelect(sel);
                    setShowRegionSuggestions(false);
                }}
                onClose={() => setShowRegionSuggestions(false)}
            />

            <SimplePickerModal
                visible={showPaisSuggestions}
                title="Seleccionar País"
                items={allCountries.map((c) => ({
                    value: c.id!,
                    label: c.name,
                    raw: c,
                }))}
                selectedValue={selectedCountryId ?? null}
                onSelect={(value) => {
                    const sel = allCountries.find(
                        (c) => c.id === Number(value)
                    );
                    if (sel) handlePaisSuggestionSelect(sel);
                    setShowPaisSuggestions(false);
                }}
                onClose={() => setShowPaisSuggestions(false)}
            />
        </View>
    );
}
