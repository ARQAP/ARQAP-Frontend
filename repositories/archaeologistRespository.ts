import { apiClient } from "@/lib/api";

export type Archaeologist = {
  id?: number;
  firstname: string;
  lastname: string;
};

export const ArchaeologistRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/archaeologists"); // protegida
    return data as Archaeologist[];
  },

  create: async (payload: Archaeologist) => {
    const { data } = await apiClient.post("/archaeologists", payload);
    return data as Archaeologist;
  },

  update: async (id: number, payload: Archaeologist) => {
    const { data } = await apiClient.put(`/archaeologists/${id}`, payload);
    return data as Archaeologist;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/archaeologists/${id}`);
    return data as { ok: boolean } | Archaeologist;
  },
};