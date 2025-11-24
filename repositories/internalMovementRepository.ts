import { apiClient } from "@/lib/api";
import type { Artefact } from "./artefactRepository";
import type { PhysicalLocation } from "./physicalLocationRepository";
import type { Requester } from "./requesterRepository";

export type InternalMovement = {
  id?: number;
  movementDate: string; // Date en formato ISO
  movementTime: string; // Time en formato ISO
  returnDate?: string | null; // Date en formato ISO (opcional)
  returnTime?: string | null; // Time en formato ISO (opcional)
  artefactId: number;
  artefact?: Artefact | null;
  fromPhysicalLocationId?: number | null;
  fromPhysicalLocation?: PhysicalLocation | null;
  toPhysicalLocationId?: number | null;
  toPhysicalLocation?: PhysicalLocation | null;
  reason?: string | null;
  observations?: string | null;
  requesterId?: number | null;
  requester?: Requester | null;
  groupMovementId?: number | null; // Para agrupar movimientos creados juntos
};

export const InternalMovementRepository = {
  getAll: async () => {
    const { data } = await apiClient.get("/internal-movements/");
    return data as InternalMovement[];
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/internal-movements/${id}`);
    return data as InternalMovement;
  },

  getByArtefactId: async (artefactId: number) => {
    const { data } = await apiClient.get(`/internal-movements/artefact/${artefactId}`);
    return data as InternalMovement[];
  },

  getActiveByArtefactId: async (artefactId: number) => {
    try {
      const { data } = await apiClient.get(`/internal-movements/artefact/${artefactId}/active`);
      return data as InternalMovement;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (payload: InternalMovement) => {
    const { data } = await apiClient.post("/internal-movements/", payload);
    return data as InternalMovement;
  },

  createBatch: async (payloads: InternalMovement[]) => {
    const { data } = await apiClient.post("/internal-movements/batch", payloads);
    return data as InternalMovement[];
  },

  update: async (id: number, payload: InternalMovement) => {
    const { data } = await apiClient.put(`/internal-movements/${id}`, payload);
    return data as InternalMovement;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/internal-movements/${id}`);
    return data as { ok: boolean } | InternalMovement;
  },
};

