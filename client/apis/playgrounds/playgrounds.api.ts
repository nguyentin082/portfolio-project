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
export async function getUserPlaygrounds(options?: {
    sort?: string | Record<string, any>;
    order?: 'asc' | 'desc';
    where?: object;
    page?: number;
    limit?: number;
}): Promise<PlaygroundsResponse> {
    const params = new URLSearchParams();

    if (options?.sort) {
        if (typeof options.sort === 'object') {
            params.append('sort', JSON.stringify(options.sort));
        } else {
            params.append('sort', options.sort);
        }
    }

    if (options?.order) {
        params.append('order', options.order);
    }

    if (options?.where) {
        params.append('where', JSON.stringify(options.where));
    }

    if (options?.page) {
        params.append('page', options.page.toString());
    }

    if (options?.limit) {
        params.append('limit', options.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/playgrounds?${queryString}` : '/playgrounds';

    const response = await instance.get(url);
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
export function usePlaygrounds(options?: {
    sort?: string | Record<string, any>;
    order?: 'asc' | 'desc';
    where?: object;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: ['playgrounds', options],
        queryFn: () => getUserPlaygrounds(options),
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
            // Invalidate all playgrounds queries regardless of options
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
            // Invalidate all playgrounds queries regardless of options
            queryClient.invalidateQueries({ queryKey: ['playgrounds'] });
        },
    });
}

export function useDeletePlayground() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePlayground,
        onSuccess: () => {
            // Invalidate all playgrounds queries regardless of options
            queryClient.invalidateQueries({ queryKey: ['playgrounds'] });
        },
    });
}
