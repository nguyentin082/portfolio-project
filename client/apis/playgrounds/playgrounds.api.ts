import instance from '@/lib/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DomainEnum } from '@/types/enum';

export interface PlaygroundData {
    id: string;
    userId: string;
    domainName: DomainEnum;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface PlaygroundsResponse {
    success: boolean;
    data: PlaygroundData[];
    error?: string;
}

export interface CreatePlaygroundDto {
    domainName: DomainEnum;
    name: string;
}

export interface CreatePlaygroundResponse {
    success: boolean;
    data: PlaygroundData;
    error?: string;
}

// Get all playgrounds for current user
export async function getUserPlaygrounds(): Promise<PlaygroundsResponse> {
    const response = await instance.get('/playgrounds');
    return response.data;
}

// Create new playground
export async function createPlayground(
    data: CreatePlaygroundDto
): Promise<CreatePlaygroundResponse> {
    const response = await instance.post('/playgrounds', data);
    return response.data;
}

// Get single playground by ID
export async function getPlaygroundById(id: string): Promise<PlaygroundData> {
    const response = await instance.get(`/playgrounds/${id}`);
    return response.data;
}

// React Query hooks
export function usePlaygrounds() {
    return useQuery({
        queryKey: ['playgrounds'],
        queryFn: getUserPlaygrounds,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

export function useCreatePlayground() {
    return useMutation({
        mutationFn: createPlayground,
        onSuccess: () => {
            // Could invalidate and refetch playgrounds here
            // queryClient.invalidateQueries(['playgrounds']);
        },
    });
}
