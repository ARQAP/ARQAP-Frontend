import { apiClient } from "@/lib/api";
import { Region } from './regionRepository';

export type ArchaeologicalSite = {
    id?: number;
    Name: string;
    Description: string;
    Location: string;
    regionId: Region['id'];
    region: Region;
};

export const ArchaeologicalSiteRepository = {
    getAll: async () => {
        const response = await apiClient.get(`/archaeologicalSites/`);
        return response.data;
    },

    create: async (newSite: ArchaeologicalSite) => {
        const response = await apiClient.post(`/archaeologicalSites/`, newSite);
        return response.data;
    },

    update: async (id: number, updatedSite: ArchaeologicalSite) => {
        const response = await apiClient.put(`/archaeologicalSites/${id}`, updatedSite);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/archaeologicalSites/${id}`);
        return response.data;
    }
};