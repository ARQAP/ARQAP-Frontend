import { apiClient } from "@/lib/api";

export type Collection = {
    id?: number;
    name: string;
    description?: string;
    year?: number;
};

export const CollectionRepository = {
    getAll: async () => {
        const { data } = await apiClient.get("/collections/");
        return data as Collection[];
    },

    create: async (payload: Collection) => {
        const { data } = await apiClient.post("/collections/", payload);
        return data as Collection;
    },

    update: async (id: number, payload: Collection) => {
        const { data } = await apiClient.put(`/collections/${id}`, payload);
        return data as Collection;
    },

    remove: async (id: number) => {
        const { data } = await apiClient.delete(`/collections/${id}`);
        return data as { ok: boolean } | Collection;
    },
};
