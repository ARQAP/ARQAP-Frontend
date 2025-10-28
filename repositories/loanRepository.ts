import { apiClient } from "@/lib/api";

export type loan = {
  id?: number;
  FechaPrestamo: Date;
  HoraPrestamo: string;
  FechaDevolucion: Date;
  HoraDevolucion: string;
};

export const loanRepository = {
  getAll: async () => {
    const response = await apiClient.get(`/loans/`);
    return response.data;
  },

  create: async (newLoan: loan) => {
    const response = await apiClient.post(`/loans/`, newLoan);
    return response.data;
  },

  update: async (id: number, updatedLoan: loan) => {
    const response = await apiClient.put(`/loans/${id}`, updatedLoan);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/loans/${id}`);
    return response.data;
  },
};
