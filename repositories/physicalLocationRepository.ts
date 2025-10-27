import { apiClient } from "@/lib/api";
import type { Shelf } from "@/repositories/shelfRepository";

export type LevelNumber = 1 | 2 | 3 | 4;
export type ColumnLetter = "A" | "B" | "C" | "D";

export type PhysicalLocation = {
  id?: number;
  level: LevelNumber;     // 1..4
  column: ColumnLetter;   // 'A'..'D'
  shelfId: number;        // FK
  shelf?: Shelf;          // viene del preload
};

export const PhysicalLocationRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/physical-locations/"); // protegida
    return data as PhysicalLocation[];
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/physical-locations/${id}`);
    return data as PhysicalLocation;
  },

  create: async (payload: { level: LevelNumber; column: ColumnLetter; shelfId: number }) => {
    const { data } = await apiClient.post("/physical-locations", payload);
    return data as PhysicalLocation;
  },

  update: async (id: number, payload: Partial<PhysicalLocation>) => {
    const { data } = await apiClient.put(`/physical-locations/${id}`, payload);
    return data as PhysicalLocation;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/physical-locations/${id}`);
    return data as { ok: boolean } | PhysicalLocation;
  },
};
