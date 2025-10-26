import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import { useArchaeologists } from "../../../hooks/useArchaeologist";
import Navbar from "../Navbar";
import Card_archaeologist from "./Card_archaeologist";

export default function View_archaeologist() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, status, error, isFetching } = useArchaeologists();

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return data || [];
    return (data || []).filter(
      (a) =>
        a.firstname.toLowerCase().includes(term) ||
        a.lastname.toLowerCase().includes(term)
    );
  }, [data, search]);

  return (
    <View className="flex-1 bg-[#F3E9DD] p-0">
      <Navbar title="Ver Arqueólogos" showBackArrow backToHome />
      <View className="p-5 flex-1">
        <Button
          title="Registrar nuevo arqueologo"
          onPress={() => router.push("/(tabs)/archaeologist/New_archaeologist")}
          textStyle={{ fontFamily: "MateSC-Regular", fontWeight: "bold" }}
        />

        <TextInput
          placeholder="Buscar por nombre o apellido"
          className="bg-[#F7F5F2] rounded-lg p-2 mb-5 border border-[#ccc]"
          value={search}
          onChangeText={setSearch}
          style={{ fontFamily: "CrimsonText-Regular", fontSize: 16 }}
        />

        {status === "pending" ? (
          <ActivityIndicator />
        ) : status === "error" ? (
          <Text style={{ fontFamily: "CrimsonText-Regular", color: "#8B0000" }}>
            {(error as Error).message}
          </Text>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex flex-col gap-4">
              {filtered.map((arch) => (
                <Card_archaeologist
                  key={arch.id ?? `${arch.firstname}-${arch.lastname}`}
                  id={arch.id}
                  nombre={arch.firstname}
                  apellido={arch.lastname}
                />
              ))}
              {isFetching ? (
                <Text style={{ fontFamily: "CrimsonText-Regular" }}>Actualizando…</Text>
              ) : null}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
