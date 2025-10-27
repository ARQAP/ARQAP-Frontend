import { apiClient } from "@/lib/api";

export type Picture = {
  id?: number;
  artefactId: number;
  filename: string;
  originalName?: string;
  filePath: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HistoricalRecord = {
  id?: number;
  artefactId: number;
  filename: string;
  originalName?: string;
  filePath: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Artefact = {
  id?: number;
  name: string;
  material?: string | null;
  observation?: string | null;
  available: boolean;
  picture?: Picture[];
  historicalRecord?: HistoricalRecord[];
  description?: string | null;
  collectionId?: number | null;
  collection?: unknown | null;
  archaeologistId?: number | null;
  archaeologist?: unknown | null;
  archaeologicalSiteId?: number | null;
  archaeologicalSite?: unknown | null;
  inplClassifierId?: number | null;
  inplClassifier?: unknown | null;
  internalClassifierId?: number | null;
  internalClassifier?: unknown | null;
  physicalLocationId?: number | null;
  physicalLocation?: unknown | null;
};

export type Mention = {
  id?: number;
  artefactId: number;
  title: string;
  link?: string | null;
  description?: string | null;
};

// src/repositories/artefactRepository.ts
export const ArtefactRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/artefacts/");
    return data as Artefact[];
  },

  create: async (payload: Artefact) => {
    const { data } = await apiClient.post("/artefacts/", payload);
    return data as Artefact;
  },

  update: async (id: number, payload: Artefact) => {
    const { data } = await apiClient.put(`/artefacts/${id}`, payload);
    return data as Artefact | { message: string };
  },

  remove: async (id: number) => {
    const { data, status } = await apiClient.delete(`/artefacts/${id}`);
    return (
      (data as { ok?: boolean } | { message: string }) ?? { ok: status === 200 }
    );
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/artefacts/${id}`); // este no cambia
    return data as Artefact;
  },

  uploadPicture: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("picture", file);
    const { data } = await apiClient.post(
      `/artefacts/${id}/picture`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data as Picture;
  },

  uploadHistoricalRecord: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("document", file);
    const { data } = await apiClient.post(
      `/artefacts/${id}/historical-record`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data as HistoricalRecord;
  },

  createMention: async (payload: Omit<Mention, "id">) => {
    const { data } = await apiClient.post("/mentions/", payload);
    return data as Mention;
  },

  getMentionsByArtefactId: async (artefactId: number) => {
    const { data } = await apiClient.get(`/mentions/by-artefact/${artefactId}`);
    return data as Mention[];
  },

  updateMention: async (
    artefactId: number,
    mentionId: number,
    payload: {
      title?: string;
      url?: string;
      link?: string;
      description?: string;
    }
  ) => {
    const { data } = await apiClient.put(
      `/mentions/${mentionId}`,
      payload
    );
    return data;
  },

  deleteMention: async (artefactId: number, mentionId: number) => {
    await apiClient.delete(`/mentions/${mentionId}`);
  },
};
