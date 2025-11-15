import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { Post, Comment } from '@/types/dashboard/post';
import { User } from '@/types/dashboard/user';

const instance = axios.create({
    baseURL: '/backend',
    timeout: 10000,
});

export interface SearchResponse {
    posts: Post[];
    comments: Comment[];
    users: User[];
}

export const searchAll = async (query: string): Promise<SearchResponse> => {
    if (!query) {
        return { posts: [], comments: [], users: []};
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