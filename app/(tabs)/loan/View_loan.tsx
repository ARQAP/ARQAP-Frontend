import { useArtefacts } from "@/hooks/useArtefact";
import { useAllLoans } from "@/hooks/useloan";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

function displayLoanSummary(
  loan: any,
  artefactsById: Record<number, any> = {}
) {
  const candidates: any[] = [
    loan?.FechaPrestamo,
    loan?.fechaPrestamo,
    loan?.FechaPrestamo?.date,
    loan?.FechaPrestamo?.Date,
    loan?.FechaPrestamo?.Time,
    loan?.createdAt,
    loan?.created_at,
    loan?.startDate,
    loan?.start_date,
  ];

  const parseToDate = (value: any): Date | null => {
    if (!value && value !== 0) return null;
    if (value instanceof Date) return value;
    if (typeof value === "object") {
      if (value.date) return parseToDate(value.date);
      if (value.Date) return parseToDate(value.Date);
      if (value.Time) return parseToDate(value.Time);
      return null;
    }
    if (typeof value === "number") return new Date(value);
    if (typeof value === "string") {
      const s = value.trim();
      if (/\d{4}-\d{2}-\d{2}T/.test(s)) return new Date(s);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00");
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s)) {
        const parts = s.includes("/") ? s.split("/") : s.split("-");
        const d = Number(parts[0]);
        const m = Number(parts[1]);
        const y = Number(parts[2]);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m - 1, d);
      }
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) return dt;
    }
    return null;
  };

  for (const c of candidates) {
    const d = parseToDate(c);
    if (d) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
      const hora = loan?.HoraPrestamo ? String(loan.HoraPrestamo).trim() : null;
      let timeStr = "";
      if (hora) timeStr = hora;
      else {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        if (!(hh === "00" && mm === "00")) timeStr = `${hh}:${mm}`;
      }
      if (
        loan?.artefacts &&
        Array.isArray(loan.artefacts) &&
        loan.artefacts.length > 0
      ) {
        const names = loan.artefacts
          .map((a: any) => a.name || a.nombre || a.title)
          .filter(Boolean);
        const first = names[0] || `Pieza ${loan.artefacts[0].id || "?"}`;
        const more = names.length > 1 ? ` (+${names.length - 1})` : "";
        return `${first}${more} — Inicio: ${dateStr}${timeStr ? ` ${timeStr}` : ""}`;
      }
      if (
        loan?.artefactIds &&
        Array.isArray(loan.artefactIds) &&
        loan.artefactIds.length > 0
      ) {
        const names = loan.artefactIds
          .map(
            (id: number) =>
              artefactsById[id]?.name || artefactsById[id]?.nombre || null
          )
          .filter(Boolean);
        if (names.length > 0) {
          const first = names[0];
          const more = names.length > 1 ? ` (+${names.length - 1})` : "";
          return `${first}${more} — Inicio: ${dateStr}${timeStr ? ` ${timeStr}` : ""}`;
        }
      }
      return `Inicio: ${dateStr}${timeStr ? ` ${timeStr}` : ""}`;
    }
  }

  if (
    loan?.artefactIds &&
    Array.isArray(loan.artefactIds) &&
    loan.artefactIds.length > 0
  ) {
    // try resolve names
    const names = (loan.artefactIds || [])
      .map(
        (id: number) =>
          artefactsById[id]?.name || artefactsById[id]?.nombre || null
      )
      .filter(Boolean);
    if (names.length > 0)
      return names.length === 1
        ? names[0]
        : `${names[0]} (+${names.length - 1})`;
    return `${loan.artefactIds.length} pieza(s)`;
  }

  if (
    loan?.artefacts &&
    Array.isArray(loan.artefacts) &&
    loan.artefacts.length > 0
  ) {
    // show a name if available
    const names = loan.artefacts
      .map((a: any) => a.name || a.nombre || a.title)
      .filter(Boolean);
    if (names.length > 0)
      return names.length === 1
        ? names[0]
        : `${names[0]} (+${names.length - 1})`;
    return `${loan.artefacts.length} pieza(s)`;
  }

  // Fallback: if backend returns a raw FechaPrestamo or createdAt string we couldn't parse, show it
  if (loan?.FechaPrestamo) return `Inicio: ${String(loan.FechaPrestamo)}`;
  if (loan?.createdAt) return `Inicio: ${String(loan.createdAt)}`;
  if (loan?.FechaDevolucion) return `Fin: ${String(loan.FechaDevolucion)}`;

  // Last resort: show the loan id so it's not 'Sin detalles'
  if (loan?.id) return `Préstamo #${loan.id}`;

  return "";
}

