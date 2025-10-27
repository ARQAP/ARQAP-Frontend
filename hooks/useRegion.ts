import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateRegionPayload, RegionRepository } from "../repositories/regionRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["regions"];

export const useAllRegions = () => {
    const { data: token } = useIsAuthenticated();
    return useQuery({
        queryKey: KEY,
        queryFn: RegionRepository.getAll,
        enabled: !!token,
    });
};

export const useCreateRegion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRegionPayload) => RegionRepository.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useUpdateRegion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: CreateRegionPayload }) => RegionRepository.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useDeleteRegion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => RegionRepository.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};
