import { apiClient } from "@/lib/api";

export type InternalClassifier = {
  id?: number;
  number: number;
  color: string;
};

export const InternalClassifierRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/internalClassifiers/"); // protegida
    return data as InternalClassifier[];
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/internalClassifiers/${id}`);
    return data as InternalClassifier;
  },

  create: async (payload: InternalClassifier) => {
    const { data } = await apiClient.post("/internalClassifiers", payload);
    return data as InternalClassifier;
  },

  update: async (id: number, payload: InternalClassifier) => {
    const { data } = await apiClient.put(`/internalClassifiers/${id}`, payload);
    return data as InternalClassifier;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/internalClassifiers/${id}`);
    return data as { ok: boolean } | InternalClassifier;
  },
};
