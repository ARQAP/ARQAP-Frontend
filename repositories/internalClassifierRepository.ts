import { apiClient } from "@/lib/api";

export type InternalClassifier = {
  id?: number;
  number: number;
  name: string;
};

function normalizeName(input: string) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export const InternalClassifierRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/internalClassifiers/"); // protegida
    return data as InternalClassifier[];
  },

  getByName: async (name: string) => {
    const normalized = normalizeName(name);
    const { data } = await apiClient.get(`/internalClassifiers/name/${encodeURIComponent(normalized)}`);
    return data as InternalClassifier[];
  },

  getAllNames: async () => {
    const { data } = await apiClient.get(`/internalClassifiers/names`);
    return data as string[];
  },

  create: async (payload: InternalClassifier) => {
    const body = { ...payload, name: normalizeName(payload.name) };
    const { data } = await apiClient.post("/internalClassifiers/", body);
    return data as InternalClassifier;
  },

  update: async (id: number, payload: InternalClassifier) => {
    const body = { ...payload, name: normalizeName(payload.name) };
    const { data } = await apiClient.put(`/internalClassifiers/${id}`, body);
    return data as InternalClassifier;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/internalClassifiers/${id}`);
    return data as { ok: boolean } | InternalClassifier;
  },
};
