import { apiClient } from "@/lib/api";
import { getToken } from "@/services/authStorage";

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
    files.forEach((f, index) => {
      // En React Native, f es { uri, name, type }
      // En Web, f es un File object
      if (f.uri) {
        // React Native - necesita configuración específica
        const fileObject = {
          uri: f.uri,
          name: f.name || `ficha_${index}.jpg`,
          type: f.type || "image/jpeg",
        };
        form.append("fichas[]", fileObject as any);
      } else {
        // Web
        form.append("fichas[]", f);
      }
    });

    try {
      const { data } = await apiClient.post(`/inplClassifiers/`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 segundos de timeout
      });
      return data as INPLClassifierDTO;
    } catch (error: any) {
      console.error("Error in INPL create:", error);
      throw error;
    }
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
    files.forEach((f) => {
      // En React Native, f es { uri, name, type }
      // En Web, f es un File object
      if (f.uri) {
        // React Native
        form.append("fichas[]", f as any);
      } else {
        // Web
        form.append("fichas[]", f);
      }
    });
    // No establecer Content-Type manualmente, axios lo hará automáticamente
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

  // Nueva función para generar URL autenticada para móviles
  fichaDownloadUrlWithAuth: async (fichaId: number) => {
    const token = await getToken();
    const baseUrl = apiClient.defaults.baseURL || "";
    const url = `${baseUrl}/inplFichas/${fichaId}/download`;
    return token ? `${url}?auth=${encodeURIComponent(token)}` : url;
  },

  fetchFichaBlob: async (fichaId: number) => {
    const res = await apiClient.get(`/inplFichas/${fichaId}/download`, {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};
