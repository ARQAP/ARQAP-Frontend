import { apiClient } from "@/lib/api";
import { Region } from "./regionRepository";

export type ArchaeologicalSite = {
  id?: number;
  Name: string;
  Description: string;
  Location: string;
  regionId: Region["id"];
  region: Region;
};

export const ArchaeologicalSiteRepository = {
  getAll: async (): Promise<ArchaeologicalSite[]> => {
    const response = await apiClient.get(`/archaeologicalSites/`);
    return response.data as ArchaeologicalSite[];
  },

  create: async (newSite: ArchaeologicalSite): Promise<ArchaeologicalSite> => {
    const response = await apiClient.post(`/archaeologicalSites/`, newSite);
    return response.data as ArchaeologicalSite;
  },

  update: async (id: number, updatedSite: ArchaeologicalSite): Promise<ArchaeologicalSite> => {
    const response = await apiClient.put(`/archaeologicalSites/${id}`, updatedSite);
    return response.data as ArchaeologicalSite;
  },

  delete: async (id: number): Promise<{ ok?: boolean } | void> => {
    const response = await apiClient.delete(`/archaeologicalSites/${id}`);
    return response.data;
  },
};
