import { Post, Comment, Category } from '@/types/dashboard/post';

export interface User {
  id: string;
  user_id: string;
  role?: string;
  email?: string;
  handle?: string;
  display_name: string;
  relevance_score: number;
}

export interface BanResponse {
  message: string;
  reason: string;
  end_at: string;
  status: number;
}

export interface SearchResponse { 
  posts: Post[];
  comments: Comment[];
  users: User[];
  categories: Category[];
}