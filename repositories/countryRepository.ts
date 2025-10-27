import { apiClient } from "@/lib/api";

export type Country = {
  id?: number;
  name: string;
};

export const CountryRepository = {
    getAll: async () => {
        const { data } = await apiClient.get("/countries/");
        return data as Country[];
    },

    get: async (id: number) => {
        const { data } = await apiClient.get(`/countries/${id}`);
        return data as Country;
    },

    create: async (newCountry: Country) => {
        const { data } = await apiClient.post("/countries/", newCountry);
        return data as Country;
    },

    update: async (id: number, updatedCountry: Country) => {
        const { data } = await apiClient.put(`/countries/${id}`, updatedCountry);
        return data as Country;
    },

    delete: async (id: number) => {
        const { data } = await apiClient.delete(`/countries/${id}`);
        return data as { ok: boolean };
    }
};