export default function ViewLoan() {
  const router = useRouter();
  const { data: loans, isLoading, error } = useAllLoans();
  const { data: allArtefacts } = useArtefacts();

  // build id -> artefact map for quick lookup
  const artefactsById: Record<number, any> = {};
  (allArtefacts || []).forEach((a: any) => {
    if (a?.id != null) artefactsById[a.id] = a;
  });

  const ongoingLoans = (loans || []).filter((l: any) => !l.FechaDevolucion);
  const finishedLoans = (loans || []).filter((l: any) => l.FechaDevolucion);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5ECD6" }}>
      <Navbar title="Préstamos" showBackArrow backToHome />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            flex: 1,
            width: "90%",
            backgroundColor: "#F5ECD6",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#222",
            }}
          >
            En curso
          </Text>
          <ScrollView style={{ maxHeight: 180, marginBottom: 16 }}>
            {isLoading && <Text>Cargando...</Text>}
            {!isLoading && ongoingLoans.length === 0 && (
              <Text style={{ color: "#222" }}>No hay préstamos en curso</Text>
            )}
            {ongoingLoans.map((loan: any) => (
              <View
                key={String(loan.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E2D3B3",
                  borderRadius: 6,
                  marginBottom: 8,
                  padding: 8,
                }}
              >
                <Text
                  style={{ flex: 1, color: "#222" }}
                >{`#${loan.id} — ${displayLoanSummary(loan, artefactsById)}`}</Text>
                <Button
                  title="Finalizar"
                  className="bg-[#6B705C] rounded-lg px-4 py-2"
                  textClassName="text-white"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/loan/Finalize_loan",
                      params: { id: loan.id },
                    })
                  }
                />
              </View>
            ))}
          </ScrollView>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#222",
            }}
          >
            Finalizados
          </Text>
          <ScrollView style={{ maxHeight: 180, marginBottom: 16 }}>
            {!isLoading && finishedLoans.length === 0 && (
              <Text style={{ color: "#222" }}>
                No hay préstamos finalizados
              </Text>
            )}
            {finishedLoans.map((loan: any) => (
              <View
                key={String(loan.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E2D3B3",
                  borderRadius: 6,
                  marginBottom: 8,
                  padding: 8,
                }}
              >
                <Text
                  style={{ flex: 1, color: "#222" }}
                >{`#${loan.id} — ${displayLoanSummary(loan, artefactsById)}`}</Text>
                <Button
                  title="Ver detalle"
                  className="bg-[#6B705C] rounded-lg px-4 py-2"
                  textClassName="text-white"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/loan/View_detail_loan",
                      params: { id: loan.id },
                    })
                  }
                />
              </View>
            ))}
          </ScrollView>
          <Button
            title="CREAR PRESTAMO"
            className="bg-[#6B705C] rounded-lg py-3 items-center mb-2"
            textClassName="text-white text-[16px]"
            onPress={() => router.push("/(tabs)/loan/New_loan")}
          />
          <Button
            title="CANCELAR"
            className="bg-[#E2D3B3] rounded-lg py-3 items-center"
            textClassName="text-[#222] text-[16px]"
          />
        </View>
      </View>
    </View>
  );
}
