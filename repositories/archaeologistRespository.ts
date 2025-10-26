import axios from "axios";
const API_URL = process.env.API_URL;

// Tipos/Modelos TypeScript para las entidades usadas aquí
export type Archaeologist = {
    id?: number;
    firstname: string;
    lastname: string;
}

export const ArchaeologistRepository = {
    getArchaeologists: async () => {
        const response = await axios.get(`${API_URL}/archaeologists`);
        return response.data;
    },

    createArchaeologist: async (newArchaeologist: Archaeologist) => {
        const response = await axios.post(`${API_URL}/archaeologists`, newArchaeologist);
        return response.data;
    },

    updateArchaeologist: async (id: number, updatedArchaeologist: Archaeologist) => {
        const response = await axios.put(`${API_URL}/archaeologists/${id}`, updatedArchaeologist);
        return response.data;
    },

    deleteArchaeologist: async (id: number) => {
        const response = await axios.delete(`${API_URL}/archaeologists/${id}`);
        return response.data;
    }
};