import { useQuery } from "@tanstack/react-query";
import { customFetch, LearningPathDetail } from "@workspace/api-client-react";

export const getLearningPathDetails = async (slug: string, options?: RequestInit): Promise<LearningPathDetail> => {
  return customFetch<LearningPathDetail>(`/api/learning-paths/${slug}`, {
    ...options,
    method: 'GET'
  });
};

export const useGetLearningPathDetails = (slug: string) => {
  return useQuery({
    queryKey: ['/api/learning-paths', slug],
    queryFn: ({ signal }) => getLearningPathDetails(slug, { signal })
  });
};
