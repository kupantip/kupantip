import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { SearchResponse, User } from '@/types/dashboard/user';

const instance = axios.create({
    baseURL: '/api/proxy',
    timeout: 10000,
});

export const searchUsers = async (token: string, query: string): Promise<{ data: User[] }> => {
    const response = await instance.get<SearchResponse>('/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { query, type: 'user' },
    });
    
    return { data: response.data.users || [] };
};

export const searchAll = async (query: string): Promise<SearchResponse> => {
    if (!query) {
        return { posts: [], comments: [], users: [], categories: []};
    }

    try {
        const session = await getSession();
        const header = {
            Authorization: `Bearer ${session?.user?.accessToken}`,
        };

        const response = await instance.get<SearchResponse>('/search', {
            headers: header,
            params: { query: query },
        });
        
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Failed to fetch search results: ${error.response?.status}`);
        }
        throw new Error("An unknown error occurred during search.");
    }
};

export function useSearch(query: string | null) {
    return useQuery<SearchResponse, Error>({
        queryKey: ['search', query], 
        
        queryFn: () => searchAll(query || ''),

        enabled: !!query, 
    });
}