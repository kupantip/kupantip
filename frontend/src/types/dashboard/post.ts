export interface Attachment {
  id: string;
  url: string;
  mime_type: string;
}

export interface Post {
  id: string;
  title: string;
  body_md: string;
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
  vote_count: number;
  vote_score: number;
  liked_by_requesting_user: boolean;
  disliked_by_requesting_user: boolean;
}

export type Comment = {
  id: string
  post_id: string
  post_title: string
  author_id: string
  parent_id: string | null
  body_md: string
  created_at: string // ISO date string
  updated_at: string // ISO date string
  deleted_at: string | null
  author_name: string
  minutes_since_commented: number
  reply_count: number
  replies: Comment[] // recursive type
  vote_count: number
	vote_score: number
	liked_by_requesting_user: boolean
	disliked_by_requesting_user: boolean
  post_author_name: string;
  post_minutes_since_posted: number;
  post_comment_count: number;
  post_vote_score: number;
}

export type CommentsResponse = {
  message: string
  comments: Comment[] | []
}

export type Category = {
	id: string;
	label: string;
	color_hex: string | null;
	detail: string | null;
	relevance_score: number;
};

