import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PhysicalLocation,
  PhysicalLocationRepository,
  LevelNumber,
  ColumnLetter,
} from "@/repositories/physicalLocationRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["physical-locations"];

export const usePhysicalLocations = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: PhysicalLocationRepository.getAll,
    enabled: !!token,
    staleTime: 60_000,
  });
};

export const useCreatePhysicalLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { level: LevelNumber; column: ColumnLetter; shelfId: number }) =>
      PhysicalLocationRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdatePhysicalLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PhysicalLocation> }) =>
      PhysicalLocationRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useDeletePhysicalLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PhysicalLocationRepository.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

// Helpers para mapear tu grid a enums del backend:
export const indexToLevel = (levelIndex: number): LevelNumber =>
  (levelIndex + 1) as LevelNumber;  // 0->1, 1->2, 2->3, 3->4

export const indexToColumn = (colIndex: number): ColumnLetter =>
  (["A", "B", "C", "D"][colIndex] ?? "A") as ColumnLetter;