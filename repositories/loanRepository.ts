import { apiClient } from "@/lib/api";
import type { Artefact } from "./artefactRepository";
import type { Requester } from "./requesterRepository";

export type Loan = {
  id?: number;
  loanDate: string; // Fecha en formato ISO
  loanTime: string; // Hora en formato HH:MM
  returnDate?: string; // Fecha en formato ISO (opcional para creación)
  returnTime?: string; // Hora en formato HH:MM (opcional para creación)
  artefactId?: number | null;
  artefact?: Artefact | null;
  requesterId?: number | null;
  requester?: Requester | null;
};

export const LoanRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/loans/");
    return data as Loan[];
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/loans/${id}`);
    return data as Loan;
  },

  create: async (payload: Loan) => {
    const { data } = await apiClient.post("/loans/", payload);
    return data as Loan;
  },

  update: async (id: number, payload: Loan) => {
    const { data } = await apiClient.put(`/loans/${id}`, payload);
    return data as Loan;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/loans/${id}`);
    return data as { ok: boolean } | Loan;
  },
};
