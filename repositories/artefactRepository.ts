import { apiClient } from "@/lib/api";
import { InternalClassifier } from "./internalClassifierRepository";

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
  material: string; // Ya no es opcional
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
  internalClassifier?: InternalClassifier | null;
  physicalLocationId?: number | null;
  physicalLocation?: unknown | null;
};

export type ArtefactSummary = {
  id: number;
  name: string;
  material: string;
  collectionName?: string | null;
  archaeologistName?: string | null;
  archaeologicalSiteName?: string | null;
  shelfCode?: number | null;
  level?: number | null;
  column?: string | null;
};

export type CreateArtefactWithMentionsPayload = {
  artefact: Artefact;
  mentions: Array<{
    title: string;
    link?: string | null;
    description?: string | null;
  }>;
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
  getAll: async (filters?: { shelfId?: number }) => {
    // Limpiar filtros undefined/null
    const cleanFilters: Record<string, any> = {};
    if (filters?.shelfId !== undefined && filters?.shelfId !== null && !isNaN(filters.shelfId)) {
      cleanFilters.shelfId = filters.shelfId;
    }
    
    const { data } = await apiClient.get("/artefacts", {
      params: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
    });
    return data as Artefact[];
  },

  getSummaries: async (filters?: { shelfId?: number }) => {
    // Limpiar filtros undefined/null
    const cleanFilters: Record<string, any> = {};
    if (filters?.shelfId !== undefined && filters?.shelfId !== null && !isNaN(filters.shelfId)) {
      cleanFilters.shelfId = filters.shelfId;
    }
    
    const { data } = await apiClient.get("/artefacts/summaries", {
      params: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
    });
    return data as ArtefactSummary[];
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
    const { data } = await apiClient.put(`/mentions/${mentionId}`, payload);
    return data;
  },

  deleteMention: async (artefactId: number, mentionId: number) => {
    await apiClient.delete(`/mentions/${mentionId}`);
  },

  createWithMentions: async (payload: CreateArtefactWithMentionsPayload) => {
    const { data } = await apiClient.post("/artefacts/with-mentions", payload);
    return data as Artefact;
  },

  importFromExcel: async (file: File | any) => {
    console.log("[REPO] ===== INICIO importFromExcel =====");
    console.log("[REPO] Archivo recibido:", file);
    console.log("[REPO] Tipo de archivo:", typeof file);
    console.log("[REPO] ¿Tiene URI?", !!file?.uri);
    console.log("[REPO] ¿Tiene name?", !!file?.name);
    console.log("[REPO] ¿Tiene type?", !!file?.type);
    console.log("[REPO] Archivo completo:", JSON.stringify(file, null, 2));
    
    const formData = new FormData();
    
    // En React Native, el archivo viene como objeto con uri, name, type
    // En web, viene como File
    if (file.uri) {
      console.log("[REPO] Es mobile, preparando objeto para FormData");
      // Mobile: crear objeto compatible con FormData de React Native
      const fileObject = {
        uri: file.uri,
        name: file.name || "archivo.xlsx",
        type: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
      console.log("[REPO] FileObject:", JSON.stringify(fileObject, null, 2));
      console.log("[REPO] Agregando archivo mobile a FormData...");
      formData.append("file", fileObject as any);
      console.log("[REPO] ✅ Archivo agregado a FormData");
    } else {
      // Web: usar el File directamente
      console.log("[REPO] Es web, agregando archivo directamente");
      formData.append("file", file);
      console.log("[REPO] ✅ Archivo agregado a FormData");
    }
    
    console.log("[REPO] ===== ENVIANDO REQUEST =====");
    console.log("[REPO] URL: /artefacts/import");
    console.log("[REPO] Headers: Content-Type: multipart/form-data");
    
    // Establecer Content-Type como en uploadPicture y uploadHistoricalRecord
    // que sí funcionan en mobile
    try {
      const startTime = Date.now();
      console.log("[REPO] Iniciando POST request...");
      
      const { data } = await apiClient.post("/artefacts/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const duration = Date.now() - startTime;
      console.log("[REPO] ===== RESPUESTA RECIBIDA =====");
      console.log("[REPO] Tiempo de respuesta:", duration, "ms");
      console.log("[REPO] Respuesta:", JSON.stringify(data, null, 2));
      return data as {
        message: string;
        imported: number;
        errors: string[];
      };
    } catch (error: any) {
      console.error("[REPO] ===== ERROR EN REQUEST =====");
      console.error("[REPO] Error completo:", error);
      console.error("[REPO] Error response:", error?.response?.data);
      console.error("[REPO] Error status:", error?.response?.status);
      console.error("[REPO] Error message:", error?.message);
      console.error("[REPO] Error config:", error?.config);
      if (error?.response) {
        console.error("[REPO] Response headers:", error?.response?.headers);
        console.error("[REPO] Response status text:", error?.response?.statusText);
      }
      throw error;
    }
  },
};
