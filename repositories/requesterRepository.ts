import { apiClient } from "@/lib/api";

export type Requester = {
  id?: number;
  firstname: string;
  lastname: string;
  type: string;
};

export const RequesterRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/requesters");
    return data as Requester[];
  },

  create: async (payload: Requester) => {
    const { data } = await apiClient.post("/requesters", payload);
    return data as Requester;
  },

  update: async (id: number, payload: Requester) => {
    const { data } = await apiClient.put(`/requesters/${id}`, payload);
    return data as Requester;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/requesters/${id}`);
    return data as { ok: boolean } | Requester;
  },
};
