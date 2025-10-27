import { useQuery } from "@tanstack/react-query";
import { ArtefactRepository } from "@/repositories/artefactRepository";

export const useMentionsByArtefactId = (id?: number) =>
  useQuery({
    queryKey: ["mentions", id],
    queryFn: () => ArtefactRepository.getMentionsByArtefactId(id!),
    enabled: !!id,
  });