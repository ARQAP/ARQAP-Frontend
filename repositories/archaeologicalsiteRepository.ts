import axios from 'axios';
const API_URL = 'http://localhost:8080';

// Tipos/Modelos TypeScript para las entidades usadas aquí
export type ArchaeologicalSite = {
    id?: number;
    name: string;
    description: string;
    location: string;
    regionId?: number;
    region?: any; // ajustar tipo si se dispone del modelo Region
};

export const ArchaeologicalSiteRepository = {
    getArchaeologicalSites: async () => {
        const response = await axios.get(`${API_URL}/archaeologicalSites`);
        return response.data;
    },

    createArchaeologicalSite: async (newSite: ArchaeologicalSite) => {
        const response = await axios.post(`${API_URL}/archaeologicalSites`, newSite);
        return response.data;
    },

    updateArchaeologicalSite: async (id: number, updatedSite: ArchaeologicalSite) => {
        const response = await axios.put(`${API_URL}/archaeologicalSites/${id}`, updatedSite);
        return response.data;
    },

    deleteArchaeologicalSite: async (id: number) => {
        const response = await axios.delete(`${API_URL}/archaeologicalSites/${id}`);
        return response.data;
    }
};