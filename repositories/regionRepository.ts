import { apiClient } from "@/lib/api";
import { Country } from "./countryRepository";

export type Region = {
    id?: number;
    name: string;
    countryId: Country['id'];
    country: Country;
};

export type CreateRegionPayload = {
    name: string;
    countryId: number;
};

export const RegionRepository = {
    getAll: async () => {
        const { data } = await apiClient.get("/regions/");
        return data as Region[];
    },

    create: async (newRegion: CreateRegionPayload) => {
        const { data } = await apiClient.post("/regions/", newRegion);
        return data as Region;
    },

    update: async (id: number, updatedRegion: CreateRegionPayload) => {
        const { data } = await apiClient.put(`/regions/${id}`, updatedRegion);
        return data as Region;
    },

    delete: async (id: number) => {
        const { data } = await apiClient.delete(`/regions/${id}`);
        return data as { ok: boolean };
    }
};

