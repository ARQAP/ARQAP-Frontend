import { apiClient } from "@/lib/api";

export type Shelf = {
  id: number;
  code: number;
};

export const ShelfRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/shelfs"); // protegida
    return data as Shelf[];
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/shelfs/${id}`);
    return data as Shelf;
  },

  create: async (payload: Shelf) => {
    const { data } = await apiClient.post("/shelfs", payload);
    return data as Shelf;
  },

  update: async (id: number, payload: Shelf) => {
    const { data } = await apiClient.put(`/shelfs/${id}`, payload);
    return data as Shelf;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/shelfs/${id}`);
    return data as { ok: boolean } | Shelf;
  },
};
