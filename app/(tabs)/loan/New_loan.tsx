import { useArtefacts } from "@/hooks/useArtefact";
import { useCreateLoan } from "@/hooks/useloan";
import { useRequesters } from "@/hooks/useRequester";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function NewLoan() {
  const { data: artefacts, isLoading: artefactsLoading } = useArtefacts();
  // store selected artefact ids
  const [piezasSeleccionadas, setPiezasSeleccionadas] = useState<number[]>([]);
  const [solicitantesSeleccionados, setSolicitantesSeleccionados] = useState<
    number[]
  >([]);
  const [filtroPieza, setFiltroPieza] = useState("");
  const [filtroSolicitante, setFiltroSolicitante] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [dateText, setDateText] = useState<string>("");
  const [timeText, setTimeText] = useState<string>("");

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      formatted =
        digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    }
    setDateText(formatted);

    if (digits.length === 8) {
      const d = Number(digits.slice(0, 2));
      const m = Number(digits.slice(2, 4));
      const y = Number(digits.slice(4));
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        const dt = new Date(y, m - 1, d);
        if (!isNaN(dt.getTime())) setSelectedDate(dt);
      }
    }
  };

  const handleTimeChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else {
      formatted = digits.slice(0, 2) + ":" + digits.slice(2);
    }
    setTimeText(formatted);

    if (digits.length === 4) {
      const hh = Number(digits.slice(0, 2));
      const mm = Number(digits.slice(2, 4));
      if (
        !isNaN(hh) &&
        !isNaN(mm) &&
        hh >= 0 &&
        hh < 24 &&
        mm >= 0 &&
        mm < 60
      ) {
        const now = new Date();
        const dt = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hh,
          mm
        );
        setSelectedTime(dt);
      }
    }
  };

  const openDatePicker = async () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const date = await new Promise<Date | null>((resolve) => {
        const input = document.createElement("input");
        input.type = "date";
        input.style.position = "absolute";
        input.style.opacity = "0";
        input.style.pointerEvents = "none";
        document.body.appendChild(input);
        input.focus();
        input.onchange = () => {
          const val = input.value; 
          if (val) {
            const [y, m, d] = val.split("-");
            const dt = new Date(Number(y), Number(m) - 1, Number(d));
            resolve(dt);
          } else {
            resolve(null);
          }
          setTimeout(() => document.body.removeChild(input), 0);
        };
        input.onblur = () => {
          resolve(null);
          if (document.body.contains(input)) document.body.removeChild(input);
        };
        input.click();
      });

      if (date) setSelectedDate(date);
      if (date) setDateText(date ? formatDate(date) : "");
    } else {
      setIsDatePickerVisible(true);
    }
  };

  const openTimePicker = async () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const time = await new Promise<Date | null>((resolve) => {
        const input = document.createElement("input");
        input.type = "time";
        input.style.position = "absolute";
        input.style.opacity = "0";
        input.style.pointerEvents = "none";
        document.body.appendChild(input);
        input.focus();
        input.onchange = () => {
          const val = input.value; 
          if (val) {
            const [hh, mm] = val.split(":");
            const now = new Date();
            const dt = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              Number(hh),
              Number(mm)
            );
            resolve(dt);
          } else {
            resolve(null);
          }
          setTimeout(() => document.body.removeChild(input), 0);
        };
        input.onblur = () => {
          resolve(null);
          if (document.body.contains(input)) document.body.removeChild(input);
        };
        input.click();
      });

      if (time) setSelectedTime(time);
      if (time) setTimeText(time ? formatTime(time) : "");
    } else {
      setIsTimePickerVisible(true);
    }
  };

  const { width } = useWindowDimensions();
  const isNarrow = width < 700;
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const createMutation = useCreateLoan();
  const { data: requesters, isLoading: requestersLoading } = useRequesters();
  const [extraRequesters, setExtraRequesters] = React.useState<any[]>([]);
  React.useEffect(() => {
    const idParam = params?.createdRequesterId;
    const fn = params?.createdFirstname;
    const ln = params?.createdLastname;
    if (!fn && !ln && !idParam) return;

    const idNum = idParam ? Number(idParam) : undefined;
    const tempId = idNum && !isNaN(idNum) ? idNum : `temp-${Date.now()}`;
    const tempRequester = {
      id: tempId,
      firstname: fn ?? "",
      lastname: ln ?? "",
    } as any;

    setExtraRequesters((prev) => {
      const exists = prev.some(
        (p) => String(p.id) === String(tempRequester.id)
      );
      return exists ? prev : [tempRequester, ...prev];
    });

    setSolicitantesSeleccionados((prev) => {
      const exists = prev.some((p) => String(p) === String(tempRequester.id));
      return exists ? prev : [...prev, tempRequester.id];
    });

    try {
      router.replace("/(tabs)/loan/New_loan" as unknown as any);
    } catch (e) {
      router.back();
    }
  }, [
    params?.createdRequesterId,
    params?.createdFirstname,
    params?.createdLastname,
  ]);

  const toggleSeleccion = (
    arr: any[],
    setArr: (a: any[]) => void,
    value: any
  ) => {
    if (arr.includes(value)) {
      setArr(arr.filter((v) => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };
  return (
    <ScrollView
      className="flex-1 bg-[#F3E9DD]"
      contentContainerStyle={{ alignItems: "center" }}
    >
      <Navbar title="Nuevo Prestamo" showBackArrow />
      <View
        className="w-[90%] max-w-[700px] items-center self-center"
        style={{ padding: 12 }}
      >
        <Text
          className="text-center text-[18px] mb-4 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Registra un nuevo prestamo de piezas
        </Text>

        <View
          style={{
            width: "100%",
            flexDirection: isNarrow ? "column" : "row",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Asociar Pieza a un Prestamo
            </Text>
            <View className="w-full">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                  placeholder="Filtrar piezas..."
                  placeholderTextColor="#A68B5B"
                  value={filtroPieza}
                  onChangeText={setFiltroPieza}
                  style={{ fontFamily: "MateSC-Regular" }}
                />
                <TouchableOpacity style={{ marginLeft: 8 }}>
                  <FontAwesome name="search" size={18} color="#8B5E3C" />
                </TouchableOpacity>
              </View>
              <View className="h-36 bg-[#E2D3B3] rounded-lg mt-3 p-2">
                {artefactsLoading ? (
                  <Text style={{ fontFamily: "MateSC-Regular" }}>
                    Cargando piezas...
                  </Text>
                ) : (
                  <ScrollView>
                    {(artefacts || [])
                      .filter((a) => a.available)
                      .filter((a) =>
                        a.name
                          .toLowerCase()
                          .includes(filtroPieza.trim().toLowerCase())
                      )
                      .map((a) => (
                        <TouchableOpacity
                          key={a.id}
                          onPress={() =>
                            toggleSeleccion(
                              piezasSeleccionadas,
                              setPiezasSeleccionadas,
                              a.id
                            )
                          }
                          style={{
                            padding: 8,
                            borderRadius: 6,
                            marginBottom: 6,
                            backgroundColor: piezasSeleccionadas.includes(
                              a.id as number
                            )
                              ? "#8B9B7A"
                              : "#F7F5F2",
                          }}
                        >
                          <Text style={{ fontFamily: "MateSC-Regular" }}>
                            {a.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Asociar Pieza a un Solicitante
            </Text>
            <View className="w-full">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                  placeholder="Filtrar solicitantes..."
                  placeholderTextColor="#A68B5B"
                  value={filtroSolicitante}
                  onChangeText={setFiltroSolicitante}
                  style={{ fontFamily: "MateSC-Regular" }}
                />
                <TouchableOpacity style={{ marginLeft: 8 }}>
                  <FontAwesome name="search" size={18} color="#8B5E3C" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 8, padding: 6 }}
                  onPress={() =>
                    router.push("/(tabs)/loan/New_requester" as unknown as any)
                  }
                >
                  <FontAwesome name="plus" size={18} color="#8B5E3C" />
                </TouchableOpacity>
              </View>
              <View className="h-36 bg-[#E2D3B3] rounded-lg mt-3 p-2">
                {requestersLoading ? (
                  <Text style={{ fontFamily: "MateSC-Regular" }}>
                    Cargando solicitantes...
                  </Text>
                ) : (
                  <ScrollView>
                    {(() => {
                      const list = [
                        ...(extraRequesters || []),
                        ...(requesters || []),
                      ];
                      const seen = new Set<string>();
                      return list
                        .filter((r: any) => {
                          const key = String(r.id);
                          if (seen.has(key)) return false;
                          seen.add(key);
                          if (!filtroSolicitante) return true;
                          const full =
                            `${r.firstname} ${r.lastname}`.toLowerCase();
                          return full.includes(
                            filtroSolicitante.trim().toLowerCase()
                          );
                        })
                        .map((r: any) => (
                          <TouchableOpacity
                            key={r.id}
                            onPress={() =>
                              toggleSeleccion(
                                solicitantesSeleccionados,
                                setSolicitantesSeleccionados,
                                r.id
                              )
                            }
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              marginBottom: 6,
                              backgroundColor:
                                solicitantesSeleccionados.includes(
                                  r.id as number
                                )
                                  ? "#8B9B7A"
                                  : "#F7F5F2",
                            }}
                          >
                            <Text style={{ fontFamily: "MateSC-Regular" }}>
                              {r.firstname} {r.lastname}
                            </Text>
                          </TouchableOpacity>
                        ));
                    })()}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: isNarrow ? "column" : "row",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Fecha de Prestamo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => openDatePicker()}>
                <FontAwesome
                  name="calendar"
                  size={20}
                  color="#222"
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#A68B5B"
                value={dateText}
                onChangeText={handleDateChange}
                style={{ fontFamily: "MateSC-Regular" }}
              />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Hora de Prestamo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => openTimePicker()}>
                <FontAwesome
                  name="clock-o"
                  size={20}
                  color="#222"
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                placeholder="--:--"
                placeholderTextColor="#A68B5B"
                value={timeText}
                onChangeText={handleTimeChange}
                style={{ fontFamily: "MateSC-Regular" }}
              />
            </View>
          </View>
        </View>

        <View className="w-full">
          <Button
            title="CREAR PRESTAMO"
            className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
            textClassName="text-white text-[16px]"
            onPress={async () => {
              try {
                let finalDate = selectedDate ? new Date(selectedDate) : null;
                if (dateText) {
                  const parts = dateText.split("/").map((p) => Number(p));
                  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
                    const [d, m, y] = parts;
                    finalDate = new Date(y, m - 1, d);
                  }
                }
                if (!finalDate) finalDate = new Date();
                if (timeText) {
                  const tparts = timeText.split(":").map((p) => Number(p));
                  if (tparts.length >= 2 && tparts.every((n) => !isNaN(n))) {
                    finalDate.setHours(tparts[0], tparts[1], 0, 0);
                  }
                } else if (selectedTime) {
                  finalDate.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes(),
                    0,
                    0
                  );
                }

                const horaString =
                  timeText && timeText.length > 0
                    ? timeText
                    : selectedTime
                      ? formatTime(selectedTime)
                      : "--:--";

                await createMutation.mutateAsync({
                  FechaPrestamo: finalDate.toISOString(),
                  HoraPrestamo: horaString,
                  artefactIds: piezasSeleccionadas,
                } as any);
                router.push("/(tabs)/loan/View_loan");
              } catch (e) {

                const err: any = e;
                console.error("Create loan error:", err);
                const serverMsg =
                  err?.response?.data?.message ||
                  err?.response?.data ||
                  err?.message;
                alert(
                  "Error al crear el préstamo" +
                    (serverMsg ? `: ${JSON.stringify(serverMsg)}` : "")
                );
              }
            }}
          />
          <Button
            title="CANCELAR"
            className="bg-[#E2D3B3] rounded-lg py-3 items-center w-full"
            textClassName="text-[#222] text-[16px]"
            onPress={() => router.push("/(tabs)/loan/View_loan")}
          />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          setSelectedDate(date);
          setDateText(formatDate(date));
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={(date: Date) => {
          setSelectedTime(date);
          setTimeText(formatTime(date));
          setIsTimePickerVisible(false);
        }}
        onCancel={() => setIsTimePickerVisible(false)}
      />
    </ScrollView>
  );
}

function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
