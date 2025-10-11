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
  category_label: string;
  category_id: string;
  attachments: Attachment[];
  minutes_since_posted: number;
  comment_count: number;
  vote_count: number
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
  replies: Comment[] // recursive type
  minutes_since_commented: number
}

export type CommentsResponse = {
  message: string
  comments: Comment[] | []
}
