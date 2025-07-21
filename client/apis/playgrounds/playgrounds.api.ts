import instance from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export interface UpdatePlaygroundDto {
    name: string;
}

export interface CreatePlaygroundResponse {
    success: boolean;
    data: PlaygroundData;
    error?: string;
}

export interface UpdatePlaygroundResponse {
    success: boolean;
    data: PlaygroundData;
    error?: string;
}

export interface DeletePlaygroundResponse {
    success: boolean;
    message?: string;
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

// Update playground (rename)
export async function updatePlayground(
    id: string,
    data: UpdatePlaygroundDto
): Promise<UpdatePlaygroundResponse> {
    const response = await instance.put(`/playgrounds/${id}`, data);
    return response.data;
}

// Delete playground
export async function deletePlayground(
    id: string
): Promise<DeletePlaygroundResponse> {
    const response = await instance.delete(`/playgrounds/${id}`);
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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPlayground,
        onSuccess: () => {
            // Invalidate and refetch playgrounds list
            queryClient.invalidateQueries({ queryKey: ['playgrounds'] });
        },
    });
}

export function useUpdatePlayground() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlaygroundDto }) =>
            updatePlayground(id, data),
        onSuccess: () => {
            // Invalidate and refetch playgrounds list
            queryClient.invalidateQueries({ queryKey: ['playgrounds'] });
        },
    });
}

export function useDeletePlayground() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePlayground,
        onSuccess: () => {
            // Invalidate and refetch playgrounds list
            queryClient.invalidateQueries({ queryKey: ['playgrounds'] });
        },
    });
}
