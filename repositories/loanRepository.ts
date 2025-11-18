import { apiClient } from "@/lib/api";
import type { Artefact } from "./artefactRepository";
import type { Requester } from "./requesterRepository";

export type Loan = {
  id?: number;
  loanDate: string; // Datetime completo en formato ISO
  loanTime: string; // Datetime completo en formato ISO (mismo que loanDate)
  returnDate?: string; // Datetime completo en formato ISO (opcional)
  returnTime?: string; // Datetime completo en formato ISO (opcional, mismo que returnDate)
  artefactId?: number | null;
  artefact?: Artefact | null;
  requesterId?: number | null;
  requester?: Requester | null;
};

export const LoanRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/loans/");
    return data as Loan[];
    console.log("Fetched loans:", data);
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
