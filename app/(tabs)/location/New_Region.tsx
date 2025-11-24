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
import Navbar from "../Navbar";

// --- Importar Hooks y Tipos ---
import SimplePickerModal, {
    SimplePickerItem,
} from "../../../components/ui/SimpleModal";
import { useAllCountries } from "../../../hooks/useCountry";
import { useCreateRegion } from "../../../hooks/useRegion";
import { Country } from "../../../repositories/countryRepository";
import { CreateRegionPayload } from "../../../repositories/regionRepository";

export default function New_Region() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // ESTADO DE LA REGIÓN
    const [regionName, setRegionName] = useState("");

    // ESTADO DEL PAÍS ASOCIADO
    const [countrySearch, setCountrySearch] = useState("");
    const [selectedCountryId, setSelectedCountryId] = useState<
        number | undefined
    >(undefined);
    const [selectedCountryName, setSelectedCountryName] = useState<string>("");
    const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
    const [countryPickerOpen, setCountryPickerOpen] = useState(false);

    // --- Conexión con Hooks ---
    const { mutate, isPending: isCreating } = useCreateRegion();
    const { data: allCountries = [], isLoading: isCountriesLoading } =
        useAllCountries();

    // Si venimos desde New_location con un país seleccionado, pre-seleccionarlo
    useEffect(() => {
        if (!params) return;
        const p: any = params;
        const getVal = (key: string) => {
            const v = p[key];
            if (Array.isArray(v)) return v[0];
            return v;
        };

        const selectedCountryIdParam = getVal("selectedCountryId");
        const paisSearchParam = getVal("paisSearch");

        if (selectedCountryIdParam) {
            const idNum = Number(selectedCountryIdParam);
            setSelectedCountryId(idNum);
        }
        if (paisSearchParam) {
            setSelectedCountryName(String(paisSearchParam));
            setCountrySearch(String(paisSearchParam));
        }
    }, [params]);

    // --- Lógica de Búsqueda de País ---
    const handleCountrySearchChange = (text: string) => {
        setCountrySearch(text);
        setSelectedCountryId(undefined);
        setSelectedCountryName("");
        setShowCountrySuggestions(text.length > 0);
    };

    const handleCountrySuggestionSelect = (country: Country) => {
        setSelectedCountryId(country.id);
        setSelectedCountryName(country.name);
        setCountrySearch(country.name);
        setShowCountrySuggestions(false);
    };

    const handleClearCountrySearch = () => {
        setCountrySearch("");
        setSelectedCountryId(undefined);
        setSelectedCountryName("");
        setShowCountrySuggestions(false);
    };

    const countrySuggestions =
        countrySearch.length > 0
            ? allCountries
                  .filter((country: Country) =>
                      country.name
                          .toLowerCase()
                          .includes(countrySearch.toLowerCase())
                  )
                  .slice(0, 5)
            : [];

    // Mapeo para SimplePickerModal
    const countryItems: SimplePickerItem<Country>[] = allCountries.map((c) => ({
        value: c.id!,
        label: c.name,
        raw: c,
    }));

    const handleCrear = () => {
        const trimmedName = regionName.trim();

        if (!trimmedName) {
            return Alert.alert(
                "Error",
                "El nombre de la región no puede estar vacío."
            );
        }
        if (selectedCountryId === undefined) {
            return Alert.alert(
                "Error",
                "Debe seleccionar un País para asociar la región."
            );
        }

        const newRegionPayload: CreateRegionPayload = {
            name: trimmedName,
            countryId: selectedCountryId,
        };

        mutate(newRegionPayload, {
            onSuccess: (createdRegion: any) => {
                const createdId = createdRegion?.id;
                const createdName = createdRegion?.name ?? trimmedName;
                Alert.alert(
                    "Éxito",
                    `La región '${createdName}' fue creada y asociada a ${selectedCountryName}.`
                );
                const p: any = params ?? {};
                router.replace({
                    pathname: "/(tabs)/location/New_location",
                    params: {
                        nombre: p.nombre,
                        ubicacion: p.ubicacion,
                        descripcion: p.descripcion,
                        regionSearch: createdName,
                        selectedRegionId: createdId
                            ? String(createdId)
                            : undefined,
                        paisSearch: p.paisSearch,
                        selectedCountryId: p.selectedCountryId,
                    },
                });
            },
            onError: (error) => {
                Alert.alert(
                    "Error de Creación",
                    `Fallo al crear la región: ${error.message}`
                );
            },
        });
    };

    const handleCancelar = () => {
        const p: any = params ?? {};
        router.replace({
            pathname: "/(tabs)/location/New_location",
            params: {
                nombre: p.nombre,
                ubicacion: p.ubicacion,
                descripcion: p.descripcion,
                regionSearch: p.regionSearch,
                selectedRegionId: p.selectedRegionId,
                paisSearch: p.paisSearch,
                selectedCountryId: p.selectedCountryId,
            },
        });
    };

    const isButtonDisabled =
        isCreating || !regionName.trim() || !selectedCountryId;

    return (
        <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
            <Navbar title="Nueva Región" showBackArrow />

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
                                Nueva Región
                            </Text>
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: "#A0785D",
                                }}
                            >
                                Ingrese los datos de la nueva región
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
                            {/* Campo Nombre de la Región */}
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
                                    Nombre de la Región *
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
                                    placeholder="Nombre de la región"
                                    value={regionName}
                                    onChangeText={setRegionName}
                                    placeholderTextColor="#B8967D"
                                    selectionColor="#8B5E3C"
                                    editable={!isCreating}
                                />
                            </View>

                            {/* Campo País Asociado */}
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
                                        Asociar a País *
                                    </Text>
                                    {isCountriesLoading && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#8B5E3C"
                                        />
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={() => setCountryPickerOpen(true)}
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
                                            color: selectedCountryName
                                                ? "#4A3725"
                                                : "#B8967D",
                                            flex: 1,
                                        }}
                                    >
                                        {selectedCountryName ||
                                            "Seleccionar país"}
                                    </Text>
                                    {selectedCountryName && (
                                        <TouchableOpacity
                                            onPress={handleClearCountrySearch}
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
                            </View>
                        </View>

                        {/* Botones de Acción */}
                        <View style={{ gap: 16 }}>
                            <Button
                                title={
                                    isCreating
                                        ? "Creando Región..."
                                        : "Crear Región"
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

            {/* Modal de selección de País */}
            <SimplePickerModal
                visible={countryPickerOpen}
                title="Seleccionar País"
                items={countryItems}
                selectedValue={selectedCountryId ?? null}
                onSelect={(value) => {
                    const sel = allCountries.find(
                        (c) => c.id === Number(value)
                    );
                    if (sel) {
                        setSelectedCountryId(sel.id);
                        setSelectedCountryName(sel.name);
                        setCountrySearch(sel.name);
                    }
                    setCountryPickerOpen(false);
                }}
                onClose={() => setCountryPickerOpen(false)}
            />
        </View>
    );
}
