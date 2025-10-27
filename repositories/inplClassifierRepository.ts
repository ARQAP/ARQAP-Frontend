import { apiClient } from "@/lib/api";

export type INPLFichaDTO = {
  id: number;
  inplClassifierId: number;
  filename: string;
  contentType: string;
  size: number;
  url: string;
};

export type INPLClassifierDTO = {
  id: number;
  inplFichas: INPLFichaDTO[];
};

export const INPLRepository = {
  getAll: async (preload: boolean = true) => {
    const { data } = await apiClient.get(`/inplClassifiers/`, {
      params: { preload },
    });
    return data as INPLClassifierDTO[];
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/inplClassifiers/${id}`);
    return data as INPLClassifierDTO;
  },

  create: async (files: File[] | any[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("fichas[]", f));
    const { data } = await apiClient.post(`/inplClassifiers/`, form);
    return data as INPLClassifierDTO;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/inplClassifiers/${id}`);
    return data as { ok?: boolean; message?: string };
  },

  update: async (id: number, payload: Partial<INPLClassifierDTO>) => {
    const { data } = await apiClient.put(`/inplClassifiers/${id}`, payload);
    return data as INPLClassifierDTO;
  },

  addFichas: async (classifierId: number, files: File[] | any[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("fichas[]", f));
    const { data } = await apiClient.post(
      `/inplClassifiers/${classifierId}/fichas/`,
      form
    );
    return data as INPLClassifierDTO;
  },

  listFichasByClassifier: async (classifierId: number) => {
    const { data } = await apiClient.get(
      `/inplClassifiers/${classifierId}/fichas`
    );
    return data as INPLFichaDTO[];
  },

  replaceFicha: async (fichaId: number, file: File) => {
    const form = new FormData();
    form.append("ficha", file);
    const { data } = await apiClient.put(`/inplFichas/${fichaId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as INPLFichaDTO;
  },

  deleteFicha: async (fichaId: number) => {
    const { data } = await apiClient.delete(`/inplFichas/${fichaId}`);
    return data as { ok?: boolean; message?: string };
  },

  fichaDownloadUrl: (fichaId: number) => `/inplFichas/${fichaId}/download`,
  fetchFichaBlob: async (fichaId: number) => {
    const res = await apiClient.get(`/inplFichas/${fichaId}/download`, {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};
