export interface Attachment {
  id: string;
  url: string;
  mime_type: string;
}

export interface Post {
  id: string;
  title: string;
  body_md: string | null;
  url: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  author_name: string;
  author_id: string;
  category_label: string | null;
  category_id: string | null;
  attachments: Attachment[];
  minutes_since_posted: number;
  comment_count: number;
  vote_count: number
  vote_score: number
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  body_md: string
  created_at: string // ISO date string
  updated_at: string // ISO date string
  deleted_at: string | null
  author_name: string
  minutes_since_commented: number
  reply_count: number
  vote_count: number
  replies: Comment[] // recursive type
  
}

export type CommentsResponse = {
  message: string
  comments: Comment[] | []
}

